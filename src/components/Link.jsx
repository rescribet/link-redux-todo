import { useLinkRenderContext } from 'link-redux'
import React from 'react';
import { NavLink } from 'react-router-dom'

/**
 * Renders a navigation element
 *
 * Will default to navigate to the resource in the current render context.
 */
const Link = ({ children, to, ...props }) => {
  const { subject } = useLinkRenderContext();

  return (
    <NavLink
      to={`/?resource=${encodeURIComponent(to?.value || subject.value)}`}
      {...props}
    >
      {children}
    </NavLink>
  );
}

export default Link;
