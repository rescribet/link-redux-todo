import React from 'react';

import Link from './Link'

const style = {
  listStyle: 'none',
}

const listStyle = {
  display: 'flex',
  color: '#4d4d4d',
  padding: '.8em',
  fontSize: '1.5em',
  overflowWrap: 'break-word',
};

const nameStyle = {
  flexGrow: '1',
};

const BrowserListItem = ({
  title,
  name,
  children,
  to,
}) => (
  <li style={style}>
    <Link style={listStyle} to={to}>
      <span style={nameStyle} title={title} >{name}</span>
      {children}
    </Link>
  </li>
);

export default BrowserListItem;
