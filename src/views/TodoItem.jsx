import schema from '@ontologies/schema'
import classNames from 'classnames';
import { register, useLRS, useProperty } from 'link-redux'
import React from 'react';

import { NS } from '../LRS';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

const TodoItem = ({  subject }) => {
  const lrs = useLRS();
  const [editing, setEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(null);
  const [completed] = useProperty(NS.app('completed'));
  const [text] = useProperty(schema.text);

  const className = classNames({
    completed: completed.value === "1",
    editing,
  })

  const handleKeyUp = (e) => {
    if (![ESCAPE_KEY, ENTER_KEY].includes(e.which)) {
      return;
    }

    setEditing(false);
    setEditText(null);

    if (e.which === ENTER_KEY) {
      lrs.actions.todo.update(subject, e.target.value);
    }
  }

  return (
    <li className={className}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={completed.value === "true"}
          // This too, we'd get from the server as a `http://schema.org/potentialAction` property
          // (yes, the same model as gmail actions).
          onChange={() => lrs.actions.todo.toggle(subject)}
        />
        <label onDoubleClick={() => setEditing(true)}>{text.value}</label>
        <button className="destroy" onClick={() => lrs.actions.todo.remove(subject)} />
      </div>
      <input
        className={"edit"}
        onKeyUp={handleKeyUp}
        onChange={(e) => setEditText(e.target.value)}
        value={editText || text.value}
      />
    </li>
  );
};

TodoItem.type = NS.app('TodoItem');


export default register(TodoItem);
