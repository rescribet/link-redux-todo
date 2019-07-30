import {
  LinkedResourceContainer,
  RenderStoreProvider,
} from 'link-redux';
import { NamedNode } from 'rdflib';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Router, Switch } from 'react-router'
import { createBrowserHistory } from 'history';

import LRS from './LRS';

import FileSelector from './components/FileSelector'
import Container from './views/Container'
import ErrorResource from './views/ErrorResource'
import LoadingResource from './views/LoadingResource'
import Resource from './views/Resource'
import TodoItem from './views/TodoItem';
import TodoList from './views/TodoList';

LRS.registerAll([
  ...Container,
  ...Resource,
  ...ErrorResource,
  ...LoadingResource,
  ...TodoItem,
  ...TodoList,
]);

app.ALL_TODOS = 'all';
app.ACTIVE_TODOS = 'active';
app.COMPLETED_TODOS = 'completed';

const history = createBrowserHistory();

const TodoApp = () => {
  const Text = ({ location }) => {
    const resource = new URLSearchParams(location.search).get('resource');

    if(!resource) {
      return (
        <p
          className="TodoMessage"
          style={{
            fontStyle: 'italic',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          Enter a file or directory above and click open
        </p>
      );
    }

    LRS.getEntity(new NamedNode(resource), { reload: true })
    return (
      <LinkedResourceContainer subject={new NamedNode(resource)} />
    )
  }

  return (
    <RenderStoreProvider value={LRS} >
      <Router history={history}>
        <FileSelector />
        <Switch>
          <Route key="resource" path="*" component={Text} />
        </Switch>
      </Router>
    </RenderStoreProvider>
  );
}

ReactDOM.render(
  React.createElement(TodoApp),
  document.getElementsByClassName('todoapp')[0]
);
