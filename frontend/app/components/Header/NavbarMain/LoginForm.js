import React, {Component} from 'react';
import {openUserSession} from '../../../actions/auth';

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            login: '',
            password: ''
        };
    }

    render() {
        const {login, password} = this.state;
        const isDisabled = !(login && password);
        return (
            <form className='form-inline'>
                <input className='form-control material-input-sm'
                       value={login}
                       type='text'
                       key='login'
                       placeholder='Login'
                       name='username'
                       onChange={(e) => this.onLoginChanged(e)}/>
                <input className='form-control material-input-sm'
                       value={password}
                       type='password'
                       key='password'
                       name='password'
                       placeholder='Password'
                       onChange={(e) => this.onPasswordChanged(e)}/>
                <button className='btn btn-primary  btn-uppercase login-button'
                        type='submit'
                        onClick={(e) => this.onLoginClick(e)}
                        disabled={isDisabled}
                >Login
                </button>
            </form>
        );
    }

    onLoginChanged(e) {
        this.setState({login: e.target.value});
    }

    onPasswordChanged(e) {
        this.setState({password: e.target.value});
    }

    onLoginClick() {
        const {login, password} = this.state;
        const {closeLoginForm} = this.props;

        closeLoginForm();
        this.props.dispatch(openUserSession(login, password));
    }
}

export default LoginForm;
