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
const add = defaultNS.ll('add');
const replace = defaultNS.ll('replace');

// We build IRI's manually here, but real-world would abstract this into the data via declarative forms.
function actionIRI(subject, action, payload = {}) {
	const query = [
		subject && `iri=${subject.value}`,
		Object.entries(payload).map(([k, v]) => [k, encodeURIComponent(v)].join('=')),
	].join('&');

	return NS.app(`todo/${action}?${query}`);
}

const todoMiddleware = (store) => {
	// Register our namespace, this will contain app-specific models (we could use any RDF todo model,
	// but this is a demo, so keep it simple). See the webpack config for the value.
	store.namespaces.app = new Namespace(FRONTEND_ROUTE);
	const NS = store.namespaces;

	store.addOntologySchematics([
		new Statement(NS.app('#/'), NS.owl('sameAs'), NS.app('/')),
	]);

	const processDeltaNow = (delta) => {
		store.processDelta(delta, true);
	}

	// Since we don't have a server, we create our own data by mocking the initial response.
	store.processDelta([
		// Homepage
		[NS.app('#/'), NS.rdf('type'), NS.app('TodoList'), add],
		[NS.app('#/'), NS.rdf('type'), NS.rdfs('Bag'), add],
		[NS.app('#/'), NS.schema('name'), new Literal("todos"), add],
		[NS.app('#/'), NS.app('completedCount'), Literal.fromValue(1), add],
		[NS.app('#/'), NS.rdfs('member'), NS.app('todos/1'), add],
		[NS.app('#/'), NS.rdfs('member'), NS.app('todos/2'), add],
		[NS.app('#/'), NS.schema('potentialAction'), NS.app('actions/new'), add],

		// Create action
		[NS.app('actions/new'), NS.rdf('type'), NS.schema('CreateAction'), add],
		[NS.app('actions/new'), NS.schema('object'), NS.app('actions/new/entry'), add],

		[NS.app('actions/new/entry'), NS.rdf('type'), NS.schema('EntryPoint'), add],
		[NS.app('actions/new/entry'), NS.schema('httpMethod'), new Literal('POST'), add],
		[NS.app('actions/new/entry'), NS.schema('urlTemplate'), new Literal('EntryPoint'), add],

		// First todo
		[NS.app('todos/1'), NS.rdf('type'), NS.app('TodoItem'), add],
		[NS.app('todos/1'), NS.schema('text'), new Literal('Something to do'), add],
		[NS.app('todos/1'), NS.app('completed'), Literal.fromValue(false), add],

		// Second todo
		[NS.app('todos/2'), NS.rdf('type'), NS.app('TodoItem'), add],
		[NS.app('todos/2'), NS.schema('text'), new Literal('This has been done'), add],
		[NS.app('todos/2'), NS.app('completed'), Literal.fromValue(true), add],
	]);

	// Normally, we'd define functions that transition our _application state_ here (dialogs, modals,
	// etc), but we'll implement the transitions the server would normally return (why implement logic twice?).
	const createTODO = (text) => {
		const newTodo = new BlankNode();
		return [
			[newTodo, NS.rdf('type'), NS.app('TodoItem'), add],
			[newTodo, NS.schema('text'), new Literal(text), add],
			[newTodo, NS.app('completed'), Literal.fromValue(false), add],
			[NS.app('#/'), NS.rdfs('member'), newTodo, add],
		];
	};

	const toggleCompleted = (subject) => {
		const completed = store.getResourceProperty(subject, NS.app('completed'));

		const next = Literal.fromValue(completed.value === '0');
		return [
			[subject, NS.app('completed'), next, replace],
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

	const updateText = (subject, text) => [
			[subject, NS.schema('text'), Literal.fromValue(text), replace],
	];

	/**
	 * Create an object for our action dispatchers, this eases executing (application based) actions
	 * It also creates a nice interface between components and the action IRI's for faster refactoring
	 *
	 * When executing these methods from app code, the action will be scheduled for processing. Actual
	 * data changes will be made by the middleware handler below.
	 */
	store.actions.todo = {};
	store.actions.todo.create = (text) => store.exec(actionIRI(undefined, 'create', { text }));
	store.actions.todo.update = (subject, text) => store.exec(actionIRI(subject, 'update', { text }));
	store.actions.todo.toggle = (subject) => store.exec(actionIRI(subject, 'toggle'));
	store.actions.todo.remove = (subject) => store.exec(actionIRI(subject, 'remove'));
	store.actions.todo.clearCompleted = () => store.exec(actionIRI(undefined, 'clearComplete'));

	/**
	 * Middleware handler
	 */
	return next => (iri, opts) => {
		if (!iri.value.startsWith(NS.app('todo/').value)) {
			return next(iri, opts);
		}

		if (iri.value.startsWith(NS.app('todo/create').value)) {
			const text = new URL(iri.value).searchParams.get('text');
			return processDeltaNow(createTODO(decodeURIComponent(text)));
		}

		/**
		 * Normally, this would also be a server action (this is the web, so we'd actually want
		 * to use the internet connection...), but this is a recreation of the side-effects so
		 * we're manipulating the store directly (hence the break in the law of demeter `store.store.x`)
		 */
		if (iri.value.startsWith(NS.app('todo/clearComplete').value)) {
			const completed = store
				.store
				.match(null, NS.app('completed'), Literal.fromValue(true)) // Match every completed resource

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
			return processDeltaNow(removeTODO(subject));
		}

		if (iri.value.startsWith(NS.app('todo/toggle').value)) {
			return processDeltaNow(toggleCompleted(subject));
		}

		if (iri.value.startsWith(NS.app('todo/update').value)) {
			const text = new URL(iri.value).searchParams.get('text');
			return processDeltaNow(updateText(subject, decodeURIComponent(text)));
		}

			return next(iri, opts);
	};
};

export default todoMiddleware;
