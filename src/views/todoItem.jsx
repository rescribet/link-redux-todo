import classNames from 'classnames';
import LinkedRenderStore from 'link-lib';
import { link } from 'link-redux';
import { Literal, Statement } from 'rdflib';
import React, { Component } from 'react';

import LRS, { NS } from '../LRS';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

class TodoItem extends Component {
	constructor () {
		super();

		this.state = {
			editing: false,
		};
	}

	handleKeyUp (e) {
		if (![ESCAPE_KEY, ENTER_KEY].includes(e.which)) {
			return;
		}

		this.setState({
			editing: false,
			editText: null,
		});
		if (e.which === ENTER_KEY) {
			LRS.store.replaceStatements(
				[new Statement(this.props.subject, NS.schema('text'), this.props.text)],
				[new Statement(this.props.subject, NS.schema('text'), Literal.fromValue(e.target.value))]
			);
			LRS.processBroadcast();
		}
	}

	toggleCompleted (subject, completed) {
		LRS.store.replaceStatements(
			[new Statement(subject, NS.app('completed'), Literal.fromValue(completed))],
			[new Statement(subject, NS.app('completed'), Literal.fromValue(!completed))]
		);
		LRS.processBroadcast();
	}

	remove () {
		const todo = LRS.store.statementsFor(this.props.subject);
		todo.push(...LRS.store.match(null, null, this.props.subject)); // Also remove references to this TODO.
		LRS.store.removeStatements(todo);
		LRS.processBroadcast();
	}

	render () {
		const { completed, subject, text } = this.props;

		const className = classNames({
			completed: completed.value === "1",
			editing: this.state.editing,
		})

		return (
			<li className={className}>
				<div className="view">
					<input
						className="toggle"
						type="checkbox"
						checked={completed.value === "1"}
						onChange={() => this.toggleCompleted(subject, completed.value === "1")}
					/>
					<label onDoubleClick={() => this.setState({ editing: true })}>{text.value}</label>
					<button className="destroy" onClick={this.remove.bind(this)} />
				</div>
				<input
					className={"edit"}
					onKeyUp={this.handleKeyUp.bind(this)}
					onChange={(e) => this.setState({ editText: e.target.value })}
					value={this.state.editText || text.value}
				/>
			</li>
		);
	}
}

export default LinkedRenderStore.registerRenderer(
	link([NS.schema('text'), NS.app('completed')])(TodoItem),
	NS.app('TodoItem')
);
