import { defaultNS } from 'link-lib'
import {
	BlankNode,
	Literal,
	NamedNode,
	Namespace,
	Statement,
} from 'rdflib'
import { NS } from '../LRS'

/**
 * Link-lib has been designed to process delta's. Every action on the server should return a description
 * of the difference between the state before and after the action, thus synchronizing the front-end
 * with the back-end state without duplicate logic.
 *
 * @see https://github.com/ontola/linked-delta for definitions (they're pretty obvious though).
 */
const addGraph = (graph) => defaultNS.ll(`add?graph=${encodeURIComponent(graph.value)}`);
const replace = defaultNS.ll('replace');
const replaceGraph = (graph) => defaultNS.ll(`replace?graph=${encodeURIComponent(graph.value)}`);

// We build IRI's manually here, but real-world would abstract this into the data via declarative forms.
function actionIRI(subject, action, payload = {}) {
	const query = [
		subject && `iri=${subject.value}`,
		...Object.entries(payload).map(([k, v]) => [k, encodeURIComponent(v)].join('=')),
	].filter(Boolean).join('&');

	return NS.app(`todo/${action}?${query}`);
}

const todoMiddleware = (store) => {
	// Register our namespace, this will contain app-specific models (we could use any RDF todo model)
	store.namespaces.app = new Namespace("https://fletcher91.github.io/link-redux-todo/");
	const NS = store.namespaces;

	store.addOntologySchematics([
		new Statement(NS.app('#/'), NS.owl('sameAs'), NS.app('/')),
	]);

	const processDeltaNow = (delta) => {
		return store.processDelta(delta, true);
	}

	const namespaceForList = (listIRI) => Namespace(`${listIRI.value}#`);

	const createTODOList = (listIRI) => {
		const todoNS = namespaceForList(listIRI);

		return [
			[listIRI, NS.rdf('type'), NS.app('TodoList'), addGraph(listIRI)],
			[listIRI, NS.rdf('type'), NS.rdfs('Bag'), addGraph(listIRI)],
			[listIRI, NS.schema('name'), new Literal("todos"), addGraph(listIRI)],
			[listIRI, NS.app('completedCount'), Literal.fromValue(1), addGraph(listIRI)],
			[listIRI, NS.schema('potentialAction'), NS.app('actions/new'), addGraph(listIRI)],

			// Create action
			[todoNS('actions/new'), NS.rdf('type'), NS.schema('CreateAction'), addGraph(listIRI)],
			[todoNS('actions/new'), NS.schema('object'), todoNS('actions/new/entry'), addGraph(listIRI)],

			[todoNS('actions/new/entry'), NS.rdf('type'), NS.schema('EntryPoint'), addGraph(listIRI)],
			[todoNS('actions/new/entry'), NS.schema('httpMethod'), new Literal('POST'), addGraph(listIRI)],
			[todoNS('actions/new/entry'), NS.schema('urlTemplate'), new Literal('EntryPoint'), addGraph(listIRI)],
		];
	}

	// Normally, we'd define functions that transition our _application state_ here (dialogs, modals,
	// etc), but we'll implement the transitions the server would normally return (why implement logic twice?).
	const createTODO = (listIRI, text) => {
		const newTodo = new BlankNode();

		return [
			[newTodo, NS.rdf('type'), NS.app('TodoItem'), addGraph(listIRI)],
			[newTodo, NS.schema('text'), new Literal(text), addGraph(listIRI)],
			// We use string false here due to a bug in the parser/serializer
			[newTodo, NS.app('completed'), new Literal("false"), addGraph(listIRI)],
			[listIRI, NS.rdfs('member'), newTodo, addGraph(listIRI)],
		];
	};

	const toggleCompleted = (listIRI, subject) => {
		const completed = store.getResourceProperty(subject, NS.app('completed'));

		const next = Literal.fromValue(completed?.value === 'true' ? 'false' : 'true');
		return [
			[subject, NS.app('completed'), next, replaceGraph(listIRI)],
		];
	};

	// We don't have a purge commando in the delta system yet, so we have to collect and remove
	// the statements manually for now.
	const removeTODO = (subject) => {
		const data = store.store.statementsFor(subject);
		data.push(...store.store.match(null, null, subject)); // Also remove references to this todo.
		store.store.removeStatements(data);
		store.broadcastWithExpedite(true);
	};

	const updateText = (listIRI, subject, text) => [
			[subject, NS.schema('text'), Literal.fromValue(text), replaceGraph(listIRI)],
	];

	const updateTitle = (listIRI, title) => [
			[listIRI, NS.schema('name'), Literal.fromValue(title), replaceGraph(listIRI)],
  ]

	/**
	 * Create an object for our action dispatchers, this eases executing (application based) actions
	 * It also creates a nice interface between components and the action IRI's for faster refactoring
	 *
	 * When executing these methods from app code, the action will be scheduled for processing. Actual
	 * data changes will be made by the middleware handler below.
	 */
	store.actions.todo = {};
	store.actions.todo.create = (todoList, text) => store.exec(actionIRI(
		undefined,
		'create',
		{ todoList: todoList.value, text }
	));
	store.actions.todo.updateTitle = (todoList, title) => store.exec(actionIRI(undefined, 'updateTitle', { todoList: todoList.value, title }));
	store.actions.todo.update = (todoList, subject, text) => store.exec(actionIRI(subject, 'update', { todoList: todoList.value, text }));
	store.actions.todo.toggle = (todoList, subject) => store.exec(actionIRI(subject, 'toggle', { todoList: todoList.value }));
	store.actions.todo.remove = (subject) => store.exec(actionIRI(subject, 'remove'));
	store.actions.todo.clearCompleted = () => store.exec(actionIRI(undefined, 'clearComplete'));
	store.actions.todo.initialize = (subject) => store.exec(actionIRI(subject, 'initialize'));
	store.actions.todo.save = (subject) => store.exec(actionIRI(subject, 'save'));

	/**
	 * Middleware handler
	 */
	return next => (iri, opts) => {
		if (!iri.value.startsWith(NS.app('todo/').value)) {
			return next(iri, opts);
		}

		if (iri.value.startsWith(NS.app('todo/create').value)) {
			const todoList = new NamedNode(new URL(iri.value).searchParams.get('todoList'));
			const text = new URL(iri.value).searchParams.get('text');
			return processDeltaNow(createTODO(todoList, decodeURIComponent(text)));
		}

		if (iri.value.startsWith(NS.app('todo/updateTitle').value)) {
			const todoList = new NamedNode(new URL(iri.value).searchParams.get('todoList'));
			const title = new URL(iri.value).searchParams.get('title');
			return processDeltaNow(updateTitle(todoList, decodeURIComponent(title)));
		}

		/**
		 * Normally, this would also be a server action (this is the web, so we'd actually want
		 * to use the internet connection...), but this is a recreation of the side-effects so
		 * we're manipulating the store directly (hence the break in the law of demeter `store.store.x`)
		 */
		if (iri.value.startsWith(NS.app('todo/clearComplete').value)) {
			const completed = store
				.store
				.match(null, NS.app('completed'), new Literal("true")) // Match every completed resource

			completed
				.map((stmt) => store.store.statementsFor(stmt.subject)) // Get the resources
				.map((todo) => store.store.removeStatements(todo)); // Remove the data
			completed
				.map((stmt) => store.store.match(null, NS.rdfs('member'), stmt.subject)) // Get property occurrences of the resource
				.map((stmts) => store.store.removeStatements(stmts));

			return store.broadcastWithExpedite(); // Render the changes
		}

			// IRI (internationalized resource identifier), somewhat like 'the newer version of URL'.
		const iriString = new URL(iri.value).searchParams.get('iri');
		// We need to make this an instance of NamedNode, only required when parsing strings manually
		const subject = iriString.includes(':') ? NamedNode.find(iriString) : new BlankNode(iriString);


		if (iri.value.startsWith(NS.app('todo/remove').value)) {
			return removeTODO(subject);
		}

		if (iri.value.startsWith(NS.app('todo/toggle').value)) {
			const todoList = new NamedNode(new URL(iri.value).searchParams.get('todoList'));
			return processDeltaNow(toggleCompleted(todoList, subject));
		}

		if (iri.value.startsWith(NS.app('todo/update').value)) {
			const todoList = new NamedNode(new URL(iri.value).searchParams.get('todoList'));
			const text = new URL(iri.value).searchParams.get('text');
			return processDeltaNow(updateText(todoList, subject, decodeURIComponent(text)));
		}

		if (iri.value.startsWith(NS.app('todo/initialize').value)) {
			const todoList = new NamedNode(new URL(iri.value).searchParams.get('iri'));

			return store.processDelta(createTODOList(todoList))
				.then(() => store.api.fetcher.putBack(todoList));
		}

		if (iri.value.startsWith(NS.app('todo/save').value)) {
			const resource = new URL(iri.value).searchParams.get('iri');
			return store.api.fetcher.putBack(new NamedNode(resource));
		}

			return next(iri, opts);
	};
};

export default todoMiddleware;
