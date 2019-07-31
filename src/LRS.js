import { createStore } from 'link-lib'
import { Namespace, Statement } from 'rdflib';

import logging from './middleware/logging'
import solidMiddleware from './middleware/solid';
import todoMiddleware from './middleware/todo';

// A left-over todo-mvc quirk
if (!window.app) {
	window.app = {};
}
var app = window.app;

app.LRS = createStore({}, [
	logging(),
	solidMiddleware,
	todoMiddleware,
]);

app.LRS.namespaces.ldp = Namespace('http://www.w3.org/ns/ldp#');
app.LRS.namespaces.vcard = Namespace('http://www.w3.org/2006/vcard/ns#');
export const NS = app.LRS.namespaces;

// Fix an issue due to github pages serving html
app.LRS.api.registerTransformer(
	() => [],
	'text/html',
	1.0
);

/**
 * View lookup is, amongst other things, based on class depth.
 * By default our TODOList class is as deep as http://www.w3.org/2007/ont/link#Document (both 1)
 *
 * A feature to bump certain classes would be a good future addition.
 */
app.LRS.addOntologySchematics([
	new Statement(NS.rdfs('Bag'), NS.rdfs('subClassOf'), NS.rdfs('Resource')),
	new Statement(NS.app('TodoList'), NS.rdfs('subClassOf'), NS.rdfs('Bag')),
])
app.LRS.api.accept.default = "text/turtle"

window.LRS = app.LRS;

export default app.LRS;
