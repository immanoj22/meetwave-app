import meetingapp from "./action";

import { applyMiddleware, compose, createStore } from 'redux';
import {thunk} from "redux-thunk";

const middleware = [thunk];
export const store = createStore(meetingapp,
    compose(
        applyMiddleware(...middleware),
        // window.__REDUX_DEVTOOLS_EXTENSION_ && window.__REDUX_DEVTOOLS_EXTENSION_()
    ));

    