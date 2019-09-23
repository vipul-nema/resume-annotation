import React, { Component } from 'react';
import './list.scss';
import { urlConfig } from '../urlConfig';
var annotatedHtmlList = [
  '0_file1.html', '1_file4.html', '2_file3.html', '2_annotated_file2.html',
];

class List extends Component {
  constructor(params) {
    super(params);
    this.state = {
      annotatedHtmlList: [],
      selectedFiles: []
    };
  }

  componentDidMount() {
    // this.setState({
    //   annotatedHtmlList: annotatedHtmlList
    // });
    // return;

    let url = urlConfig.list;
    let reqObj = {
      mode: "cors",
      cache: "no-cache",
      // credentials: 'include',
      method: "GET"
    };
    // url = 'http://dummy.restapiexample.com/api/v1/employees';
    fetch(url, reqObj)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error');

      })
      .then(res => {
        this.setState({
          annotatedHtmlList: res || []
        });
      })
      .catch(error => {
        console.log("error", error);
      });
  }

  handleAnnotate = (fullFileName, event) => {
    event.preventDefault();
    const { history } = this.props;
    history.push(`annotate/${fullFileName}`);
  }

  handleDownloadCsv = (fileName, event) => {
    event.preventDefault();
    window.open(`${urlConfig.downloadCSV}/${fileName}.csv`);
  }

  handleDownloadHtml = (fileName, event) => {
    event.preventDefault();
    window.open(`${urlConfig.downloadFile}/${fileName}.html`);
  }

  handleCheckBox = (fileName, event) => {
    let target = event.target;
    let { selectedFiles } = this.state;
    let newSelectedFiles = [...selectedFiles];

    if (target.checked) {
      newSelectedFiles.push(fileName);
    } else {
      newSelectedFiles.splice(newSelectedFiles.indexOf(fileName), 1);
    }
    this.setState({
      selectedFiles: newSelectedFiles
    });
  };

  handleDownloadCsvBulk = (event) => {
    event.preventDefault();
    let { selectedFiles } = this.state;
    let csvFileNames = selectedFiles.map((fileName) => {
      return fileName.split('.')[0] + '.csv';
    });
    console.log('handleDownloadCsvBulk', csvFileNames);
    window.open(`${urlConfig.downloadCSVBulk}${csvFileNames.join(',')}`);
  }

  handleDownloadHtmlBulk = (event) => {
    event.preventDefault();
    let { selectedFiles } = this.state;
    console.log('handleDownloadHtmlBulk', selectedFiles);
    window.open(`${urlConfig.downloadFileBulk}${selectedFiles.join(',')}`);
  }

  render() {
    const { annotatedHtmlList } = this.state;
    const annotatedHtmlListLength = annotatedHtmlList.length;

    if (annotatedHtmlListLength === 0) {
      return <div className="noData">Please upload some html file </div>
    }

    return (
      <div className="annotatedHtmlListSection">

        <div className="bulkActions">
          <div className="divBtn mlr10 mbr10" onClick={this.handleDownloadCsvBulk}>
            Bulk Download Csv
          </div>
          <div className="divBtn mlr10 mbr10" onClick={this.handleDownloadHtmlBulk}>
            Bulk Download HTML
          </div>
        </div>

        <div className="annotatedHtmlList">
          {annotatedHtmlList.length > 0 ? annotatedHtmlList.map((fullFileName, index) => {
            const fileName = fullFileName.split('.')[0];
            const isAnnotated = fileName.includes('annotated_');
            {/* let { fileName } = annotatedHtml; */ }
            return (
              <div className="annotatedHtmlItem" key={fileName + index}>

                <div className="fileDetails">
                  <input type="checkbox" defaultChecked={false} onChange={this.handleCheckBox.bind(this, fullFileName)} />
                  <span> File Name - {fileName}</span>
                </div>
                <div className="listActions">
                  <div className="divBtn mlr10" onClick={this.handleAnnotate.bind(this, fullFileName)}> Annotate </div>
                  {isAnnotated && <div className="divBtn mlr10" onClick={this.handleDownloadCsv.bind(this, fileName)}> Download Csv </div>}
                  <div className="divBtn mlr10" onClick={this.handleDownloadHtml.bind(this, fileName)}> Download HTML </div>

                </div>
              </div>)
          }) : (<div className="noResult">No Result</div>)
          }
        </div>

      </div>
    );
  }
}

export default List;
