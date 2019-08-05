import { LinkedResourceContainer, register } from 'link-redux'
import { Namespace } from "rdflib"
import React from 'react';
import BrowserListHeader from '../../components/BrowserListHeader'

import BrowserList from '../../topologies/BrowserList'

const Container = ({ contains }) => (
  <BrowserList>
    <BrowserListHeader name="name">
      <span>modified</span>
    </BrowserListHeader>
    {contains.map(member => (
      <LinkedResourceContainer
        fetch
        key={member.value}
        subject={member}
      />
    ))}
  </BrowserList>
);

Container.type = Namespace('http://www.w3.org/ns/ldp#')('Container');

Container.mapDataToProps = {
  contains: {
    label: Namespace('http://www.w3.org/ns/ldp#')('contains'),
    limit: Infinity,
  }
};

export default register(Container);
