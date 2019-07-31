import { Property, register } from 'link-redux'
import { NamedNode } from 'rdflib';
import React from 'react';
import BrowserListItem from '../../components/BrowserListItem'

import { NS } from '../../LRS'
import { browserListTopology } from '../../topologies/BrowserList'

const retrieveFilename = (iri, folder) => {
  if (typeof folder === "undefined") {
    const url = new URL(iri.value)
    folder = new NamedNode(`${url.origin}${url.pathname.split('/').slice(0, -1).join('/')}`)
  }
  let file = iri.value.replace(folder.value, '');
  // There is some issue in redirection or parsing where paths without trailing slash will cause
  // the embedded files to be root-relative IRI's.
  if (file.includes('://')) {
    file = iri.value.replace(folder.site().value, '');
  }

  return file;
};

const ResourceBrowserList = ({
  name,
  subject,
}) => {
  const displayName = name?.value || retrieveFilename(subject);

  return (
    <BrowserListItem
      name={displayName}
      title={subject.value}
      to={subject}
    >
        <Property label={NS.dc('modified')} />
    </BrowserListItem>
  );
}

ResourceBrowserList.type = NS.rdfs('Resource');

ResourceBrowserList.topology = browserListTopology;

ResourceBrowserList.mapDataToProps = {
  name: [NS.schema('name'), NS.rdfs('label'), NS.dc('title'), NS.foaf('name')],
};

ResourceBrowserList.linkOpts = { forceRender: true }

export default register(ResourceBrowserList);
