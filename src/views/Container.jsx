import { register } from 'link-redux'
import React from 'react';
import { NavLink } from 'react-router-dom'

import { NS } from '../LRS'

const memberStyles = {
  padding: '.8em',
  fontSize: '1.5em',
  overflowWrap: 'break-word',
};

const Container = ({
  contains,
  subject,
}) => {
  const retrieveFilename = (iri) => {
    let file = iri.value.replace(subject.value, '');
    // There is some issue in redirection or parsing where paths without trailing slash will cause
    // the embedded files to be root-relative IRI's.
    if (file.includes('://')) {
      file = iri.value.replace(subject.site().value, '');
    }

    return file;
  };

  return (
    <ul className="todo-list">
      {contains.map(member => (
        <li
          key={member.value}
          style={memberStyles}
        >
          <NavLink to={`/?resource=${encodeURIComponent(member.value)}`}>
            {retrieveFilename(member)}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

Container.type = NS.ldp('Container');

Container.mapDataToProps = {
  contains: {
    label: NS.ldp('contains'),
    limit: Infinity,
  }
};

export default register(Container);
