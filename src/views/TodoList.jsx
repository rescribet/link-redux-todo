import rdfs from '@ontologies/rdfs'
import schema from '@ontologies/schema'
import { Resource, register, useLRS, useProperty } from 'link-redux'
import React from 'react';

import { NS } from '../LRS'

const ENTER_KEY = 13;

const TodoList = () => {
	const [completedCount] = useProperty(NS.app('completedCount'));
	const member = useProperty(rdfs.member);
	const [name] = useProperty(schema.name);

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
			lrs.actions.todo.create(val);
			e.target.value = "";
		}
	}

	return (
		<div>
			<header className="header">
				<h1>{name.value}</h1>
			</header>
			<input
				className="new-todo"
				placeholder="What needs to be done?"
				autoFocus={true}
				onKeyUp={handleNewTodoKeyDown}
			/>
			<ul className="todo-list">
				{member.map(subject => (
					<Resource key={`todo-list-${subject.value}`} subject={subject} />
				))}
			</ul>
			<footer className="footer">
				{/* <span className="todo-count">
					<strong>{totalCount.value}</strong> {totalCount.value === "1" ? 'item' : 'items'} left
				</span> */}
				{clearButton}
			</footer>
		</div>
	);
};

TodoList.type = NS.app('TodoList');

export default register(TodoList);
