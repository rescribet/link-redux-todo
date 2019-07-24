import { register } from 'link-redux'
import React from 'react';

import { NS } from '../LRS'

const LoadingResource = () => (
  <div className="lds-ring">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);

LoadingResource.type = NS.ll('LoadingResource');

export default register(LoadingResource);
