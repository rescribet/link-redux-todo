import { TopologyProvider } from 'link-redux'
import React from 'react';

import { NS } from '../LRS'

export const previewListTopology = NS.app('previewList');

class PreviewList extends TopologyProvider {
  constructor(props) {
    super(props);

    this.topology = previewListTopology;
    this.className = 'PreviewList';
  }
}

export default PreviewList;
