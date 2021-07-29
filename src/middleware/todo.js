import rdf, { createNS } from '@ontologies/core'
import owl from '@ontologies/owl'
import rdfx from '@ontologies/rdf'
import rdfs from '@ontologies/rdfs'
import schema from '@ontologies/schema'

import { NS } from '../LRS'

/**
 * Link-lib has been designed to process delta's. Every action on the server should return a description
 * of the difference between the state before and after the action, thus synchronizing the front-end
 * with the back-end state without duplicate logic.
 *
 * @see https://github.com/ontola/linked-delta for definitions (they're pretty obvious though).
 */

const ll = createNS("http://purl.org/link-lib/");
const add = ll('add');
const replace = ll('replace');
const meta = ll('meta');

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
	store.namespaces.app = createNS(FRONTEND_ROUTE);
	const NS = store.namespaces;

	store.addOntologySchematics([
		rdf.quad(NS.app('#/'), owl.sameAs, NS.app('/')),
	]);

	const processDeltaNow = (delta) => {
		store.processDelta(delta, true);
	}

	// Since we don't have a server, we create our own data by mocking the initial response.
	store.processDelta([
		// Homepage
		[NS.app('#/'), rdf.namedNode("http://www.w3.org/2011/http#statusCode"), rdf.literal(200), meta],
		[NS.app('#/'), rdfx.type, NS.app('TodoList'), add],
		[NS.app('#/'), rdfx.type, rdfs.Bag, add],
		[NS.app('#/'), schema.name, rdf.literal("todos"), add],
		[NS.app('#/'), NS.app('completedCount'), rdf.literal(1), add],
		[NS.app('#/'), rdfs.member, NS.app('todos/1'), add],
		[NS.app('#/'), rdfs.member, NS.app('todos/2'), add],
		[NS.app('#/'), schema.potentialAction, NS.app('actions/new'), add],

		// Create action
		[NS.app('actions/new'), rdf.namedNode("http://www.w3.org/2011/http#statusCode"), rdf.literal(200), meta],
		[NS.app('actions/new'), rdfx.type, schema.CreateAction, add],
		[NS.app('actions/new'), schema.object, NS.app('actions/new/entry'), add],

		[NS.app('actions/new/entry'), rdf.namedNode("http://www.w3.org/2011/http#statusCode"), rdf.literal(200), meta],
		[NS.app('actions/new/entry'), rdfx.type, schema.EntryPoint, add],
		[NS.app('actions/new/entry'), schema.httpMethod, rdf.literal('POST'), add],
		[NS.app('actions/new/entry'), schema.urlTemplate, rdf.literal('EntryPoint'), add],

		// First todo
		[NS.app('todos/1'), rdf.namedNode("http://www.w3.org/2011/http#statusCode"), rdf.literal(200), meta],
		[NS.app('todos/1'), rdfx.type, NS.app('TodoItem'), add],
		[NS.app('todos/1'), schema.text, rdf.literal('Something to do'), add],
		[NS.app('todos/1'), NS.app('completed'), rdf.literal(false), add],

		// Second todo
		[NS.app('todos/2'), rdf.namedNode("http://www.w3.org/2011/http#statusCode"), rdf.literal(200), meta],
		[NS.app('todos/2'), rdfx.type, NS.app('TodoItem'), add],
		[NS.app('todos/2'), schema.text, rdf.literal('This has been done'), add],
		[NS.app('todos/2'), NS.app('completed'), rdf.literal(true), add],
	]);

	// Normally, we'd define functions that transition our _application state_ here (dialogs, modals,
	// etc), but we'll implement the transitions the server would normally return (why implement logic twice?).
	const createTODO = (text) => {
		const newTodo = rdf.blankNode();
		return [
			[newTodo, rdfx.type, NS.app('TodoItem'), add],
			[newTodo, schema.text, rdf.literal(text), add],
			[newTodo, NS.app('completed'), rdf.literal(false), add],
			[NS.app('#/'), rdfs.member, newTodo, add],
		];
	};

	const toggleCompleted = (subject) => {
		const completed = store.getResourceProperty(subject, NS.app('completed'));

		const next = rdf.literal(completed.value === "false");
		return [
			[subject, NS.app('completed'), next, replace],
		];
	};

	// We don't have a purge commando in the delta system yet, so we have to collect and remove
	// the statements manually for now.
	const removeTODO = (subject) => {
		store.store.removeQuads(store.store.match(null, null, subject));
		store.removeResource(subject);
		store.broadcastWithExpedite(true);
	};

	const updateText = (subject, text) => [
			[subject, schema.text, rdf.literal(text), replace],
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
			store
				.store
				.match(null, NS.app('completed'), rdf.literal(true)) // Match every completed resource
				.forEach((todo) => removeTODO(todo.subject));

			return store.broadcastWithExpedite(); // Render the changes
		}

			// IRI (internationalized resource identifier), somewhat like 'the newer version of URL'.
		const iriString = new URL(iri.value).searchParams.get('iri');
		// We need to make this an instance of NamedNode, only required when parsing strings manually
		const subject = iriString.includes(':') ? rdf.namedNode(iriString) : rdf.blankNode(iriString);


		if (iri.value.startsWith(NS.app('todo/remove').value)) {
			return removeTODO(subject);
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
