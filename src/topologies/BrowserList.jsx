import { TopologyProvider } from 'link-redux'
import React from 'react';

import { NS } from '../LRS'

export const browserListTopology = NS.app('browserList');

class BrowserList extends TopologyProvider {
  constructor(props) {
    super(props);

    this.topology = browserListTopology;
    this.elementType = 'ul';
    this.className = 'BrowserList';
  }
}

export default BrowserList;
