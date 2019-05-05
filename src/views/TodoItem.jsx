import classNames from 'classnames';
import { register } from 'link-redux';
import React, { Component } from 'react';

import { NS } from '../LRS';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

class TodoItem extends Component {
	static type = NS.app('TodoItem');

	static mapDataToProps = [NS.schema('text'), NS.app('completed')];

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

		const { lrs, subject } = this.props;

		this.setState({
			editing: false,
			editText: null,
		});
		if (e.which === ENTER_KEY) {
			lrs.actions.todo.update(subject, e.target.value);
		}
	}

	render () {
		const { completed, lrs, subject, text } = this.props;

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
						// This too, we'd get from the server as a `http://schema.org/potentialAction` property
						// (yes, the same model as gmail actions).
						onChange={() => lrs.actions.todo.toggle(subject)}
					/>
					<label onDoubleClick={() => this.setState({ editing: true })}>{text.value}</label>
					<button className="destroy" onClick={() => lrs.actions.todo.remove(subject)} />
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

export default register(TodoItem);
