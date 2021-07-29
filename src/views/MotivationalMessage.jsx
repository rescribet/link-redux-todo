import schema from '@ontologies/schema'
import classNames from 'classnames';
import { register, useLRS, useProperty } from 'link-redux'
import React from 'react';

import { NS } from '../LRS';

const MotivationalMessage = ({subject}) => {
    const lrs = useLRS();
    const [text] = useProperty(schema.text);

    React.useEffect(() => {
        setTimeout(() => {
            lrs.actions.todo.remove(subject)
        }, 
        2000);
    }, 
    []);

    return (
        <li className="motivationalMessage">
          <div className="view">
            <label>{text && text.value}</label>
          </div>
        </li>
    )
};

MotivationalMessage.type = NS.app('MotivationalMessage');


export default register(MotivationalMessage);