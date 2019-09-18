import React, { Component } from 'react';
import './annotate.scss';
let annotatedTagJson = {
    name_100_30: {
        top: 100,
        left: 30,
        tag: 'name',
        value: '<span>Ravi</span>',
        start: 50, //Start index
        end: 67, //End index,
        backgroundColor: 'blue'
    },
    email_200_50: {
        top: 200,
        left: 50,
        tag: 'email',
        value: 'vipul@naukri.com',
        start: 20,
        end: 36,
        backgroundColor: 'green'
    }
};

class Annotate extends Component {

    constructor(params) {
        super(params);
        this.tagOptions = [
            {
                name: 'name',
                value: "Name",
                backgroundColor: 'blue'
            },
            {
                name: 'email',
                value: "Email",
                backgroundColor: 'green'
            },
            {
                name: 'skill',
                value: "Skill",
                backgroundColor: 'grey'
            },
            {
                name: 'company',
                value: "Company",
                backgroundColor: 'aqua'
            }
        ];

        this.state = {
            currentTagOption: this.tagOptions[0],
            annotatedTagJson: { ...annotatedTagJson }
        }
        this.iframeRef = React.createRef();
    }

    componentDidMount() {

    }
    initialize = () => {
        // node.designMode = "on";
        // node.body.contentEditable = true;

    }

    handleIframeLoad = (event) => {
        // window.getSelection().addRange(new Range());
        // console.log('iframeRef', this.iframeRef)
        let iframe_annotation = document.getElementById('iframe_annotation');
        // iframe_annotation.addEventListener('onmousedown', getStartPosition);
        this.iframeDocument = this.iframeRef.document ||
            iframe_annotation.contentDocument ||
            iframe_annotation.contentWindow.document;

        //Assign iframe content's height to its child 
        iframe_annotation.style.height = this.iframeDocument.body.scrollHeight + 100 + 'px';

        this.iframeDocument.body.addEventListener('mouseup', this.getEndPosition.bind(this));

        this.assignUniqueAttribue(this.iframeDocument);

    }
    assignUniqueAttribue = (node) => {
        var elements = node.querySelectorAll('body *');
        let elementsLength = elements.length;
        for (let i = 0; i < elementsLength; i++) {
            elements[i].setAttribute('data-ann-id', this.getUniqueID() + '-' + i)
        }
    }

    getStartPosition(event) {
        // startPos = getXYRelativeToWindow(event.currentTarget);
    }

    getEndPosition = (event) => {
        var range;

        let node = this.iframeDocument;

        if (node.getSelection) {
            let selection = node.getSelection();
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);

                let clonedSelection = range.cloneContents();
                //get clientRect position of selected node or characters
                let clientRects = range.getClientRects();
                let firstRect = clientRects[0];
                let lastRect = clientRects[0];

                var div = document.createElement('div');
                div.appendChild(clonedSelection);
                // node.execCommand('insertHTML', true, `<mark class="ddddd">${div.innerHTML}</mark>`);
                // console.log('innerHTML', div.innerHTML);
                if (div.innerHTML.trim().length === 0) {
                    return;
                }
                var childHtml = this.getChildHtml(`${div.innerHTML}`);
                var parentHtml = `${node.body.parentNode.outerHTML}`;
                // debugger;
                var start = this.getSelectedNodeIndex(parentHtml, childHtml, range, selection, event);
                var end = start + childHtml.length;

                // console.log('gggggggggggg', start, end, parentHtml)


                this.updateAnnotateConfig({
                    top: firstRect.top,
                    left: firstRect.left,
                    value: childHtml,
                    tag: this.state.currentTagOption.name,
                    start,
                    end,
                    backgroundColor: this.state.currentTagOption.backgroundColor

                });

                // this.updateAnnotationNode()

                return div.innerHTML;
            }
        }

    }

    getChildHtml = (childHtml) => {

        //Add all openig tags data
        while (childHtml.indexOf('<') === 0) {
            console.log('step 1');
            childHtml = childHtml.slice(childHtml.indexOf('>') + 1);
        }
        //Delete all end tags data
        while (childHtml.lastIndexOf('>') === childHtml.length - 1) {
            console.log('step 2');
            childHtml = childHtml.slice(0, childHtml.lastIndexOf('<'));
        }
        return childHtml;
    }

    getSelectedNodeIndex = (parentHtml, selectedItem, range, selection, event) => {
        console.log('range', range, selection);
        if (selectedItem.includes('<') && selectedItem.includes('>')) {
            return parentHtml.indexOf(selectedItem);
        } else {
            let parentElement = range.commonAncestorContainer;
            while (parentElement.nodeType !== 1) {
                console.log('step 3');
                parentElement = parentElement.parentElement;
            }
            let commonParentHtml = parentElement.outerHTML;
            let commonParentHtmlStart = parentHtml.indexOf(commonParentHtml);
            let selectedItemStart = commonParentHtml.indexOf(selectedItem);
            return commonParentHtmlStart + selectedItemStart;
        }
    }


    updateAnnotateConfig = (config) => {
        let annotatedTagJson = { ...this.state.annotatedTagJson };
        annotatedTagJson[`${config.tag}_${config.top}_${config.left}`] = {
            top: config.top,
            left: config.left,
            tag: config.tag,
            value: config.value,
            start: config.start,
            end: config.end,
            backgroundColor: config.backgroundColor
        };
        this.setState({
            annotatedTagJson
        });
    }

    createNode = () => {
        let { annotatedTagJson } = this.state;
        let output = [];
        return Object.keys(annotatedTagJson).map((prop, index) => {
            const config = annotatedTagJson[prop];
            let { top, left, value, tag, backgroundColor } = config;
            let style = {
                position: 'absolute',
                top: (top - 30) + 'px',
                left: (left - 20) + 'px',
                'zIndex': 9000,
                'backgroundColor': backgroundColor || '#fffff',
                height: '10px',
                'padding': '10px',
                width: '100px',
                'border': '4px',
                'overflow': 'hidden',
                'textOverflow': 'ellipsis'
            };
            return (<span key={prop} className="annotatedChild" style={style}>{tag} </span>)
        })

    }


    //...............
    getUniqueID = () => {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    };


    getSelectedItem = (config) => {
        let { annotatedTagJson } = this.state;
        return Object.keys(annotatedTagJson).map((prop) => {
            let config = annotatedTagJson[prop];
            return (<div className="select-item">
                <p> Tag - {config.tag}</p>
                <p>[{config.start} - {config.end}] => {config.value}</p>
            </div>)
        });
    }

    getSelectOptions = () => {
        return <select
            id="select-annt-tag"
            value={this.state.currentTagOption.name}
            onChange={this.handleTagChange} >
            {this.tagOptions.map((tagOption, index) => {
                let style = {
                    backgroundColor: tagOption.backgroundColor,
                }
                return <option
                    key={tagOption.name}
                    className="select-annt-option"
                    value={tagOption.name} style={style} >{tagOption.value}
                </option>
            })}
        </select>


    }
    handleTagChange = (event) => {
        let target = event.target;

        let currentTagOption = this.tagOptions.filter((tagOption) => {
            if (tagOption.name == target.value) {
                return true;
            }
        })[0];

        this.setState({
            currentTagOption
        });

    }

    render() {

        const { history, match } = this.props;
        let { htmlFileName } = match.params;
        let iframeUrl = `${window.location.origin}/htmlFiles/${htmlFileName}`
        return (
            <div className="annotation-section">
                <div className="left-section">
                    <div className="middle-section-container">

                        <div className="middle-section">

                            <iframe ref={this.iframeRef} id="iframe_annotation" title="iframe Example 2" style={{ "border": "none" }} src={iframeUrl} onLoad={this.handleIframeLoad}>
                            </iframe>
                            <div className="annotatedNodeElm">

                                {this.createNode()}
                            </div>

                        </div>

                    </div>
                </div>
                <div className="right-section">
                    <div className="select-section">
                        <label>
                            <b>Annotation</b>
                            {this.getSelectOptions()}

                        </label>
                        <div className="selectedValue">
                            Some value
                         </div>


                    </div>
                    <div className="select-items">
                        {this.getSelectedItem()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Annotate;