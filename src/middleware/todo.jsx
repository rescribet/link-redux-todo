import { defaultNS, memoizedNamespace, namedNodeByIRI } from 'link-lib'
import {
	BlankNode,
	Literal,
	Statement,
} from 'rdflib'

/**
 * Link-lib has been designed to process delta's. Every action on the server should return a description
 * of the difference between the state before and after the action, thus synchronizing the front-end
 * with the back-end state without duplicate logic.
 *
 * @see https://github.com/ontola/linked-delta for definitions (they're pretty obvious though).
 */
const add = defaultNS.ll('add');
const replace = defaultNS.ll('replace');

const todoMiddleware = (store) => {
	// Register our namespace, this will contain app-specific models (we could use any RDF todo model,
	// but this is a demo, so keep it simple). See the webpack config for the value.
	store.namespaces.app = memoizedNamespace(FRONTEND_ROUTE);
	const NS = store.namespaces;

	store.addOntologySchematics([
		new Statement(NS.app('#/'), NS.owl('sameAs'), NS.app('/')),
	]);

	// Temporary workaround until expedite (`processDelta([], true)`) is properly tuned for UI
	// interaction (should be <20ms, but currently is ±100ms)
	const processDeltaNow = (delta) => {
		store.store.processDelta(delta);
		store.processBroadcast();
	}

	// Since we don't have a server, we create our own data by mocking the initial response.
	store.processDelta([
		// Homepage
		new Statement(NS.app('#/'), NS.rdf('type'), NS.app('TodoList'), add),
		new Statement(NS.app('#/'), NS.rdf('type'), NS.rdfs('Bag'), add),
		new Statement(NS.app('#/'), NS.schema('name'), new Literal("todos"), add),
		new Statement(NS.app('#/'), NS.app('completedCount'), Literal.fromValue(1), add),
		new Statement(NS.app('#/'), NS.rdfs('member'), NS.app('todos/1'), add),
		new Statement(NS.app('#/'), NS.rdfs('member'), NS.app('todos/2'), add),
		new Statement(NS.app('#/'), NS.schema('potentialAction'), NS.app('actions/new'), add),

		// Create action
		new Statement(NS.app('actions/new'), NS.rdf('type'), NS.schema('CreateAction'), add),
		new Statement(NS.app('actions/new'), NS.schema('object'), NS.app('actions/new/entry'), add),

		new Statement(NS.app('actions/new/entry'), NS.rdf('type'), NS.schema('EntryPoint'), add),
		new Statement(NS.app('actions/new/entry'), NS.schema('httpMethod'), new Literal('POST'), add),
		new Statement(NS.app('actions/new/entry'), NS.schema('urlTemplate'), new Literal('EntryPoint'), add),

		// First todo
		new Statement(NS.app('todos/1'), NS.rdf('type'), NS.app('TodoItem'), add),
		new Statement(NS.app('todos/1'), NS.schema('text'), new Literal('Something to do'), add),
		new Statement(NS.app('todos/1'), NS.app('completed'), Literal.fromValue(false), add),

		// Second todo
		new Statement(NS.app('todos/2'), NS.rdf('type'), NS.app('TodoItem'), add),
		new Statement(NS.app('todos/2'), NS.schema('text'), new Literal('This has been done'), add),
		new Statement(NS.app('todos/2'), NS.app('completed'), Literal.fromValue(true), add),
	]);

	// Normally, we'd define functions that transition our _application state_ here (dialogs, modals,
	// etc), but we'll implement the transitions the server would normally return (why implement logic twice?).
	const createTODO = (text) => {
		const newTodo = new BlankNode();
		return [
			new Statement(newTodo, NS.rdf('type'), NS.app('TodoItem'), add),
			new Statement(newTodo, NS.schema('text'), new Literal(text), add),
			new Statement(newTodo, NS.app('completed'), Literal.fromValue(false), add),
			new Statement(NS.app('#/'), NS.rdfs('member'), newTodo, add),
		];
	};

	const toggleCompleted = (subject) => {
		const completed = store.getResourceProperty(subject, NS.app('completed'));

		const next = Literal.fromValue(completed.value === '0');
		return [
			new Statement(subject, NS.app('completed'), next, replace)
		];
	};

	// We don't have a purge commando in the delta system yet, so we have to collect and remove
	// the statements manually for now.
	const removeTODO = (subject) => {
		const data = store.store.statementsFor(subject);
		data.push(...store.store.match(null, null, subject)); // Also remove references to this todo.
		store.store.removeStatements(data);
		store.processBroadcast();
	};

	const updateText = (subject, text) => [
			new Statement(subject, NS.schema('text'), Literal.fromValue(text), replace)
	];

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
			store
				.store
				.match(null, NS.app('completed'), Literal.fromValue(true)) // Match every completed resource
				.map((s) => store.store.statementsFor(s.subject)) // Get the data
				.map((todo) => store.store.removeStatements(todo)); // Remove the data
			return store.processBroadcast();
		}

			// IRI (internationalized resource identifier), somewhat like 'the newer version of URL'.
		const iriString = new URL(iri.value).searchParams.get('iri');
		// We need to make this an instance of NamedNode, only required when parsing strings manually
		const subject = iriString.includes(':') ? namedNodeByIRI(iriString) : new BlankNode(iriString);


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
