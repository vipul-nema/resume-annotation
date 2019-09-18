import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import './upload.scss';

class Upload extends Component {

    constructor(param) {
        super(param);
        this.fileInput = React.createRef();
    }

    handleSubmit = (history, event) => {
        event.preventDefault();
        // debugger;
        // console.log(
        //     `Selected file - ${
        //     this.fileInput.current.files[0].name
        //     }`, this.fileInput
        // );

        var data = new FormData();
        var files = this.fileInput.current.files;
        for (const file of files) {
            data.append('files', file, file.name)
        }

        fetch('/upload-file', {
            method: 'POST',
            body: data
        });

        history.push('./list');

    }


    render() {
        return (
            <div className="upload-section">
                <Route
                    render={({ history }) =>
                        (<form onSubmit={this.handleSubmit.bind(this, history)}>
                            <label htmlFor="file-uploader">Choose HTML files:

                                <input type="file"
                                    id="file-uploader-ann"
                                    name="html-file-uploader"
                                    accept=".htm, .html"
                                    multiple={true}
                                    ref={this.fileInput}

                                />
                            </label>
                            <br />
                            <button className="divBtn" type="submit">Submit</button>
                        </form>)
                    } />

            </div>
        );
    }
}

export default Upload;