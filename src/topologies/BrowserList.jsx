import { Namespace } from 'rdflib'
import { TopologyProvider } from 'link-redux'
import React from 'react';

export const browserListTopology = Namespace("https://fletcher91.github.io/link-redux-todo/")('browserList');

class BrowserList extends TopologyProvider {
  constructor(props) {
    super(props);

    this.topology = browserListTopology;
    this.elementType = 'ul';
    this.className = 'BrowserList';
  }
}

export default BrowserList;
