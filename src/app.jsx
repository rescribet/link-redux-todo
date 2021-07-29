import rdf from '@ontologies/core';
import {
	Resource,
	RenderStoreProvider,
} from 'link-redux';
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

const TodoApp = () => (
	<RenderStoreProvider value={LRS} >
		<Resource subject={rdf.namedNode(window.location.href)} />
	</RenderStoreProvider>
);

history.pushState(undefined, undefined, '#/');

ReactDOM.render(
	React.createElement(TodoApp),
	document.getElementsByClassName('todoapp')[0]
);
