import { useLRS } from 'link-redux'
import React from 'react'
import { confirmKeyUpHandler } from '../helpers/input'

const TodoHeader = ({ name, subject }) => {
  const lrs = useLRS()
  const [editing, setEditing] = React.useState(false)
  const [editedName, setName] = React.useState(name.value)
  const handleKeyUp = confirmKeyUpHandler(
    (name) => lrs.actions.todo.updateTitle(subject, name),
    setEditing,
    setName,
  )

  const header = editing
    ? (
      <h1>
        <input
          autoFocus
          className={'edit'}
          onKeyUp={handleKeyUp}
          onChange={(e) => setName(e.target.value)}
          value={editedName}
        />
      </h1>
    )
    : <h1 onDoubleClick={() => setEditing(true)}>{name.value}</h1>

  return (
    <header className="header">
      {header}
    </header>
  )
}

export default TodoHeader;
