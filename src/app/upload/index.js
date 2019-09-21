import React, { Component } from "react";
import { Route } from "react-router-dom";
import "./upload.scss";
import { urlConfig } from "../urlConfig";

class Upload extends Component {
  constructor(param) {
    super(param);
    this.fileInput = React.createRef();
  }

  handleSubmit = (event) => {
    const { history } = this.props;
    event.preventDefault();

    var data = new FormData();
    var files = this.fileInput.current.files;
    for (const file of files) {
      data.append("files", file);
    }
    let url = urlConfig.uploadMultipleFiles;
    let reqObj = {
      mode: "no-cors",
      cache: "no-cache",
      method: "POST",
      body: data
    };

    fetch(url, reqObj)
      .then(response => {
        if (response.ok) {
          alert('Files uploaded successfully');
        }
      })
      .catch(error => {
        console.log("error", error);
        alert('Some error happened in uploading file');
      });
  };

  render() {
    return (
      <div className="upload-section">

        <form onSubmit={this.handleSubmit}>
          <label htmlFor="file-uploader">
            Select HTML files: &nbsp;
                <input type="file" id="file-uploader-ann" name="html-file-uploader" accept=".htm, .html" multiple={true} ref={this.fileInput} />
          </label>
          <br />
          <button className="divBtn mtb10" type="submit">
            Upload
              </button>
        </form>

      </div>
    );
  }
}

export default Upload;
