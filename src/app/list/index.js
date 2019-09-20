import React, { Component } from 'react';
import './list.scss';
import { urlConfig } from '../urlConfig';
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
            annotatedHtmlList: [],
            selectedItems: {}
        }
    }

    componentDidMount() {

        let url = urlConfig.list;
        let reqObj = {
            mode: 'cors',
            cache: 'no-cache',
            // credentials: 'include',
            method: 'GET',
        };
        // url = 'http://dummy.restapiexample.com/api/v1/employees';
        fetch(url, reqObj).then((response) => {
            // if (response.ok) {
            //     return response.json();

            // }
            // return;
            return response.json();

        }).then((res) => {
            console.log(res);
            this.setState({
                annotatedHtmlList: res || []
            });
        }).catch((error) => {
            debugger;
            console.log('error', error);
        });
    }

    handleAnnotate = (fileName, event) => {
        event.preventDefault();
        const { history } = this.props;
        history.push(`annotate/${fileName}`);
    }

    handleDownloadCsv = (fileName, event) => {
        event.preventDefault();
        window.open(`${urlConfig.downloadCSV}/${fileName}`);
    }

    handleDownloadHtml = (fileName, event) => {
        event.preventDefault();
        window.open(`${urlConfig.downloadFile}/${fileName}`);
    }

    handleCheckBox = (event) => {
        let target = event.target;

    }

    render() {
        const { annotatedHtmlList } = this.state;
        return (
            <div className="annotatedHtmlListSection">
                <div className="bulkActions">
                    <div className="divBtn" onClick={this.handleDownloadCsv}> Download Csv </div>
                    <div className="divBtn" onClick={this.handleDownloadHtml}> Download HTML </div>
                </div>
                <div className="annotatedHtmlList">
                    {annotatedHtmlList.map((fileName, index) => {
                        {/* let { fileName } = annotatedHtml; */ }
                        return (
                            <div className="annotatedHtmlItem" key={fileName + index}>

                                <div className="fileDetails">
                                    <input type="checkbox" data-index={index} onChange={this.handleCheckBox} />
                                    <span> File Name - {fileName}</span>
                                </div>
                                <div className="listActions">
                                    <div className="divBtn" onClick={this.handleAnnotate.bind(this, fileName)}> Annotate </div>
                                    <div className="divBtn" onClick={this.handleDownloadCsv.bind(this, fileName)}> Download Csv </div>
                                    <div className="divBtn" onClick={this.handleDownloadHtml.bind(this, fileName)}> Download HTML </div>

                                </div>
                            </div>)
                    })}
                </div>
            </div>
        );
    }
}

export default List;