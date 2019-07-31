import React from 'react';

const style = {
  listStyle: 'none',
}

const listStyle = {
  display: 'flex',
  padding: '.8em',
  fontSize: '1.5em',
  overflowWrap: 'break-word',
};

const nameStyle = {
  flexGrow: '1',
};

const BrowserListHeader = ({
  name,
  children,
}) => (
  <li style={style}>
    <span style={listStyle}>
      <span style={nameStyle}>{name}</span>
      {children}
    </span>
  </li>
);

export default BrowserListHeader;
