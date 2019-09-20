import React, { Component } from "react";
import { Route } from "react-router-dom";
import "./upload.scss";
import { urlConfig } from "../urlConfig";

class Upload extends Component {
  constructor(param) {
    super(param);
    this.fileInput = React.createRef();
  }

  handleSubmit = (history, event) => {
    event.preventDefault();

    var data = new FormData();
    var files = this.fileInput.current.files;
    debugger;
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
        console.log("response", response);
        history.push("./list");
      })
      .catch(error => {
        debugger;
        console.log("error", error);
      });
  };

  render() {
    return (
      <div className="upload-section">
        <Route
          render={({ history }) => (
            <form onSubmit={this.handleSubmit.bind(this, history)}>
              <label htmlFor="file-uploader">
                Choose HTML files: &nbsp;
                <input type="file" id="file-uploader-ann" name="html-file-uploader" accept=".htm, .html" multiple={true} ref={this.fileInput} />
              </label>
              <br />
              <button className="divBtn mtb10" type="submit">
                Submit
              </button>
            </form>
          )}
        />
      </div>
    );
  }
}

export default Upload;
