import { register } from 'link-redux'
import React from 'react';

import { defaultNS as NS } from 'link-lib'
import { browserListTopology } from '../topologies/BrowserList'
import { previewListTopology } from '../topologies/PreviewList'

const LoadingResource = () => (
  <div className="lds-ring">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);

LoadingResource.type = NS.ll('LoadingResource');

LoadingResource.topology = [
  undefined,
  browserListTopology,
  previewListTopology,
];

export default register(LoadingResource);
