import request from 'reqwest';
import when from 'when';
import {BASE_URL, DOCUMENTS_URL, DOCUMENTS_SEARCH_URL} from '../constants/DocumentsConstants';
import LoginStore from '../stores/LoginStore.js';
import AuthService from '../services/AuthService'

class DocumentService {

	getList(params){
		var query_search_text = '';
		if(params){
			if(params.next_page_cursor) {
				query_search_text += '?next_page_cursor=' + params.next_page_cursor;
			}
			if(params.search_text){
				query_search_text = '?q=' + params.search_text;
			}
		}
		return this.handleRequest(when(request({
			url: DOCUMENTS_SEARCH_URL + query_search_text,
			method: 'GET',
			crossOrigin: true,
			type: 'json',
			headers: {
				'Authorization': LoginStore.jwt
			}
		})));
	}
	reIndex(params){
		return this.handleRequest(when(request({
			url: DOCUMENTS_URL + params.doc_id + '/index',
			method: 'POST',
			crossOrigin: true,
			type: 'json',
			data: {
				processed_text: params.processed_text
			}
		})));
	}
	handleRequest(uploadPromise) {
		return uploadPromise
			.then(function(response) {
				return response;
			}).catch(function(e){
				if(e.status == 401)
					AuthService.logout();
			});
	}
}

export default new DocumentService()
