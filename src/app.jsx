import {
	LinkedResourceContainer,
	RenderStoreProvider,
} from 'link-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import LRS from './LRS';

import FileSelector from './components/FileSelector'

import ErrorResource from './views/ErrorResource'
import LoadingResource from './views/LoadingResource'
import Resource from './views/Resource'
import TodoItem from './views/todoItem';
import TodoList from './views/TodoList';

LRS.registerAll([
	...Resource,
	...ErrorResource,
	...LoadingResource,
	...TodoItem,
	...TodoList,
]);

app.ALL_TODOS = 'all';
app.ACTIVE_TODOS = 'active';
app.COMPLETED_TODOS = 'completed';

const TodoApp = () => {
	const [ todoList, setTodoList ] = React.useState("");

	const todoComponent = todoList
		? <LinkedResourceContainer subject={todoList} />
		: (
			<p
				className="TodoMessage"
				style={{
					fontStyle: 'italic',
					padding: '10px',
					textAlign: 'center',
				}}
			>
				Enter a file above and click open
			</p>
		)

	return (
		<RenderStoreProvider value={LRS} >
			<FileSelector
				onOpen={setTodoList}
				value={todoList?.value}
			/>
			{todoComponent}
		</RenderStoreProvider>
	);
}

history.pushState(undefined, undefined, '#/');

ReactDOM.render(
	React.createElement(TodoApp),
	document.getElementsByClassName('todoapp')[0]
);
