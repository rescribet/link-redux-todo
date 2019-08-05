import {
  LinkedResourceContainer,
  RenderStoreProvider,
} from 'link-redux';
import { NamedNode } from 'rdflib';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

import LRS from './LRS';

import FileSelector from './components/FileSelector'
import views from './views/index'

LRS.registerAll(views);

app.ALL_TODOS = 'all';
app.ACTIVE_TODOS = 'active';
app.COMPLETED_TODOS = 'completed';

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

  const pathname = new URL(FRONTEND_ROUTE).pathname;

  return (
    <RenderStoreProvider value={LRS} >
      <BrowserRouter basename={pathname.endsWith('/') ? pathname.slice(0, -1) : pathname}>
        <FileSelector />
        <Switch>
          <Route key="resource" path="*" component={Text} />
        </Switch>
      </BrowserRouter>
    </RenderStoreProvider>
  );
}

ReactDOM.render(
  React.createElement(TodoApp),
  document.getElementsByClassName('todoapp')[0]
);
