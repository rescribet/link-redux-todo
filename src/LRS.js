import LinkedRenderStore, { memoizedNamespace } from 'link-lib';
import { Literal, Statement } from 'rdflib';

if (!window.app) {
	window.app = {};
}
var app = window.app;

app.LRS = new LinkedRenderStore();
app.LRS.namespaces.app = memoizedNamespace('https://fletcher91.github.io/link-redux-todo/');

export const NS = app.LRS.namespaces;

app.LRS.api.registerTransformer(
	() => [],
	'text/html',
	1.0
);

// Since we're not server backed
app.LRS.store.addStatements([
	// Root resource
	new Statement(NS.app('#/'), NS.rdf('type'), NS.app('TodoList')),
	new Statement(NS.app('#/'), NS.rdf('type'), NS.rdfs('Bag')),
	new Statement(NS.app('#/'), NS.schema('name'), new Literal("todos")),
	new Statement(NS.app('#/'), NS.app('completedCount'), Literal.fromValue(1)),
	new Statement(NS.app('#/'), NS.rdfs('member'), NS.app('todos/1')),
	new Statement(NS.app('#/'), NS.rdfs('member'), NS.app('todos/2')),
	new Statement(NS.app('#/'), NS.schema('potentialAction'), NS.app('actions/new')),

	new Statement(NS.app('actions/new'), NS.rdf('type'), NS.schema('CreateAction')),
	new Statement(NS.app('actions/new'), NS.schema('object'), NS.app('actions/new/entry')),

	new Statement(NS.app('actions/new/entry'), NS.rdf('type'), NS.schema('EntryPoint')),
	new Statement(NS.app('actions/new/entry'), NS.schema('httpMethod'), new Literal('POST')),
	new Statement(NS.app('actions/new/entry'), NS.schema('urlTemplate'), new Literal('EntryPoint')),

	new Statement(NS.app('todos/1'), NS.rdf('type'), NS.app('TodoItem')),
	new Statement(NS.app('todos/1'), NS.schema('text'), new Literal('Something to do')),
	new Statement(NS.app('todos/1'), NS.app('completed'), Literal.fromValue(false)),

	new Statement(NS.app('todos/2'), NS.rdf('type'), NS.app('TodoItem')),
	new Statement(NS.app('todos/2'), NS.schema('text'), new Literal('This has been done')),
	new Statement(NS.app('todos/2'), NS.app('completed'), Literal.fromValue(true)),
]);

/**
 * The core principle is that actions are hypermedia driven (just like in HTML with forms).
 *
 * The LRS API isn't finalized yet, but the basis will be just one or two arguments for all
 * write operations, one (read-only(?)) resource describing the action and optionally a second
 * temporary resource ([blank node](https://en.wikipedia.org/wiki/Blank_node)) which can be used
 * to fill in the request options (e.g. the request parameters or the body depending on the API).
 *
 * It is really important that the server accurately returns the side-effects of the executed
 * action, otherwise the server-client state will diverge and errors will emerge.
 *
 * @param {NamedNode} subject A [http://schema.org/Action](schema:Action) resource
 */
app.LRS.execActionByIRI = async function execActionByIRI(subject) {
	await this.getEntity(subject);

	const object = this.getResourceProperty(subject, NS.schema('object'));
	const target = this.getResourceProperty(subject, NS.schema('target'));
	const url = this.getResourceProperty(target, NS.schema('url'));
	const targetMethod = this.getResourceProperty(target, NS.schema('httpMethod'));
	const method = typeof targetMethod !== 'undefined' ? targetMethod.toString() : 'GET';
	const opts = {
		credentials: 'include',
		headers: authenticityHeader({
			Accept: LRS.api.processor.accept[new URL(url.value).origin],
		}),
		method: method.toUpperCase(),
		mode: 'same-origin',
	};
	const resp = await fetch(url.value, opts);

	const [statements, objectRef] = await Promise.all([LRS.api.processor.feedResponse(resp), object]);

	this.store.replaceStatements(this.getResourcePropertyRaw(objectRef), statements);

	return statements;
};

export default app.LRS;
