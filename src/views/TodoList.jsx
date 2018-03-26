import LinkedRenderStore from 'link-lib';
import { LinkedResourceContainer, link } from 'link-redux';
import { BlankNode, Literal, Statement } from 'rdflib';
import React from 'react';

import LRS, { NS } from '../LRS';

const ENTER_KEY = 13;

function handleNewTodoKeyDown(event) {
	if (event.keyCode !== ENTER_KEY) {
		return;
	}

	event.preventDefault();

	var val = event.target.value.trim();

	if (val) {
		event.target.value = "";
		// Normally, we'd send this to the server, but we don't have one
		// so let's just create the side-effects locally
		const newTodo = new BlankNode();
		const data = [
			new Statement(newTodo, NS.rdf('type'), NS.app('TodoItem')),
			new Statement(newTodo, NS.schema('text'), new Literal(val)),
			new Statement(newTodo, NS.app('completed'), Literal.fromValue(false)),
			new Statement(NS.app('#/'), NS.rdfs('member'), newTodo),
		];
		LRS.store.addStatements(data);
		LRS.processBroadcast();
	}
}

/**
 * Normally, this would also be a server action (this is the web, so we'd actually want
 * to use the internet connection...), but this is a recreation of the side-effects so
 * we're manipulating the store directly (hence the break in the law of demeter).
 */
function clearCompleted() {
	const completedTodos = LRS
		.store
		.match(null, NS.app('completed'), Literal.fromValue(true)) // Match every completed resource
		.map((s) => LRS.store.statementsFor(s.subject)) // Get the data
		.map((todo) => todo.forEach(s => LRS.store.removeStatements(todo))); // Remove the data
	LRS.processBroadcast();
}

const TodoList = ({ completedCount, member, name }) => {
	let clearButton = null;
	if (completedCount.value >= 0) {
		clearButton = (
			<button className="clear-completed" onClick={clearCompleted}>
				Clear completed
			</button>
		);
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
					<LinkedResourceContainer
						key={`todo-list-${subject.value}`}
						subject={subject}
					/>
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
}

export default LinkedRenderStore.registerRenderer(
	link({
		completedCount: { label: NS.app('completedCount') },
		member: {
			label: NS.rdfs('member'),
			limit: Infinity,
		},
		name: { label: NS.schema('name') },
	})(TodoList),
	NS.app('TodoList')
);
