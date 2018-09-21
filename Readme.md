# Link-Redux TODO

This is an example React TODO application for [Link-redux](https://github.com/fletcher91/link-redux). Check out the [online demo](https://fletcher91.github.io/link-redux-todo/#/).

The example is currently serverless, which isn't a realistic scenario, so data
processing is done client-side which is a bit cumbersome.

In a realistic setting, nearly all web-apps are backed by a server-side application
that processes incoming requests to update the state of the system. Link was designed
to take advantage of that by adding a requirement that the server sends back the
difference in state when done processing the request. So duplication of logic becomes
unnecessary (no more 'isomorphic' nor choosing your back-end technology to suit the
front-end!). This means the font-end has to be loosely-modeled.

All views for each model are programmed, if done properly, implicitly (the front-end
tries not to do too many assumptions on the model's shape). So most model's views
will contain elements from the base resource type (e.g. `Resource` of `Thing`), but
if greater specificity in displaying a model is needed, it can be added.

## TODO
This project isn't finished yet, so it has todos..

* Add a backend.
* Let hypermedia drive the state changes
* Add data filtering.
