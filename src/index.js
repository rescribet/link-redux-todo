import { Namespace, Statement } from 'rdflib'
import { defaultNS as NS } from 'link-lib';

import todo from "./middleware/todo";
import views from "./views/index";

export default ((lrs) => {
  lrs.registerModule({
    iri: "https://fletcher91.github.io/link-redux-todo/TodoList",
    middlewares: [
      todo,
    ],
    ontologyStatements: [
      new Statement(NS.rdfs('Bag'), NS.rdfs('subClassOf'), NS.rdfs('Resource')),
      new Statement(Namespace("https://fletcher91.github.io/link-redux-todo/")('TodoList'), NS.rdfs('subClassOf'), NS.rdfs('Bag')),
    ],
    version: 1,
    views,
  });

  var indexCSS = document.createElement('link');
  indexCSS.setAttribute('rel', 'stylesheet');
  indexCSS.setAttribute('href', "https://fletcher91.github.io/link-redux-todo/css/index.css");
  document.head.appendChild(indexCSS);

  var baseCSS = document.createElement('link');
  baseCSS.setAttribute('rel', 'stylesheet');
  baseCSS.setAttribute('href', "https://fletcher91.github.io/link-redux-todo/css/base.css");
  document.head.appendChild(baseCSS);

  var todoCSS = document.createElement('link');
  todoCSS.setAttribute('rel', 'stylesheet');
  todoCSS.setAttribute('href', "https://fletcher91.github.io/link-redux-todo/css/todo.css");
  document.head.appendChild(todoCSS);
})(window.LRS);
