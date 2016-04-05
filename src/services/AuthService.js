import request from 'reqwest';
import when from 'when';
import {LOGIN_URL, LOGOUT_URL, SIGNUP_URL} from '../constants/LoginConstants';
import LoginActions from '../actions/LoginActions';

class AuthService {

	login(username, password) {
		return this.handleAuth(when(request({
			url: LOGIN_URL,
			method: 'POST',
			crossOrigin: true,
			type: 'json',
			data: {
			  username, password
			}
		})));
	}

	logout() {
	 LoginActions.logoutUser();
  }

	signup(username, password, email, success, error) {
		return this.handleAuth(when(request({
			url: SIGNUP_URL,
			method: 'POST',
			crossOrigin: true,
			type: 'json',
			data: {
			  username, password, email
			},
			success: success,
			error: error
		})));
	}

	handleAuth(loginPromise) {
		return loginPromise
		.then(function(response) {
			var jwt = response.id_token;
			LoginActions.loginUser(jwt);
			return true;
		});
	}
}

export default new AuthService()
