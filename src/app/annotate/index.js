import React, { Component } from "react";
import "./annotate.scss";
import { urlConfig } from "../urlConfig";
import tagOptions from "./tagOptions";
import Suggestor from "../common/suggestor/suggestor";
import SuggestorTag from "./suggestorTag";
import { reject } from "q";


// let annotatedTagJson = {
// name_100_30: {
//     top: 100,
//     left: 30,
//     tag: 'name',
//     value: '<span>Ravi</span>',
//     start: 50, //Start index
//     end: 67, //End index,
//     backgroundColor: 'blue'
// },
// email_200_50: {
//     top: 200,
//     left: 50,
//     tag: 'email',
//     value: 'vipul@naukri.com',
//     start: 20,
//     end: 36,
//     backgroundColor: 'green'
// }
// };

class Annotate extends Component {
  constructor(params) {
    super(params);
    this.tagOptions = [...tagOptions];

    const { match } = this.props;
    let { htmlFileName } = match.params;
    this.htmlFileName = htmlFileName;

    this.state = {
      currentTagOption: {},
      annotatedTagJson: {},
      highlightTag: {},
      isShowSelectedItems: false,
      currentRange: {},
      suggestorValue: ""

    }
    //Ref on iframe
    this.iframeRef = React.createRef();
  }

  componentDidMount() {
    // Is resume is already annotated or not, else api giving error
    if (this.htmlFileName.includes('annotated_')) {
      let url = `${urlConfig.getJson}/${this.htmlFileName}`;

      let reqObj = {
        mode: 'cors',
        cache: 'no-cache',
        // credentials: 'include',
        method: 'GET',
      };
      // url = 'http://dummy.restapiexample.com/api/v1/employees';
      fetch(url, reqObj).then((response) => {
        return response.json();
      }).then((response) => {
        this.setState({
          annotatedTagJson: response
        });

      }).catch((error) => {

        console.log('error', error);
      });

      this.setState({
        annotatedTagJson: {}
      });
    }

    this.fetchIframeHtml();

  }


  handleIframeLoad = event => {
    // window.getSelection().addRange(new Range());
    // console.log('iframeRef', this.iframeRef)
    let iframe_annotation = document.getElementById("iframe_annotation");
    // iframe_annotation.addEventListener('onmousedown', getStartPosition);
    this.iframeDocument = this.iframeRef.document || iframe_annotation.contentDocument || iframe_annotation.contentWindow.document;

    //Assign iframe content's height to its child
    iframe_annotation.style.height = this.iframeDocument.body.scrollHeight + 100 + "px";

    this.iframeDocument.body.addEventListener("mouseup", this.getEndPosition.bind(this));

    //Now id would be added at backend side
    //Assign id if not present
    // if (!this.iframeDocument.querySelector("[data-annotate]")) {
    //   this.assignUniqueAttribue(this.iframeDocument);
    // }
  };
  assignUniqueAttribue = node => {
    var elements = node.querySelectorAll("body *");

    let elementsLength = elements.length;
    for (let i = 0; i < elementsLength; i++) {
      elements[i].setAttribute("data-annotate", this.getUniqueID());
    }
  };

  getStartPosition(event) {
    // startPos = getXYRelativeToWindow(event.currentTarget);
  }

  getEndPosition = event => {
    var range;

    let node = this.iframeDocument;

    if (node.getSelection) {
      let selection = node.getSelection();
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);

        let clonedSelection = range.cloneContents();
        //get clientRect position of selected node or characters
        let clientRects = range.getClientRects();
        let boundingClientRect = range.getBoundingClientRect();
        // console.log("clientRects", clientRects, boundingClientRect);
        let firstRect = clientRects[0];
        let lastRect = clientRects[0];

        var div = document.createElement("div");
        div.appendChild(clonedSelection);
        // node.execCommand('insertHTML', true, `<mark class="ddddd">${div.innerHTML}</mark>`);
        // console.log('innerHTML', div.innerHTML);
        if (div.innerHTML.trim().length === 0) {
          return;
        }
        var childHtml = this.getChildHtml(`${div.innerHTML}`);
        var parentHtml = this.iframeHtml;
        //
        var start = this.getSelectedNodeIndex(parentHtml, childHtml, range, selection, event);
        var end = start + childHtml.length;

        this.setState({
          currentRange: {
            top: firstRect.top,
            left: lastRect.left,
            value: childHtml,
            tag: this.state.currentTagOption.id,
            start,
            end,
            clientRects,
            text: range.toString()
          },
          suggestorValue: "",
          currentTagOption: {}
        });

        return div.innerHTML;
      }
    }
  };
  highLight = config => {
    let { clientRects } = config;
    // let boundingClientRect = range.getBoundingClientRect();
    let clientRectsLength = Object.keys(clientRects).length;

    var clientRectHighLighter = [];
    for (let prop in clientRects) {
      let clientRect = clientRects[prop];
      let style = {
        top: `${clientRect.top}px`,
        left: `${clientRect.left}px`,
        height: `${clientRect.height}px`,
        width: `${clientRect.width}px`
      };
      clientRectHighLighter.push(<span className="highLighter" style={style}></span>);
      // if (prop === 0 || prop === clientRectsLength - 1) {
      //   clientRectHighLighter.push(<span className="highLighter" style={style}></span>);
      // }
    }

    return <div className="highLighterDiv"> {clientRectHighLighter} </div>;
  };

  getChildHtml = childHtml => {
    //Add all openig tags data
    while (childHtml.indexOf("<") === 0) {
      // console.log("step 1");
      childHtml = childHtml.slice(childHtml.indexOf(">") + 1);
    }
    //Delete all end tags data
    while (childHtml.lastIndexOf(">") === childHtml.length - 1) {
      console.log("step 2");
      childHtml = childHtml.slice(0, childHtml.lastIndexOf("<"));
    }
    return childHtml;
  };

  getSelectedNodeIndex = (parentHtml, selectedItem, range, selection, event) => {
    // console.log("range", range, selection);
    if (selectedItem.includes("<") && selectedItem.includes(">")) {
      return parentHtml.indexOf(selectedItem);
    } else {
      let parentElement = range.commonAncestorContainer;
      while (parentElement.nodeType !== 1) {
        // console.log("step 3");
        parentElement = parentElement.parentElement;
      }
      let commonParentHtml = parentElement.outerHTML;
      let commonParentHtmlStart = parentHtml.indexOf(commonParentHtml);
      let selectedItemStart = commonParentHtml.indexOf(selectedItem);
      return commonParentHtmlStart + selectedItemStart;
    }
  };

  getAnnotateTagConfig = () => {
    const { currentRange, currentTagOption } = this.state;
    let currentRangeConfig = {};
    currentRangeConfig[`${currentTagOption.id}_${currentRange.top}_${currentRange.left}`] = {
      ...currentRange,
      top: currentRange.top,
      left: currentRange.left,
      tag: currentTagOption.id, // currentTag
      value: currentRange.value,
      start: currentRange.start,
      end: currentRange.end
    };
    return currentRangeConfig;
  };

  createNode = () => {
    let { annotatedTagJson, highlightTag } = this.state;
    let output = [];
    // Object.keys(annotatedTagJson)

    return Object.keys(highlightTag).map((tagId, index) => {
      const config = annotatedTagJson[tagId];
      if (config) {
        return this.highLight(config);
      }
      return null;
    });
  };

  //...............
  getUniqueID = () => {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + parseInt(Math.random() * 1000000000);
  };
  handleHighlight = (tagId) => {
    let { annotatedTagJson, highlightTag } = this.state;
    let newHighlightTag = {};
    //If already hightlighted, remove
    if (highlightTag[tagId]) {
      newHighlightTag = { ...highlightTag };
      delete newHighlightTag[tagId];
    } else {
      //If not hightlighted then highlight
      newHighlightTag = { ...highlightTag, [tagId]: annotatedTagJson[tagId] };
    }

    this.setState({
      highlightTag: newHighlightTag
    });
  };
  handleDeleteTag = tagId => {
    let { annotatedTagJson, highlightTag } = this.state;

    let newAnnotatedTagJson = { ...annotatedTagJson };
    delete newAnnotatedTagJson[tagId];
    let newHighlightTag = { ...highlightTag };
    delete newHighlightTag[tagId];

    //........
    this.setState({
      annotatedTagJson: newAnnotatedTagJson,
      highlightTag: newHighlightTag
    });
  };

  getSelectedItem = config => {
    let { annotatedTagJson } = this.state;

    return (
      <div>
        <div className="divBtn mtb10" onClick={this.handleShowSelectdItem.bind(this, false)}>
          [X] Hide Container
        </div>
        {Object.keys(annotatedTagJson)
          .map(prop => {
            let config = annotatedTagJson[prop];
            return (
              <div className="tagItemDetails">
                <div className="flex">
                  <div className="tagItem boxTag boxTagBig">Tag - {config.tag}</div>
                  <div className="divBtn mlr10 boxTag" onClick={() => this.handleHighlight(prop)}>
                    Highlight
                  </div>
                  <div className="divBtn mlr10 boxTag" onClick={() => this.handleDeleteTag(prop)}>
                    Delete
                  </div>
                </div>
                {/* <p className="tagItem">
                  Index - [{config.start} - {config.end}]{" "}
                </p> */}
                {/* <p className="tagItem">Html - {config.value}</p> */}
                <p className="tagItem">TEXT - {config.text}</p>
              </div>
            );
          })
          .reverse()}
      </div>
    );
  };

  updateSuggestorValue = (suggestorValue) => {
    this.setState({
      suggestorValue
    });
  }

  getSelectOptions = () => {
    return <SuggestorTag handleTagChange={this.handleTagChange}
      suggestorValue={this.state.suggestorValue}
      updateSuggestorValue={this.updateSuggestorValue} />;
    // return (
    //   <select id="select-annt-tag" value={this.state.currentTagOption.name} onChange={this.handleTagChange}>
    //     {this.tagOptions.map((tagOption, index) => {
    //       let style = {
    //         backgroundColor: tagOption.backgroundColor
    //       };
    //       return (
    //         <option key={tagOption.name} className="select-annt-option" value={tagOption.name} style={style}>
    //           {tagOption.value}
    //         </option>
    //       );
    //     })}
    //   </select>
    // );


  };
  handleTagChange = (currentTagOption) => {
    // let target = event.target;

    // let currentTagOption = this.tagOptions.filter(tagOption => {
    //   if (tagOption.name == target.value) {
    //     return true;
    //   }
    // })[0];

    this.setState({
      currentTagOption
    });
  };

  handleShowSelectdItem = isShowSelectedItems => {
    let { highlightTag } = this.state;
    let newHighlightTag = { ...highlightTag };
    if (!isShowSelectedItems) {
      newHighlightTag = {};
    }
    this.setState({
      highlightTag: newHighlightTag,
      isShowSelectedItems
    });
  };

  handleSaveAnnotation = () => {
    let { currentRange, annotatedTagJson, currentTagOption } = this.state;
    let newAnnotatedTagJson = { ...annotatedTagJson, ...this.getAnnotateTagConfig() };

    this.setState({
      annotatedTagJson: newAnnotatedTagJson,
      currentRange: {},
      currentTagOption: {},
      error: null
    });
  };

  isSaveAllowed = () => {
    let { currentTagOption, currentRange } = this.state;
    return currentTagOption.id && (currentRange.text && currentRange.text.length !== 0)

  }

  handleSubmit = () => {
    const { history } = this.props;
    const { annotatedTagJson } = this.state;
    // an array consisting of a single DOMString
    var oMyBlob = new Blob([this.iframeHtml], { type: 'text/html' });
    var data = new FormData();
    let file = new File([oMyBlob], this.htmlFileName, { lastModifiedDate: new Date });
    data.append('file', file, this.htmlFileName);
    data.append('json', JSON.stringify(annotatedTagJson));
    data.append('regexToBeRemoved', ` data-annotate=\\"_\\d{9}\\"`);


    let url = urlConfig.save;
    let reqObj = {
      mode: "no-cors",
      cache: "no-cache",
      method: "POST",
      body: data
    };

    fetch(url, reqObj)
      .then(response => {
        // console.log("response", response);
        history.push("/list");

      })
      .catch(error => {
        console.log("error", error);
      });
  };

  fetchIframeHtml = () => {
    const htmlFileName = this.htmlFileName;
    let iframeUrl = `${window.location.origin}/htmlFiles/${htmlFileName}`;
    let _this = this;
    let promise = fetch(iframeUrl)

    let p1 = promise.then((response) => {
      return response.clone().text();
    }).then((text) => {
      this.iframeHtml = text;
    })

    let p2 = promise.then((response) => {
      return response.clone().blob();
    }).then((blob) => {
      console.log('blog', blob);
      var objectURL = URL.createObjectURL(blob);
      this.iframeUrl = objectURL;

    })

    Promise.all([p1, p2], (response) => {
      return response;
    }).then(() => {
      this.setState({
        showPage: true
      });
    })
  }

  render() {
    const { isShowSelectedItems, currentRange, error, showPage } = this.state;
    if (!showPage) {
      return <div> Loading....</div>
    }
    // let iframeUrl = `${window.location.origin}/htmlFiles/${htmlFileName}`;
    return (
      <div className="annotation-section">
        <div className="left-section">
          <div className="middle-section-container">
            <div className="middle-section">
              <iframe ref={this.iframeRef} id="iframe_annotation" title="iframe Example 2" style={{ border: "none" }} src={this.iframeUrl} onLoad={this.handleIframeLoad}></iframe>
              <div className="annotatedNodeElm">{this.createNode()}</div>
            </div>
          </div>
        </div>
        <div className="right-section">
          <div className="select-section">
            <label>
              <b>Annotation</b>
              {this.getSelectOptions()}
            </label>
            <div className="selectedValue">{currentRange.text}</div>
            {/* {error && <p className="error"> {error}</p>} */}
            {this.isSaveAllowed() && <div className="divBtn mtb10" onClick={this.handleSaveAnnotation}>
              Save{" "}
            </div>}
          </div>

          <div className="divBtn mtb10" onClick={this.handleShowSelectdItem.bind(this, true)}>
            Show Selected Items{" "}
          </div>

          <div className="divBtn" onClick={this.handleSubmit}>
            Submit{" "}
          </div>
        </div>
        {isShowSelectedItems && <div className="select-items">{this.getSelectedItem()}</div>}
      </div>
    );
  }
}

export default Annotate;
