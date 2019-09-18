import React, { Component } from 'react';

let annotatedNodeJson = {
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

class AnnotationClass {
    constructor(name) {
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
        this.initialize();
    }

    initialize() {
        //Event binding on iframe
        this.currentTagOption = this.tagOptions[0];

        window.getSelection().addRange(new Range());
        let iframe_annotation = document.getElementById('iframe_annotation');

        var fragment = document.createElement('div');
        fragment.className = 'annotatedNodeElm';
        document.querySelector('.middle-section').appendChild(fragment);
        this.annotatedNodeElm = document.querySelector('.annotatedNodeElm');


        // iframe_annotation.addEventListener('onmousedown', getStartPosition);
        this.iframeDocument = iframe_annotation.document ||
            iframe_annotation.contentDocument ||
            iframe_annotation.contentWindow.document;

        //Assign iframe content's height to its child 
        iframe_annotation.style.height = this.iframeDocument.body.scrollHeight + 100 + 'px';

        this.iframeDocument.body.addEventListener('mouseup', this.getEndPosition.bind(this));

        this.assignUniqueAttribue(this.iframeDocument);

        // node.designMode = "on";
        // node.body.contentEditable = true;

        this.updateAnnotationNode();
        this.updateSelectOptions();


    }
    assignUniqueAttribue(node) {
        var elements = node.querySelectorAll('body *');
        let elementsLength = elements.length;
        for (let i = 0; i < elementsLength; i++) {
            elements[i].setAttribute('data-ann-id', this.getUniqueID() + '-' + i)
        }

    }



    getStartPosition(event) {
        // startPos = getXYRelativeToWindow(event.currentTarget);
    }

    getEndPosition(event) {
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
                    tag: this.currentTagOption.name,
                    start,
                    end,
                    backgroundColor: this.currentTagOption.backgroundColor

                });

                this.updateAnnotationNode()

                return div.innerHTML;
            }
        }

    }

    getChildHtml(childHtml) {

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

    getSelectedNodeIndex(parentHtml, selectedItem, range, selection, event) {
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


    updateAnnotateConfig(config) {

        annotatedNodeJson[`${config.tag}_${config.top}_${config.left}`] = {
            top: config.top,
            left: config.left,
            tag: config.tag,
            value: config.value,
            start: config.start,
            end: config.end,
            backgroundColor: config.backgroundColor
        };
        return;

    }

    createNode(config) {
        let { top, left, value, tag, backgroundColor } = config;
        let annotatedChild = document.createElement('span');
        annotatedChild.className = 'annotatedChild';

        let style = {
            position: 'absolute',
            top: (top - 30) + 'px',
            left: (left - 20) + 'px',
            'z-index': 9000,
            'background-color': backgroundColor || '#fffff',
            height: '10px',
            'padding': '10px',
            width: '100px',
            'border': '4px',
            'overflow': 'hidden',
            'text-overflow': 'ellipsis'
        };

        for (let prop in style) {
            annotatedChild.style[prop] = style[prop];
        }
        annotatedChild.innerText = tag;
        return annotatedChild;
    }


    //...............
    getUniqueID() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    };



    updateAnnotationNode() {
        this.annotatedNodeElm.innerHTML = null;
        document.querySelector('.right-section').innerHTML = null;
        for (let prop in annotatedNodeJson) {
            if (annotatedNodeJson.hasOwnProperty) {
                let config = annotatedNodeJson[prop];
                let annotatedChild = this.createNode(config);
                let selectedItem = this.getSelectedItem(config);
                this.annotatedNodeElm.appendChild(annotatedChild)
                document.querySelector('.right-section').appendChild(selectedItem)
            }
        }

    }

    getSelectedItem(config) {
        let div = document.createElement('div');
        // <div>
        //     p  - tag
        //     p - value
        let tagName = document.createElement('p');
        tagName.innerText = `Tag - ${config.tag}`;
        div.appendChild(tagName);

        let tagValue = document.createElement('p');
        tagValue.innerText = `[${config.start} - ${config.end}] => ${config.value}`;
        tagValue.style.color = '#ca2424'
        div.appendChild(tagValue);
        return div;
    }

    updateSelectOptions() {
        const selectAnntElm = document.getElementById('select-annt-tag');
        selectAnntElm.addEventListener('change', this.handleTagChange.bind(this))

        let optionsElm = [];
        this.tagOptions.forEach((option, index) => {
            let optionElm = document.createElement('option');
            optionElm.innerText = option.value;
            optionElm.setAttribute('value', option.name)
            optionElm.className = "select-annt-option";
            optionElm.style.backgroundColor = option.backgroundColor;
            optionElm.style.color = '#fffff';

            selectAnntElm.appendChild(optionElm)
        });
    }
    handleTagChange(event) {
        debugger;
        this.tagName = event.target.value;

        this.currentTagOption = this.tagOptions.filter((tagOption) => {
            if (tagOption.name == this.tagName) {
                return true;
            }
        })[0];

    }
}

class Annotate extends Component {

    componentDidMount() {
        var annotatedObj = new AnnotationClass();
    }

    render() {
        return (
            <div className="container">
                <div className="left-section inlblc">
                    <div className="top-section">
                        <p>
                            <b>HTML TAG ANNOTATION</b>
                        </p>
                        <label>
                            <b>Select Tag-</b>
                        </label>
                        <select id="select-annt-tag">

                        </select>

                    </div>
                    <div className="middle-section-container">

                        <div className="middle-section">

                            <iframe id="iframe_annotation" title="iframe Example 2" width="400" height="300" style={{ "border": "none" }} src="./annotation.html">
                            </iframe>


                        </div>

                    </div>

                    <div className="bottom-section">
                        Bottom section
            </div>
                </div>
                <div className="right-section inlblc">

                </div>
            </div>
        );
    }
}

export default Annotate;