import { Namespace } from 'rdflib'
import { TopologyProvider } from 'link-redux'
import React from 'react';

export const previewListTopology = Namespace("https://fletcher91.github.io/link-redux-todo/")('previewList');

class PreviewList extends TopologyProvider {
  constructor(props) {
    super(props);

    this.topology = previewListTopology;
    this.className = 'PreviewList';
  }
}

export default PreviewList;
