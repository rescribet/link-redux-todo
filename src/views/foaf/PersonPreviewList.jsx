import React from 'react';
import { defaultNS as NS } from 'link-lib'
import { register } from 'link-redux';

import Link from '../../components/Link'
import { previewListTopology } from '../../topologies/PreviewList'

const styles = {
  padding: '1em',
};

const PersonPreviewList = ({ name }) => (
  <Link style={styles}>
    <p>{name.value}</p>
  </Link>
);

PersonPreviewList.type = NS.foaf('Person');

PersonPreviewList.topology = previewListTopology;

PersonPreviewList.mapDataToProps = {
  name: {label: NS.foaf('name')},
}

export default register(PersonPreviewList);
