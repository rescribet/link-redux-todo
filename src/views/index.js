import ErrorResource from './ErrorResource'
import Container from './ldp/Container'
import Dates from './Literal/Dates'
import LoadingResource from './LoadingResource'
import Resource from './rdfsResource/Resource'
import ResourceBrowserList from './rdfsResource/ResourceBrowserList'
import TodoItem from './todo/TodoItem'
import TodoList from './todo/TodoList'

export default [
  ...Container,
  ...Dates,
  ...ErrorResource,
  ...LoadingResource,
  ...Resource,
  ...ResourceBrowserList,
  ...TodoItem,
  ...TodoList,
]
