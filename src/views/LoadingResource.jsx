import { register } from 'link-redux'
import React from 'react';

import { NS } from '../LRS'
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
