import { createStore } from 'link-lib'

import logging from './middleware/logging'
import todoMiddleware from './middleware/todo';

// A left-over todo-mvc quirk
if (!window.app) {
	window.app = {};
}
var app = window.app;

app.LRS = createStore({}, [
	logging(),
	todoMiddleware,
]);

export const NS = app.LRS.namespaces;

// Fix an issue due to github pages serving html
app.LRS.api.registerTransformer(
	() => [],
	'text/html',
	1.0
);

export default app.LRS;
