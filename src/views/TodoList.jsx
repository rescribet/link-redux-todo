import { LinkedResourceContainer, register } from 'link-redux';
import React from 'react';

import { actionIRI, NS } from '../LRS'

const ENTER_KEY = 13;

class TodoList extends React.PureComponent {
	static type = NS.app('TodoList');

	static mapDataToProps = {
		completedCount: {
			label: NS.app('completedCount'),
		},
		member: {
			label: NS.rdfs('member'),
			limit: Infinity,
		},
		name: {
			label: NS.schema('name'),
		},
	};

	constructor(props) {
		super(props);
		this.handleNewTodoKeyDown = this.handleNewTodoKeyDown.bind(this);
	}

	handleNewTodoKeyDown(event) {
		if (event.keyCode !== ENTER_KEY) {
			return;
		}

		event.preventDefault();

		const val = event.target.value.trim();

		if (val) {
			this.props.lrs.exec(actionIRI(undefined, 'create', { text: val }))
			event.target.value = "";
		}
	}

	render() {
		const { completedCount, lrs, member, name } = this.props;

		let clearButton = null;
		if (completedCount.value >= 0) {
			clearButton = (
				<button className="clear-completed" onClick={() => lrs.exec(actionIRI(undefined, 'clearComplete'))}>
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
					onKeyUp={this.handleNewTodoKeyDown}
				/>
				<ul className="todo-list">
					{member.map(subject => (
						<LinkedResourceContainer key={`todo-list-${subject.value}`} subject={subject} />
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
}

export default register(TodoList);
