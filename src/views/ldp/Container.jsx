import { LinkedResourceContainer, register } from 'link-redux'
import React from 'react';
import BrowserListHeader from '../../components/BrowserListHeader'

import { NS } from '../../LRS'
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

Container.type = NS.ldp('Container');

Container.mapDataToProps = {
  contains: {
    label: NS.ldp('contains'),
    limit: Infinity,
  }
};

export default register(Container);
