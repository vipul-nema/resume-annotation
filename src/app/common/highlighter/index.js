/**
 * React Text Highlighter Plugin
 * The plugin takes a seach text as its input and highlights it in the containing html
 * Options:
 * - Accepts string\array of strings or regex as search parameters
 * - Can have custom classes for highlighted elements as well as plain elements
 * - Can have custom wrapper elements for highlighted words
 * - Support HTML nodes or React Components(only which have dom elements as children) as children
 * - Supports both global and first occurence search
 * 
 * @author : Akshay sehgal
 * @version : 1.0.0
 * @since : 27/Sep/2018 
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class TextHighlighter extends React.Component {


    /**
     * @private
     * Renders given text into a span element
     * @param {String} str input string expression to render plain element
     * @param {String} key unique key for the element
     * @return {JsxElement} 
     */
    _renderNormal(str, key) {
        const props = {
            key,
            className: this.props.className ? this.props.className : null
        }
        const children = str;
        return React.createElement(this.props.wrapElement, props, children);
    }

    /**
     * @private
     * Renders given text into a highlighted span element
     * @param {String} str input string expression to render highlighted element
     * @param {String} key unique key for the element
     * @return {JsxElement} 
     */
    _renderHighlighted(str, key) {
        const props = {
            key,
            className: this.props.highlightClass ? this.props.highlightClass : null,
            style: !this.props.highlightClass ? this.props.highlightStyle : {}
        }
        const children = str;
        return React.createElement(this.props.highlightWrapElement, props, children);

    }

    /**
    * @private
    * Searches for given expression in a string and render it into a collection of  
    * highlighted and plain elements
    * @param {String} text  string expression to search in
    * @param {RegExp} search regular expression to search for
    * @return {JsxElement} 
    */
    _highlight(text, search) {
        const resultHTML = []; let key = 0;
        if (!this.props.isGlobalSearch) {
            const matchedArr = search.exec(text);
            if (!matchedArr) {
                resultHTML.push(this._renderNormal(text, key));
                return resultHTML;
            } else {
                const begin = matchedArr.index, end = matchedArr.index + matchedArr[0].length;

                const normal = text.slice(0, begin), highlight = text.slice(begin, end);
                if (normal) { resultHTML.push(this._renderNormal(normal, key)); key++; }
                if (highlight) { resultHTML.push(this._renderHighlighted(highlight, key)); key++; }
                resultHTML.push(this._renderNormal(text.slice(end), key));

            }

            return resultHTML;
        }

        while (text) {
            const matchedArr = search.exec(text);
            if (!matchedArr) {
                resultHTML.push(this._renderNormal(text, key));
                return resultHTML;
            } else {
                const begin = matchedArr.index, end = matchedArr.index + matchedArr[0].length;
                if (begin === 0 && end === 0) {
                    return resultHTML;
                }
                const normal = text.slice(0, begin), highlight = text.slice(begin, end);
                if (normal) { resultHTML.push(this._renderNormal(normal, key)); key++; }
                if (highlight) { resultHTML.push(this._renderHighlighted(highlight, key)); key++; }

                text = text.slice(end);
            }


        }

        return resultHTML;
    }

    /**
     * @private
     * Recursively parses the html inside parent node and highlights the passed string
     * @param {ReactElement} children valid object of children elements of parent node
     * @param {RegExp} search regular expression to search for
     */
    _parseAndHighlight(children, search) {
        if (!children) {
            return children;
        }
        return React.Children.map(children, (child, idx) => {

            if (this._isChildrenPrimitive(child)) {
                return this._highlight(child, search);
            } else {
                const chld = child || <React.Fragment />;
                const childOfChild = chld.props && chld.props.children;
                const parsedChildren = this._parseAndHighlight(childOfChild, search);
                return React.cloneElement(chld, chld.props, parsedChildren);
            }
        })

    }

    /**
     * @private
     * Determines if the children passed are primitives or not
     * @param {ReactELement} children child elements 
     * @return {Boolean} 
     */
    _isChildrenPrimitive(children) {
        return (/string|number|boolean/).test(typeof children);
    }

    /**
     * @private
     * Get the escaped version of given string
     * @param {String} str Input string for converting into escaped string
     * @return {String} Escaped string
     */
    _escapeString(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
    * Convert a given seacrh string in the form of a regular expression. 
    * @param {String} search search string for converting into RegExp Object  
    * @param {Boolean} isEscaped detemines whether the search string is escaped or not
    * @return {RegExp} output RegExp object
    */
    _getSearchRegex(search, isEscaped) {
        if (search instanceof RegExp) {
            return search;
        }
        const escapedSearch = isEscaped ? search : this._escapeString(search);
        const caseSense = this.props.isCaseSensitive ? '' : 'i';
        return new RegExp(escapedSearch, caseSense);
    }


    render() {
        /**Return children as it is if search props is missing */
        if (!this.props.search) {
            return this.props.children;
        }
        let sRegex;
        /**If search prop is an Array then escape each value */
        if (this.props.search instanceof Array) {
            const finalStr = this.props.search.map(search => this._escapeString(search)).join("|");
            sRegex = this._getSearchRegex(finalStr, true);
        } else {
            sRegex = this._getSearchRegex(this.props.search, false);
        }

        /**
         * If childdren of TextHighlighter are not text elements then
         * parse the nodes first
         */
        if (!this._isChildrenPrimitive(this.props.children)) {
            if (React.Children.count(this.props.children) > 1) {
                console.error("TextHighlighter must contain one wrapper element as a child");
                return;
            } else if (!React.isValidElement(this.props.children)) {
                console.error("TextHighlighter does not contain valid react elements");
                return;
            }

            /**the immediate child of TextHighlighter will be considered parent for parsed elements**/
            const parentNode = this.props.children;
            /**Parse and highlight search words in children */
            const parsedChildren = this._parseAndHighlight(parentNode.props.children, sRegex);
            /**Clone the parent element */
            const parsedParentNode = React.cloneElement(parentNode, parentNode.props, parsedChildren)
            return (
                <React.Fragment>
                    {
                        parsedParentNode
                    }
                </React.Fragment>

            );

        }

        return <span className="thWrapper">
            {
                this._highlight(this.props.children, sRegex)
            }
        </span>
    }
}

/**
 * Define default properties
 */
TextHighlighter.defaultProps = {
    isCaseSensitive: false,
    wrapElement: "span",
    highlightWrapElement: "span",
    highlightStyle: { fontWeight: "bold" },
    isGlobalSearch: true
}

/**
 * Define prop types
 */
TextHighlighter.propTypes = {
    /**
     * Boolean which determines if the search should be 
     * case sensitive or not. Default is false
     */
    isCaseSensitive: PropTypes.bool,
    /**
     * Boolean which determines if the search is global
     * or stops at first occurence. Default is true
     */
    isGlobalSearch: PropTypes.bool,
    /**
     * Custom css class for highlighted nodes
     */
    highlightClass: PropTypes.string,
    /**
     * Custom css class for non highlighted nodes
     */
    className: PropTypes.string,
    /**
     * Custom css style for highlighted nodes. Default is
     *  `font-weight: bold` 
     */
    highlightStyle: PropTypes.object,
    /**
     * custom wrap element for non highlighted texts. Default is 
     * `span`
     */
    wrapElement: PropTypes.string,
    /**
     * custom wrap element for highlighted texts. Default is 
     * `span`
     */
    highlightWrapElement: PropTypes.string,

    /**
     * Search string or regex or an array of strings
     */
    search: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(RegExp),
        PropTypes.arrayOf(PropTypes.string)
    ]).isRequired
}