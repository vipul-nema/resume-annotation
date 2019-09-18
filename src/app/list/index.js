import React, { Component } from 'react';
import './list.scss';
var annotatedHtmlList = [
    {
        fileName: 'annotation1',

    },
    {
        fileName: 'annotation2'
    },
    {
        fileName: 'annotation3'
    },
    {
        fileName: 'annotation4'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    },
    {
        fileName: '1_file1'
    }
]

class List extends Component {
    constructor(params) {
        super(params);
        this.state = {
            selectedItems: {}
        }
    }

    handleAnnotate = (fileName, event) => {
        event.preventDefault();
        const { history } = this.props;
        history.push(`annotate/${fileName}`);
    }

    handleDownloadCsv = (event) => {
        event.preventDefault();
    }

    handleDownloadHtml = (event) => {
        event.preventDefault();
    }

    handleCheckBox = (event) => {
        let target = event.target;

    }

    render() {
        return (
            <div className="annotatedHtmlListSection">
                <div className="bulkActions">
                    <div className="divBtn" onClick={this.handleDownloadCsv}> Download Csv </div>
                    <div className="divBtn" onClick={this.handleDownloadHtml}> Download HTML </div>
                </div>
                <div className="annotatedHtmlList">
                    {annotatedHtmlList.map((annotatedHtml, index) => {
                        let { fileName } = annotatedHtml;
                        return (
                            <div className="annotatedHtmlItem" key={fileName + index}>

                                <div className="fileDetails">
                                    <input type="checkbox" data-index={index} onChange={this.handleCheckBox} />
                                    <span> File Name - {fileName}</span>
                                </div>
                                <div className="listActions">
                                    <div className="divBtn" onClick={this.handleAnnotate.bind(this, fileName)}> Annotate </div>

                                </div>
                            </div>)
                    })}
                </div>
            </div>
        );
    }
}

export default List;