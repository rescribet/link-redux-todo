import * as statusCodes from 'http-status-codes';
import { register, useLRS } from 'link-redux'
import React from 'react';

import { defaultNS as NS } from 'link-lib'
import { browserListTopology } from '../topologies/BrowserList'
import { previewListTopology } from '../topologies/PreviewList'

/**
 * The `error` prop will be present when an error was caught in the tree,
 * otherwise something has gone wrong doing the request.
 */
const ErrorResource = ({ error, linkRequestStatus: { status }, subject}) => {
  const lrs = useLRS();

  const messageForStatus = (status) => {
    switch (status) {
      case statusCodes.NOT_FOUND:
        return [
          "File couldn't be found, create it in your pod first",
          <button
            className="Button"
            onClick={() => lrs.actions.todo.initialize(subject)}
          >
            Initialize
          </button>,
        ]
      case statusCodes.UNAUTHORIZED:
        return [
          "Please login to your pod first",
          <button
            className="Button"
            onClick={() => lrs.actions.solid.login()}
          >
            Login
          </button>,
        ]
      case statusCodes.FORBIDDEN:
        return ["The pod denied access to the file", undefined]
      default:
        return [`The server sent an unknown error (${status})`, undefined]
    }
  }

  const message = error
    ? "A client error has occurred"
    : messageForStatus(status)

  return (
    <p className="TodoMessage">
      {message}
    </p>
  )
}

ErrorResource.type = NS.ll('ErrorResource');

ErrorResource.topology = [
  undefined,
  browserListTopology,
  previewListTopology,
];

export default register(ErrorResource);
