import { NamedNode } from "rdflib"
import React from 'react'
import { withRouter } from 'react-router'

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

const primaryDomainFromIRI = (iri) => {
  const url = new URL(iri);
  return url.origin.split('.').slice(-2).join('.');
}

const OPEN_DIR_MATCHER = /^.*:\/\/.*\/\w*(?<!\/$)(?!\w*\.\w*)$/i

const normalizeLDPFile = (iri) => {
  try {
    // There is a bug in the turtle parser/serializer which screws up the parsed IRI's, so we need
    // to append a trailing slash to ensure files open correctly.
    if (primaryDomainFromIRI(iri) === 'solid.community' && OPEN_DIR_MATCHER.test(iri)) {
      return `${iri}/`
    }

    return iri
  } catch {
    return iri
  }
};

const FileSelector = ({ history, location }) => {
  const resourceFromURL = new URLSearchParams(location.search).get('resource');
  const [ resource, setResource ] = React.useState(resourceFromURL);
  const [ file, setFile ] = React.useState(resourceFromURL || '');
  const navigate = () => history.push(`/?resource=${normalizeLDPFile(file)}`);
  if (resourceFromURL !== resource) {
    setResource(resourceFromURL);
    setFile(resourceFromURL);
  }

  return (
    <div style={divStyle}>
      <input
        placeholder="Enter a pod file here"
        style={inputStyle}
        type="text"
        value={file}
        onChange={(e) => setFile(e.target.value)}
        onKeyUp={(e) => e.keyCode === 13 && navigate()}
      />
      <button
        style={buttonStyle}
        onClick={navigate}
      >
        Open
      </button>
    </div>
  )
}

export default withRouter(FileSelector)
