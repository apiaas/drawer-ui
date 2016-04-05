import request from 'reqwest';
import when from 'when';
import {BASE_URL, DOCUMENTS_URL} from '../constants/DocumentsConstants';
import LoginStore from '../stores/LoginStore.js';
import AuthService from '../services/AuthService'

class DocumentService {

  upload(formData){
    return this.handleRequest(when(request({
      url: DOCUMENTS_URL,
      method: 'POST',
      crossOrigin: true,
      processData : false,
      type: 'multipart/form-data',
      data: formData,
      headers: {
        'Authorization': LoginStore.jwt
      }
    })));
  }

  delete(doc_id){
    return this.handleRequest(when(request({
      url: DOCUMENTS_URL + doc_id + '/',
      method: 'DELETE',
      crossOrigin: true,
      type: 'json',
      headers: {
        'Authorization': LoginStore.jwt
      }
    })));
  }

    deleteSet(set_ids){ 
    var ids = JSON.stringify(set_ids);   
    return this.handleRequest(when(request({
      url: DOCUMENTS_URL + 'delete/',
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {'data': ids},
      headers: {
        'Authorization': LoginStore.jwt
      }
    })));
  }

  getList(cursor){
    var data =  cursor ? {
      cursor: cursor 
    } : {};
    return this.handleRequest(when(request({
      url: DOCUMENTS_URL,
      method: 'GET',
      crossOrigin: true,
      type: 'json',
      headers: {
        'Authorization': LoginStore.jwt
      },
      data: data
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
