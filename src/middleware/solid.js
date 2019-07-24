import {
  Namespace,
} from 'rdflib'
import SolidAuthClient from 'solid-auth-client'

const solidMiddleware = (store) => {
  // TODO: proper IRI
  store.namespaces.solid = new Namespace(`${FRONTEND_ROUTE}/solid/`);
  const NS = store.namespaces;

  store.actions.solid = {};
  store.actions.solid.login = () => store.exec(NS.solid('login'));

  /**
   * Middleware handler
   */
  return next => (iri, opts) => {
    if (!iri.value.startsWith(NS.solid('').value)) {
      return next(iri, opts);
    }


    if (iri.value.startsWith(NS.solid('login').value)) {
      return SolidAuthClient.popupLogin({
        popupUri: 'https://solid.community/common/popup.html',
      });
    }

    return next(iri, opts);
  };
};

export default solidMiddleware;
