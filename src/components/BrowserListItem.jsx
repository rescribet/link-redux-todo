import React from 'react';
import { NavLink } from 'react-router-dom'

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
    <NavLink style={listStyle} to={to}>
      <span style={nameStyle} title={title} >{name}</span>
      {children}
    </NavLink>
  </li>
);

export default BrowserListItem;
