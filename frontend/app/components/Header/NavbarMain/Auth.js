import React, { Component } from 'react';

import { logout } from '../../../actions/auth';
import config from '../../../../config';

const AUTHORIZED_USER_TITLE = '';
const DEMO_USER_TITLE = 'Register or login for access to featured options';

export default class Auth extends Component {
    _renderForAuthorizedUser() {
        return (
            <div>
                <div className="dropdown">
                    <a href="#" className="btn navbar-btn dropdown-toggle" data-toggle="dropdown" data-target="#sidebarRight">
                        <span data-toggle="tooltip" data-localize="account.help"  data-placement="left" title={AUTHORIZED_USER_TITLE} data-container="body" data-trigger="hover" className="hidden-xs">{ this.props.userData.profileMetadata.email }</span>
                        <span className="visible-xs">
                            <i className="md-i">person</i>
                        </span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-right">
                        <li>
                            <a onClick={ e => { this.props.dispatch(logout()) } } href="#" type="button" id="logout">
                                <span data-localize="account.logout">Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }

    _renderForDemoUser() {
        return (
            <div>
                <a href={config.LOGIN_URL} className="btn navbar-btn dropdown-toggle" data-toggle="collapse" data-target="#sidebarRight">
                    <span data-localize="account.login.title"  data-toggle="tooltip" data-localize="account.help"  data-placement="left" title={DEMO_USER_TITLE} data-container="body" data-trigger="hover" className="hidden-xs">
                        Login
                    </span>
                    <span className="visible-xs"><i className="md-i">input</i></span>
                </a>
            </div>
        )
    }

    render() {
        if (this.props.auth.isDemo) {
            return this._renderForDemoUser();
        }
        return this._renderForAuthorizedUser();
    }
}
