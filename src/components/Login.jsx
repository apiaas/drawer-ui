import React from 'react/addons';
import ReactMixin from 'react-mixin';
import Auth from '../services/AuthService'

export default class Login extends React.Component {

  constructor() {
    super()
    this.state = {
      user: '',
      password: '',
      errors: {}
    };
  }

  login(e) {
    var ths = this;
    e.preventDefault();
    Auth.login(this.state.user, this.state.password)
      .catch(function(err) {
//        alert("There's an error logging in");
        console.log("Error logging in", err);
        var rj = JSON.parse(err.response);
        ths.state.errors = rj.message.errors;
        console.log(ths.state)
        ths.setState(ths.state)
      });
  }

  render() {
    return (
    <div className="container-fluid">
      <div className="col-md-4 col-md-offset-4">
        <h3>Login</h3>
        <form role="form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" valueLink={this.linkState('user')} className="form-control" id="username" placeholder="Username" />
          <div className="text text-danger">{this.state.errors.username}</div>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" valueLink={this.linkState('password')} className="form-control" id="password" ref="password" placeholder="Password" />
          <div className="text text-danger">{this.state.errors.password}</div>
        </div>
        <div className="text text-danger">{this.state.errors.all}</div>
        <button type="submit" className="btn btn-default" onClick={this.login.bind(this)}>Submit</button>
      </form>
    </div>
    </div>
    );
  }
}

ReactMixin(Login.prototype, React.addons.LinkedStateMixin);
