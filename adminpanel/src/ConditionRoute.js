import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useDispatch } from 'react-redux';

// import action

// import lib
import isEmpty from "is-empty";
import { getAuthToken } from "./lib/localStorage";


const ConditionRoute = ({ component: Component, layout: Layout, auth, type, ...rest }) => {
    const dispatch = useDispatch();

    return (
  
        <Route
            {...rest}
            render={props => {
                if (type == 'auth' && !isEmpty(getAuthToken())) {
                    return <Navigate to="/dashboard" />
                } else if (type == 'private' && isEmpty(getAuthToken())) {
                    return <Navigate to="/login" />
                }

                return <Component {...props} />
            }}
        />
    )

};

export default ConditionRoute;