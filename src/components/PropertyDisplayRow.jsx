import React from 'react';

const rowStyle = {
  display: 'flex',
  padding: '1em',
};

const labelStyle = {
  flexGrow: '1',
  fontWeight: 800,
};

const PropertyDisplayRow = ({ label, children }) => (
  <div style={rowStyle}>
    <span style={labelStyle}>{label}</span>
    <span>{children}</span>
  </div>
);

export default PropertyDisplayRow;
