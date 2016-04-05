import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone'
import AuthenticatedComponent from './AuthenticatedComponent'
import DocumentService from '../services/FileService'
import { Button, Modal, ButtonToolbar } from 'react-bootstrap';


var u_key = 0;

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
		var ths = this;
		window.onscroll = function(ev) {
			 if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
				  ths.getList();
			 }
		};
					 this.getList();
					 return({
						  fileSets: [],
						  files: [],
						  cursor: null,
						  currentFile: null,
						  modalIsOpen: false
					 });
				},
	 openModal: function(file){
		console.log(file)
		this.state.modalIsOpen = true;
		this.state.currentFile = file;
		this.setState(this.state);
	 },
	 onChildChanged: function(newState) {
		  this.setState({ modalIsOpen: newState.modalIsOpen });
	 },
	 getList: function(){
		  var ths = this;
		  var cursor = ths.state ? ths.state.cursor : null;
		  DocumentService.getList(cursor).then(function(response){
		  if(response){
			  var fileSets = [];
			  var fileSet = [];
			  var  counter = 0;
			  var files = [];
			  for (var i = 0; i < response.files.length; i++){
				files.push(<div className="col-md-4 portfolio-item" key={u_key++}>
					 <div onClick={ths.openModal.bind(ths, response.files[i])} className="fake-link">
						  <img  className="img-responsive" src={response.files[i].url} alt=""></img>
					 </div>
					 <h3>
						  <div className="fake-link" onClick={ths.openModal.bind(ths, response.files[i])}>{response.files[i].filename}</div>
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
					 fileSets: ths.state.fileSets.concat(fileSets),
					 cursor: response.cursor
				});
		  }
		  });
	 },
	 render: function(){
		var file = this.state.currentFile; 
	 return(
	 <div id="documents-view">        
		  {this.state.fileSets}
		  <DetailModal document={file} isOpen={this.state.modalIsOpen} callbackParent={this.onChildChanged}/>
	 </div>);
	 }
})


const DetailModal = React.createClass({
  getInitialState() {
	 return {show: false,
			url: null};
  },

  showModal() {
	 this.setState({show: true});
  },

  hideModal() {
	 this.setState({show: false});
	 this.props.callbackParent({modalIsOpen: false});
  },
  componentWillReceiveProps: function(nextProps) {
	  console.log(nextProps)
	  if(nextProps.document && nextProps.isOpen){
		this.showModal();
		this.setState({document: nextProps.document})
	  }
	},

  render() {
	 var image_url = this.state.document ? this.state.document.url_full_size : null;
	 return (
		<ButtonToolbar>
		  <Modal
			 {...this.props}
			 show={this.state.show}
			 onHide={this.hideModal}
			 dialogClassName="custom-modal"
		  >
			 <Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg">Modal heading</Modal.Title>
			 </Modal.Header>
			 <Modal.Body>
				<h4>Full sized</h4>
				<img  className="img-responsive" src={image_url} alt=""></img>
				<h4>Wrapped Text</h4>
				<p>Ipsum molestiae natus adipisci modi eligendi? Debitis amet quae unde commodi aspernatur enim, consectetur. Cumque deleniti temporibus ipsam atque a dolores quisquam quisquam adipisci possimus laboriosam. Quibusdam facilis doloribus debitis! Sit quasi quod accusamus eos quod. Ab quos consequuntur eaque quo rem!
				 Mollitia reiciendis porro quo magni incidunt dolore amet atque facilis ipsum deleniti rem! Dolores debitis voluptatibus ipsum dicta. Dolor quod amet ab sint esse distinctio tenetur. Veritatis laudantium quibusdam quidem corporis architecto veritatis. Ex facilis minima beatae sunt perspiciatis placeat. Quasi corporis
				 odio eaque voluptatibus ratione magnam nulla? Amet cum maiores consequuntur totam dicta! Inventore adipisicing vel vero odio modi doloremque? Vitae porro impedit ea minima laboriosam quisquam neque. Perspiciatis omnis obcaecati consequatur sunt deleniti similique facilis sequi. Ipsum harum vitae modi reiciendis officiis.
				 Quas laudantium laudantium modi corporis nihil provident consectetur omnis, natus nulla distinctio illum corporis. Sit ex earum odio ratione consequatur odit minus laborum? Eos? Sit ipsum illum architecto aspernatur perspiciatis error fuga illum, tempora harum earum, a dolores. Animi facilis inventore harum dolore accusamus
				 fuga provident molestiae eum! Odit dicta error dolorem sunt reprehenderit. Sit similique iure quae obcaecati harum. Eum saepe fugit magnam dicta aliquam? Sapiente possimus aliquam fugiat officia culpa sint! Beatae voluptates voluptatem excepturi molestiae alias in tenetur beatae placeat architecto. Sit possimus rerum
				 fugiat sapiente aspernatur. Necessitatibus tempora animi dicta perspiciatis tempora a velit in! Doloribus perspiciatis doloribus suscipit nam earum. Deleniti veritatis eaque totam assumenda fuga sapiente! Id recusandae. Consectetur necessitatibus eaque velit nobis aliquid? Fugit illum qui suscipit aspernatur alias ipsum
				 repudiandae! Quia omnis quisquam dignissimos a mollitia. Suscipit aspernatur eum maiores repellendus ipsum doloribus alias voluptatum consequatur. Consectetur quibusdam veniam quas tenetur necessitatibus repudiandae? Rem optio vel alias neque optio sapiente quidem similique reiciendis tempore. Illum accusamus officia
				 cum enim minima eligendi consectetur nemo veritatis nam nisi! Adipisicing nobis perspiciatis dolorum adipisci soluta architecto doloremque voluptatibus omnis debitis quas repellendus. Consequuntur assumenda illum commodi mollitia asperiores? Quis aspernatur consequatur modi veritatis aliquid at? Atque vel iure quos.
				 Amet provident voluptatem amet aliquam deserunt sint, elit dolorem ipsa, voluptas? Quos esse facilis neque nihil sequi non? Voluptates rem ab quae dicta culpa dolorum sed atque molestias debitis omnis! Sit sint repellendus deleniti officiis distinctio. Impedit vel quos harum doloribus corporis. Laborum ullam nemo quaerat
				 reiciendis recusandae minima dicta molestias rerum. Voluptas et ut omnis est ipsum accusamus harum. Amet exercitationem quasi velit inventore neque doloremque! Consequatur neque dolorem vel impedit sunt voluptate. Amet quo amet magni exercitationem libero recusandae possimus pariatur. Cumque eum blanditiis vel vitae
				 distinctio! Tempora! Consectetur sit eligendi neque sunt soluta laudantium natus qui aperiam quisquam consectetur consequatur sit sint a unde et. At voluptas ut officiis esse totam quasi dolorem! Hic deserunt doloribus repudiandae! Lorem quod ab nostrum asperiores aliquam ab id consequatur, expedita? Tempora quaerat
				 ex ea temporibus in tempore voluptates cumque. Quidem nam dolor reiciendis qui dolor assumenda ipsam veritatis quasi. Esse! Sit consectetur hic et sunt iste! Accusantium atque elit voluptate asperiores corrupti temporibus mollitia! Placeat soluta odio ad blanditiis nisi. Eius reiciendis id quos dolorum eaque suscipit
				 magni delectus maxime. Sit odit provident vel magnam quod. Possimus eligendi non corrupti tenetur culpa accusantium quod quis. Voluptatum quaerat animi dolore maiores molestias voluptate? Necessitatibus illo omnis laborum hic enim minima! Similique. Dolor voluptatum reprehenderit nihil adipisci aperiam voluptatem soluta
				 magnam accusamus iste incidunt tempore consequatur illo illo odit. Asperiores nesciunt iusto nemo animi ratione. Sunt odit similique doloribus temporibus reiciendis! Ullam. Dolor dolores veniam animi sequi dolores molestias voluptatem iure velit. Elit dolore quaerat incidunt enim aut distinctio. Ratione molestiae laboriosam
				 similique laboriosam eum et nemo expedita. Consequuntur perspiciatis cumque dolorem.</p>
				 <textarea></textarea>
			 </Modal.Body>
			 <Modal.Footer>
				<Button onClick={this.hideModal}>Close</Button>
			 </Modal.Footer>
		  </Modal>
		</ButtonToolbar>
	 );
  }
});



export default AuthenticatedComponent(class Documents extends React.Component {

  render() {
	 return (
	 <div id="documents">
		  <DropzoneDemo />
		  <DocumentsView/>
	 </div>);
  }
});
