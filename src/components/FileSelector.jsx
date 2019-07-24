import { NamedNode } from "rdflib"
import React from 'react'

const divStyle = {
  display: 'flex',
  width: '100%',
}

const inputStyle = {
  background: 'rgba(0, 0, 0, 0.003)',
  border: 'none',
  boxShadow: 'inset 0 -2px 1px rgba(0,0,0,0.03)',
  fontSize: '1.5em',
  padding: '16px',
  width: '100%',
}

const buttonStyle = {
  background: 'rgba(0, 0, 0, 0.054)',
  boxShadow: 'rgba(0, 0, 0, 0.03) 0px -2px 1px inset',
  cursor: 'pointer',
  padding: '1.1em',
};

const FileSelector = ({ value, onOpen }) => {
  const [ file, setFile ] = React.useState(value || "");

  return (
    <div style={divStyle}>
      <input
        placeholder="Enter a pod file here"
        style={inputStyle}
        type="text"
        value={file}
        onChange={(e) => setFile(e.target.value)}
        onKeyUp={(e) => e.keyCode === 13 && onOpen(new NamedNode(file))}
      />
      <button
        style={buttonStyle}
        onClick={() => onOpen(new NamedNode(file))}
      >
        Open
      </button>
    </div>
  )
}

export default FileSelector
