import {
	LinkedResourceContainer,
	RenderStoreProvider,
} from 'link-redux';
import { NamedNode } from 'rdflib';
import React from 'react';
import ReactDOM from 'react-dom';

import LRS from './LRS';

import TodoItem from './views/todoItem';
import TodoList from './views/TodoList';

LRS.registerAll([
	...TodoItem,
	...TodoList,
]);

app.ALL_TODOS = 'all';
app.ACTIVE_TODOS = 'active';
app.COMPLETED_TODOS = 'completed';

class TodoApp extends React.Component {
	render() {
		return (
			<RenderStoreProvider value={LRS} >
				<LinkedResourceContainer subject={NamedNode.find(window.location.href)} />
			</RenderStoreProvider>
		);
	}
}

history.pushState(undefined, undefined, '#/');

ReactDOM.render(
	React.createElement(TodoApp),
	document.getElementsByClassName('todoapp')[0]
);
