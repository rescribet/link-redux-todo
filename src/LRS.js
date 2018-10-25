import { createStore } from 'link-lib'

import todoMiddleware from './middleware/todo';

if (!window.app) {
	window.app = {};
}
var app = window.app;

app.LRS = createStore({}, [
	todoMiddleware,
]);

export const NS = app.LRS.namespaces;

// We do this manually now, but real-world would abstract this into the data via declarative forms.
export function actionIRI(subject, action, payload = {}) {
	const query = [
		subject && `iri=${subject.value}`,
		Object.entries(payload).map(([k, v]) => [k, encodeURIComponent(v)].join('=')),
	].join('&');

	return NS.app(`todo/${action}?${query}`);
}

app.LRS.api.registerTransformer(
	() => [],
	'text/html',
	1.0
);

export default app.LRS;
