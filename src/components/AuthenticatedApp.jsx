'use strict';

import React from 'react';
import LoginStore from '../stores/LoginStore'
import { Route, RouteHandler, Link } from 'react-router';
import AuthService from '../services/AuthService'

export default class AuthenticatedApp extends React.Component {
  constructor() {
    super()
    this.state = this._getLoginState();
  }

  _getLoginState() {
    return {
      userLoggedIn: LoginStore.isLoggedIn()
    };
  }

  componentDidMount() {
    this.changeListener = this._onChange.bind(this);
    LoginStore.addChangeListener(this.changeListener);
  }

  _onChange() {
    this.setState(this._getLoginState());
  }

  componentWillUnmount() {
    LoginStore.removeChangeListener(this.changeListener);
  }

  render() {
    return (
      <div className="container" id="main-container">
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand" href="/">Doc storage</a>
          </div>
          {this.headerItems}
        </nav>
        <RouteHandler/>
      </div>
    );
  }

  logout(e) {
    e.preventDefault();
    AuthService.logout();
  }

  get headerItems() {
    if (!this.state.userLoggedIn) {
      return (
      <ul className="nav navbar-nav navbar-right">
        <li>
          <Link to="login">Login</Link>
        </li>
        <li className="nav-right">
          <Link to="signup">Signup</Link>
        </li>
      </ul>)
    } else {
      return (<div>

      <ul className="nav navbar-nav navbar-right">
        <li className="nav-right">
          <a href="" onClick={this.logout}>Logout</a>
        </li>
      </ul></div>)
    }
  }
}
