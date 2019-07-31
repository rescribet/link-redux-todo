import { LinkedResourceContainer, register, useLRS } from 'link-redux'
import React from 'react'

import ButtonWithFeedback from '../../components/ButtonWithFeedback'
import TodoHeader from '../../components/TodoHeader'
import { NS } from '../../LRS'

const ENTER_KEY = 13;

const TodoList = ({
	completedCount,
	member,
	name,
	subject,
}) => {
	const lrs = useLRS();

	let clearButton = null;
	if (completedCount.value >= 0) {
		clearButton = (
			<button className="clear-completed" onClick={lrs.actions.todo.clearCompleted}>
				Clear completed
			</button>
		);
	}

	const handleNewTodoKeyDown = (e) => {
		if (e.keyCode !== ENTER_KEY) {
			return;
		}

		e.preventDefault();

		const val = e.target.value.trim();
		if (val) {
			lrs.actions.todo.create(subject, val);
			e.target.value = "";
		}
	}

	const handleSaveError = (err) => {
		const status = err?.response?.status
		if (status === 401) {
			if (window.confirm("The pod says you have to be logged in for this action, login now?")) {
				lrs.actions.solid.login();
			}
		} else if (status === 403) {
			window.alert("The pod says you or the origin aren't allowed to edit this file.")
		}
	}

	return (
		<div>
      <TodoHeader name={name} subject={subject} />
			<input
				className="new-todo"
				placeholder="What needs to be done?"
				autoFocus={true}
				onKeyUp={handleNewTodoKeyDown}
			/>
			<ul className="todo-list">
				{member.map(todo => (
					<LinkedResourceContainer
						key={`todo-list-${todo.value}`}
						subject={todo}
						todoList={subject}
					/>
				))}
			</ul>
			<footer className="footer">
				<ButtonWithFeedback
					className="save-pod"
					doneText="Saved!"
					workingText="Saving..."
					onClick={() => lrs.actions.todo.save(subject).catch(handleSaveError)}
				>
					Save to pod
				</ButtonWithFeedback>
				{clearButton}
			</footer>
		</div>
	);
};

TodoList.type = NS.app('TodoList');

TodoList.mapDataToProps = {
	completedCount: NS.app('completedCount'),
	member: {
		label: NS.rdfs('member'),
		limit: Infinity, // We want all members
	},
	name: NS.schema('name'),
};

export default register(TodoList);
