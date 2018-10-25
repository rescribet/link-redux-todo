import { namedNodeByIRI } from 'link-lib';
import {
	LinkedResourceContainer,
	linkMiddleware,
	linkReducer as linkedObjects,
	RenderStoreProvider,
} from 'link-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware } from 'redux';
import { combineReducers } from 'redux-immutable';

import LRS from './LRS';

import TodoItem from './views/todoItem';
import TodoList from './views/TodoList';

LRS.registerAll([
	...TodoItem,
	...TodoList,
]);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
	combineReducers({ linkedObjects }),
	composeEnhancers(applyMiddleware(linkMiddleware(LRS)))
);

app.ALL_TODOS = 'all';
app.ACTIVE_TODOS = 'active';
app.COMPLETED_TODOS = 'completed';

class TodoApp extends React.Component {
	render() {
		return (
			<Provider store={store} >
				<RenderStoreProvider value={LRS} >
					<LinkedResourceContainer subject={namedNodeByIRI(window.location.href)} />
				</RenderStoreProvider>
			</Provider>
		);
	}
}

history.pushState(undefined, undefined, '#/');

ReactDOM.render(
	React.createElement(TodoApp),
	document.getElementsByClassName('todoapp')[0]
);
