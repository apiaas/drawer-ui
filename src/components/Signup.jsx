import React from 'react/addons';
import ReactMixin from 'react-mixin';
import Auth from '../services/AuthService'
import RouterContainer from '../services/RouterContainer'


export default class Signup extends React.Component {

   constructor() {
      super()
      this.state = {
         user: '',
         password: '',
         email: '',
         password_confirmation: '',
         errors: {}
      };
   }

   signup(e) {
      var ths = this;
      e.preventDefault();
      var error = function (err) {
         if(err.response){var rj = JSON.parse(err.response);
            ths.state.errors = rj.message.errors;
         ths.setState(ths.state)}
      }
      var success = function (response) {
         var nextPath = '/login';
         RouterContainer.get().transitionTo(nextPath);
      }
      Auth.signup(this.state.user, this.state.password, this.state.email, success, error).catch(function(){});
   }

   render() {
   var validateEmail = function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
   }
   var emailIsValid = validateEmail(this.state.email);
   return (
      <div className="container-fluid">
         <div className="col-md-4 col-md-offset-4">
            <h3>Signup</h3>
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
               <div className="form-group">
                  <label htmlFor="extra">Confirm password</label>
                  <input type="text" type="password" valueLink={this.linkState('password_confirmation')} className="form-control" id="password_confirmation" ref="password_confirmation" placeholder="Confirm password" />
                  <div className="text text-danger">{this.state.password != this.state.password_confirmation ? "Password did not match" : ""}</div>
               </div>
               <div className="form-group">
                  <label htmlFor="extra">Email</label>
                  <input type="email" valueLink={this.linkState('email')} className="form-control" id="email" ref="email" placeholder="Email" />
                  <div className="text text-danger">{emailIsValid || this.state.email == "" ? "" : "Enter a valid email"}</div>
               </div>
               <button type="submit" className="btn btn-default" 
               onClick={this.signup.bind(this)} 
               disabled={this.state.password != this.state.password_confirmation || !emailIsValid || this.state.password == ""}>Submit</button>
            </form>
         </div>
      </div>
   );
   }
}

ReactMixin(Signup.prototype, React.addons.LinkedStateMixin);
