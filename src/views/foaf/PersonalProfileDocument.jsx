import React from 'react';
import { Property, register } from 'link-redux'

import { defaultNS as NS } from 'link-lib'

const PersonalProfileDocument = () => <Property label={NS.foaf('primaryTopic')} />;

PersonalProfileDocument.type = NS.foaf('PersonalProfileDocument');

export default register(PersonalProfileDocument);
