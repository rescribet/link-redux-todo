import {
  Namespace,
} from 'rdflib'

const chainMiddleware = (store) => {
  store.namespaces.os = new Namespace("http://purl.org/chain/os#");
  const NS = store.namespaces;

  const replace = NS.ll('replace');

  const initial = os('nop')
  store.processDelta([
    // Create action
    [initial, NS.rdf('type'), NS.os('ActivationState'), replace],
  ]);

  store.actions.os = {};

  /**
   * Middleware handler
   */
  return next => (iri, opts) => {
    if (!iri.value.startsWith(NS.app('todo/').value)) {
      return next(iri, opts);
    }

    return next(iri, opts);
  };
};

export default chainMiddleware;
