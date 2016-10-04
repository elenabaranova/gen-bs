/* global reduxStore: false */

import Promise from 'bluebird';
import HttpStatus from 'http-status';
import {addTimeout, removeTimeout} from 'redux-timeout';

import config from '../../config';
import {getUrlParameterByName} from '../utils/stringUtils';

import {fetchUserDataAsync} from './userData';
import {initWSConnectionAsync} from './websocket';
import {handleError, handleApiResponseErrorAsync} from './errorHandler';
import {clearAnalysesHistory} from './analysesHistory';

import apiFacade from '../api/ApiFacade';
import SessionsClient from '../api/SessionsClient';

/*
 * action types
 */
export const RECEIVE_SESSION = 'RECEIVE_SESSION';
export const REQUEST_SESSION = 'REQUEST_SESSION';

export const LOGIN_ERROR = 'LOGIN_ERROR';

export const UPDATE_AUTOLOGOUT_TIMER = 'UPDATE_AUTOLOGOUT_TIMER';

const sessionsClient = apiFacade.sessionsClient;

export const SESSION_TYPE = {
    INVALID: 'INVALID',
    DEMO: 'DEMO',
    USER: 'USER'
};

/*
 * login errors
 */

const LOGIN_ERROR_MESSAGE = 'Authorization failed. You can reload page and try again.';
const LOGIN_GOOGLE_ERROR = 'Google authorization failed.';

/*
 * Start keep alive task, which update session on the WS.
 */

export class KeepAliveTask {
    constructor(period) {
        this.period = period;
        this.keepAliveTaskId = null;
    }

    isRunning() {
        return this.keepAliveTaskId !== null;
    }

    start() {
        if (!this.isRunning()) {
            this._scheduleTask();
        }
    }

    stop() {
        if (this.isRunning()) {
            clearTimeout(this.keepAliveTaskId);
        }
    }

    _scheduleTask() {
        this.keepAliveTaskId = setTimeout(() => {
            // update session on the web server
            reduxStore.dispatch(getCookieSessionTypeAsync())
                .then((sessionType) => {
                    if (sessionType === SESSION_TYPE.INVALID) {
                        // TODO: Handle this situation.
                        console.error('Cookie session is invalid.');
                    }
                })
                .catch((error) => console.error('got unexpected error in keep alive task', error))
                // reschedule task
                .then(() => this._scheduleTask());
        }, this.period);
    }
}

/*
 * action creators
 */

function requestSession() {
    return {
        type: REQUEST_SESSION
    };
}

function receiveSession(isDemo) {
    return {
        type: RECEIVE_SESSION,
        isDemo: isDemo,
        receivedAt: Date.now()
    };
}

function loginError(errorMessage) {
    return {
        type: LOGIN_ERROR,
        errorMessage
    };
}


function restoreOldSessionAsync(isDemoSession) {
    return (dispatch) => {
        dispatch(receiveSession(isDemoSession));
        return dispatch(initWSConnectionAsync())
            .then(() => {
                if (isDemoSession) {
                    dispatch(clearAnalysesHistory());
                }
                return dispatch(fetchUserDataAsync());
            });
    };
}

function openDemoSessionAsync() {
    return (dispatch) => Promise.resolve(
    ).then(() => new Promise(
        (resolve) => sessionsClient.openDemoSession(
            (error, response) => resolve({error, response})
        ))
    ).then(({error, response}) => dispatch(handleApiResponseErrorAsync(LOGIN_ERROR_MESSAGE, error, response))
    ).then((response) => SessionsClient.getSessionFromResponse(response)
    ).then((sessionId) => sessionId ? dispatch(restoreOldSessionAsync(true)) : dispatch([
        loginError('Session id is empty'),
        handleError(null, LOGIN_ERROR_MESSAGE)
    ]));
}

export function openUserSession(login, password) {
    return (dispatch) => Promise.resolve(

    ).then(() => new Promise(
        (resolve) => sessionsClient.openUserSession(
            login, password, (error, response) => resolve({error, response})
        ))
    ).then(({error, response}) => dispatch(handleApiResponseErrorAsync(LOGIN_ERROR_MESSAGE, error, response))
    ).then((response) => SessionsClient.getSessionFromResponse(response)
    ).then((sessionId) => sessionId ? dispatch(restoreOldSessionAsync(false)) : dispatch([
        loginError('Session id is empty'),
        handleError(null, LOGIN_ERROR_MESSAGE)
    ]));
}


/**@callback CheckSessionCallback
 * @param {(Error|null)}error
 * @param {boolean}[isValidSession]
 * @param {boolean}[isDemoSession]
 */
/**
 *  Checks current session state.
 */
function getCookieSessionTypeAsync() {
    return () => {
        return Promise.fromCallback(
            (done) => sessionsClient.checkSession(done)
        ).then((response) => {
            const {status, body} = response;

            if (status !== HttpStatus.OK) {
                return SESSION_TYPE.INVALID;
            }
            switch (body.sessionType) {
                case SESSION_TYPE.USER:
                case SESSION_TYPE.DEMO:
                    return body.sessionType;
                default:
                    return Promise.reject(new Error('Unknown session type'));
            }
        }).catch(() => Promise.resolve(SESSION_TYPE.INVALID));
    };
}


function displayErrorFromParamsAsync() {
    return (dispatch) => Promise.resolve()
        .then(() => {
            const errorFromParams = getUrlParameterByName('error');
            if (errorFromParams) {
                // it is error from google authorization page (detected by URL parameters)
                console.log('google authorization failed', errorFromParams);
                dispatch(loginError(errorFromParams));
                dispatch(handleError(null, LOGIN_GOOGLE_ERROR));
                history.pushState({}, '', `${config.HTTP_SCHEME}://${location.host}`);
            }
            return Promise.resolve();
        });
}


export function loginWithGoogle() {
    return dispatch => Promise.resolve(
        // Display auth error from params if any
    ).then(() => dispatch(displayErrorFromParamsAsync())
    ).then(() => {
        // try to restore old session
        dispatch(requestSession());
        return dispatch(
            getCookieSessionTypeAsync()
        ).then((sessionType) => {
            if (sessionType !== SESSION_TYPE.INVALID) {
                // restore old session
                return dispatch(restoreOldSessionAsync(sessionType === SESSION_TYPE.DEMO));
            } else {
                // old session is invalid, so we create new one
                return dispatch(openDemoSessionAsync());
            }
        });
    });
}


export function logout() {
    sessionsClient.closeSession((error, response) => {
        if (error || response.status !== HttpStatus.OK) {
            // We close session on the frontend and don't care about returned
            // status, because now it is problem of the web server
            const message = error || response.body;
            console.log('cannot close session', message);
        } else {
            console.log('session closed');
        }
        location.replace(location.origin);
    });
}

export function startAutoLogoutTimer() {
    return (dispatch, getState) => {
        // auto logout works only with authorized users
        if (getState().auth.isDemo) {
            return;
        }
        const secondsToAutoLogout = getState().auth.secondsToAutoLogout;
        if (secondsToAutoLogout === null) {
            // if secondsToAutoLogout !== null, then auto logout is already started
            dispatch(addTimeout(1000, UPDATE_AUTOLOGOUT_TIMER, () => {
                dispatch(updateAutoLogoutTimer());
            }));
            dispatch(updateAutoLogoutTimer());
        }
    };
}

function _updateAutoLogoutTimer(secondsToAutoLogout) {
    return {
        type: UPDATE_AUTOLOGOUT_TIMER,
        secondsToAutoLogout
    };
}

function updateAutoLogoutTimer() {
    return (dispatch, getState) => {
        const secondsToAutoLogout = getState().auth.secondsToAutoLogout;
        let nextSecondsToAutoLogout = secondsToAutoLogout === null ? config.SESSION.LOGOUT_WARNING_TIMEOUT : secondsToAutoLogout - 1;
        if (nextSecondsToAutoLogout < 0) {
            // if auto logout timer is expired, then we should start logout procedure
            dispatch(stopAutoLogoutTimer());
            logout();
            return;
        }
        // updates timer
        dispatch(_updateAutoLogoutTimer(nextSecondsToAutoLogout));
    };
}

export function stopAutoLogoutTimer() {
    // stops auto logout timer and reset auto logout state
    return (dispatch) => {
        dispatch(removeTimeout(UPDATE_AUTOLOGOUT_TIMER));
        dispatch(_updateAutoLogoutTimer(null));
    };
}
