import React from 'react';
import AuthenticatedComponent from './AuthenticatedComponent'
import SearchService from '../services/SearchService'
import { Button, Modal, ButtonToolbar } from 'react-bootstrap';
import Dropzone from 'react-dropzone'
import DocumentService from '../services/FileService'


var SearchView = React.createClass({

	getInitialState: function() {
		var ths = this;
		window.onscroll = function(ev) {
			if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
				if (ths.state.next_page_cursor != "") 
					ths.getList();
				}
		};
		this.getList();
		return {
			'search_text': '',
			'results': [],
			'next_page_cursor': null,
			'number_found': null,
			'currentFile': null,
			'modalIsOpen': false,
			'uploadingNow': false,
			'selectedItems': [],
			'globalCheck': false,
			'files': []
		};
	},

	getList: function(){
		var ths = this;

		var params = {};
		if (ths.state){
			if (ths.state.next_page_cursor != "") 
				params['next_page_cursor'] = ths.state.next_page_cursor;
			params['search_text'] = ths.state.search_text;
		}
		SearchService.getList(params).then(function(response){
			if (response){
				var cursor = null;
				if (response.next_page_cursor != "")
					cursor = response.next_page_cursor;
				ths.setState({results: ths.state.results.concat(response.results), 
									next_page_cursor: cursor, 
									number_found: response.number_found});
			}
		});
	},

	getNewList:function(){
		this.setState({next_page_cursor: null, results: [], number_found: null,  globalCheck: false, files: []}, this.getList);
	},

	handleChange: function(event) {
		this.setState({search_text: event.target.value});
	},

	_handleKeyPress: function(e) {
		if (e.key === 'Enter') {
			this.getNewList();
		}
	},

	openModal: function(file){
		this.state.modalIsOpen = true;
		this.state.currentFile = file;
		this.setState(this.state);
	},

	onModalChanged: function(newState) {
		this.setState({ modalIsOpen: newState.modalIsOpen });
		if (newState.processed_text){
			var currentFile = this.state.currentFile;
			currentFile.text = newState.processed_text; 
			this.setState({currentFile: currentFile})
		}
	},

	handleCheckboxChange: function(file){
		file.isChecked = !file.isChecked;
		this.setState({results: this.state.results});
	},

	deleteSelected: function(){
		var set_ids = []
		for (var i = 0; i < this.state.results.length; i++) {
			if (this.state.results[i].isChecked) {
				set_ids.push(this.state.results[i].id)	
			}
		}
		var ths = this;
		DocumentService.deleteSet(set_ids).then(function(){
			ths.getNewList();
		});
	},

	checkUncheck: function checkUncheck(e) {
		this.state.globalCheck = !this.state.globalCheck;
		for (var i = 0; i < this.state.results.length; i++) {
			this.state.results[i].isChecked = this.state.globalCheck;
		}
		this.setState({ results: this.state.results , globalCheck: this.state.globalCheck});
	},

	onDrop: function (files) {
		this.state.files = this.state.files.concat(files);
		this.setState({
			files: this.state.files
		});
		var ths = this;
		var uploadFunc = function(file){
			var fd = new FormData();
			fd.append( 'fileUpload', file);
			DocumentService.upload(fd).then(function(){
				for (var i = 0; i < files.length; i++) {
					if(file.name == files[i].name){
						files[i].uploaded = true;
						break;
					}
				}
				ths.setState({'files': ths.state.files});
			});
		}
		for (var i = 0; i < files.length; i++) {
			if(!files[i].uploaded)
				uploadFunc(files[i]);
		}
		
	},

	onOpenClick: function () {
		this.refs.dropzone.open();
	},

	render: function(){
		var search_text = this.state.search_text;
		var rows = [];
		var u_key = 0;
		var uploadingClassName = this.state.uploading ? "loading" : "";
		if(this.state.results)
			for (var i = 0; i < this.state.results.length; i++) {
				rows.push(<div className={this.state.results[i].isChecked ? "row selected-item row-item" : "row row-item"} key={u_key++}>
										<div className="col-md-1">
											<input key={this.state.results[i].id} className="checkbox-margin" type="checkbox" checked={this.state.results[i].isChecked}  onChange={this.handleCheckboxChange.bind(this, this.state.results[i])}/>
										</div>
										<div className="col-md-8">
											<h3>
												<div className="fake-link" onClick={this.openModal.bind(this, this.state.results[i])}>{this.state.results[i].filename}</div>
											</h3>
											<p>{this.state.results[i].short_text}</p>
										</div>
										<div className="col-md-2 fake-link" onClick={this.openModal.bind(this, this.state.results[i])}>
											<img className="img-responsive" src={this.state.results[i].small_image_url} alt=""></img>
										</div>
								</div>);
			}
		var currentFile = this.state.currentFile; 
		var notUploadedCount = 0;
		for (var i = 0; i < this.state.files.length; i++) {
			if(!this.state.files[i].uploaded)
				notUploadedCount++;
		}
		return(
			<div>
				<Dropzone ref="dropzone" onDrop={this.onDrop} className="drop" disableClick={true}>	
				<div id="search" className="col-md-8">				
					<div className="container-fluid">

						<div className="row">
							<div className="col-md-8">
								<div className="input-group">
									<input type="text" value={search_text} onChange={this.handleChange} onKeyPress={this._handleKeyPress} className="form-control" placeholder="Search for..."/>
									<span className="input-group-btn">
										<button className="btn btn-default" type="button" onClick={this.getNewList}>Go!</button>
									</span>
								</div>
							</div>
							<div className="col-md-4">
								<button className="btn btn-default" type="button" onClick={this.onOpenClick}>Upload</button>
								<button className="btn btn-default ml" type="button" onClick={this.deleteSelected}>Delete</button>		
							</div>
						</div>
						<div id="resultStats">
							<h6>{this.state.number_found ? 'Documents found: ' + this.state.number_found : 'Click Upload or just drop files below'}</h6>
							<input type="checkbox" checked={this.state.globalCheck} onChange={this.checkUncheck} className={this.state.results.length == 0 ? "hidden" : ""}/>
						</div>
						<div>
	                		<div className="row">{this.state.files.map((file) => 
	                			<div className={file.uploaded ? "uploading checkmark" : "uploading"} key={u_key++}>
	                				<img className="img-responsive" src={file.preview} />
	                				<span></span>
	                			</div> )}
	                		</div>
						</div>
						{rows}
						
						<DetailModal document={currentFile} isOpen={this.state.modalIsOpen} callbackParent={this.onModalChanged}/>
					</div>
				</div>
				</Dropzone>	
				<div className="playground col-md-3">
					{notUploadedCount > 0 ? 
						<p className="bg-info text-center">
	                		Uploading {notUploadedCount} files... 
	                	</p> : 
	                	<p className="bg-success text-center">
	                		{this.state.files.length > 0 ? "You successfuly uploaded all files!" : null} 
                		</p>}
				</div>
			</div>
			);
	}
})

const DetailModal = React.createClass({

	getInitialState() {
		return {show: false,
					url: null,
					saved: true};
	},

	showModal() {
		this.setState({show: true});
	},

	hideModal() {
		this.setState({show: false});
		this.props.callbackParent({modalIsOpen: false});
	},

	componentWillReceiveProps: function(nextProps) {
		if(nextProps.document && nextProps.isOpen){
			this.showModal();
			this.setState({document: nextProps.document, processed_text: nextProps.document.text})
		}
	},

	reIndex: function(){
		var ths = this;
		SearchService.reIndex({'processed_text': this.state.processed_text, 'doc_id': this.state.document.id}).then(function(response){
			ths.props.callbackParent({processed_text: ths.state.processed_text});
			ths.setState({saved: true});
		});
	},

	handleChange: function(event) {
		this.setState({processed_text: event.target.value, saved: false});
	},

	render() {
		var image_url = this.state.document ? this.state.document.image_url : null;
		var filename = this.state.document ? this.state.document.filename : null;
		// var processed_text = this.state.processed_text;
		return (
			<ButtonToolbar>
				<Modal
					{...this.props}
					show={this.state.show}
					onHide={this.hideModal}
					dialogClassName="custom-modal">
					<Modal.Header closeButton>
						<Modal.Title id="contained-modal-title-lg">{filename}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
							<img  className="img-responsive" src={image_url} alt=""></img>
						<h4><span className="label label-info">Recognized text</span></h4>
						<textarea value={this.state.processed_text} onChange={this.handleChange}></textarea>
					</Modal.Body>
					<Modal.Footer>
						<Button bsStyle={this.state.saved ? 'success' : 'primary'} onClick={this.reIndex} disabled={this.state.saved}>{this.state.saved ? 'Saved' : 'Update'}</Button>
						<Button onClick={this.hideModal}>Close</Button>
					</Modal.Footer>
				</Modal>
			</ButtonToolbar>);
	}
});

export default AuthenticatedComponent(class Search extends React.Component {
	render() {
		return (
		<div className="container-fluid">
			<SearchView/>
		</div>);
	}
});
