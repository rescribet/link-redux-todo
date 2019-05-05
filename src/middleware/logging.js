const logging = () => (store) => {
  store.actions = {};

  return (next) => (iri, opts) => {
    console.log('Link action:', iri, opts);

    return next(iri, opts);
  };
};

export default logging;
