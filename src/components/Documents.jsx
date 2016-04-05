import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone'
import AuthenticatedComponent from './AuthenticatedComponent'
import DocumentService from '../services/FileService'

var DropzoneDemo = React.createClass({
    getInitialState: function () {
        return {
          files: []
        };
    },

    onDrop: function (files) {
      this.state.files.concat(files);
      this.setState({
        files: this.state.files
      });
      var ths = this;
      var uploadFunc = function(file){
        var fd = new FormData();
        fd.append( 'fileUpload', file);
        console.log(file.name)
        DocumentService.upload(fd).then(function(){
          for (var i = 0; i < files.length; i++) {
            if(file.filename == files[i].filename){
              files.splice(i, 1);
              break;
            }
          }
          ths.setState({'files': files});
        });
      }
      for (var i = 0; i < files.length; i++) {
        console.log(files[i].name)
        uploadFunc(files[i]);
      }
    },

    onOpenClick: function () {
      this.refs.dropzone.open();
    },

    render: function () {
      var u_key = 0;
        return (
            <div>
                <Dropzone ref="dropzone" onDrop={this.onDrop} className="drop">
                    <div>Try dropping some files here, or click to select files to upload.</div>
                </Dropzone>
                <button type="button" className="btn btn-default" onClick={this.onOpenClick}>
                    Select files
                </button>
                {this.state.files.length > 0 ? <div>
                <h2>Uploading {this.state.files.length} files...</h2>
                <div>{this.state.files.map((file) => <div className="sized" key={u_key++}><img src={file.preview} /></div> )}</div>
                </div> : null}
            </div>
        );
    }
});

var FormUpload = React.createClass({
    uploadFile: function (e) {

        var fd = new FormData();
        fd.append( 'fileUpload', this.refs.file.files[0] );
        DocumentService.upload(fd);

        e.preventDefault()
    },
    render: function() {
    return (
      <div>
         <form ref="uploadForm" className="uploader" encType="multipart/form-data" >
            <input ref="file" type="file" name="file" className="upload-file"/>
            <input type="button" ref="button" value="Upload" onClick={this.uploadFile} />
        </form>
      </div>
      );
    }
});



var DocumentsView = React.createClass({
    getInitialState: function() {
                this.getList();
                return({
                    fileSets: [],
                    files: []
                });
            },
    getList: function(){
        var ths = this;
        var u_key = 0;
        DocumentService.getList().then(function(response){
        if(response){
           var fileSets = [];
           var fileSet = [];
           var  counter = 0;
           var files = [];
           for (var i = 0; i < response.files.length; i++){
            files.push(<div className="col-md-4 portfolio-item" key={u_key++}>
                <a href="#">
                    <img className="img-responsive" src={response.files[i].url} alt=""></img>
                </a>
                <h3>
                    <a href="#">{response.files[i].filename}</a>
                </h3>
                <p>{response.files[i].description}</p>
            </div>);
                if(counter < 3){
                    fileSet.push(files[i]);
                    counter++;
                }else{
                    fileSets.push(<div className="row" key={u_key++}>{fileSet}</div>);
                    fileSet = new Array();
                    fileSet.push(files[i]);
                    counter = 1;
                }
           };
           if(fileSet.length > 0){
                fileSets.push(<div className="row" key={u_key++}>{fileSet}</div>);
           }
           ths.setState({
                fileSets: fileSets
            });
        }
        });
    },
    render: function(){
    return(
    <div id="documents-view">
        <button onClick={this.getList} className="btn btn-default">Refresh</button>
        {this.state.fileSets}
    </div>);
    }
})

export default AuthenticatedComponent(class Documents extends React.Component {

  render() {
    return (
    <div id="documents">
        <DropzoneDemo />
      
        <DocumentsView/>
    </div>);
  }
});
