/**
 * A Common component for fetching the suggestions based on user input
 * Options:
 * - User can list down the options based on the input given in text field
 * - User can use keys for navigation and selection of data items
 * - Supports custom template for list items as well as for the whole menu
 * - Support multi level search
 * - Has built in Support for text highlighting of the  value search. User can pass the highlighter config in a prop
 *
 * Basic Usage:
 *  <Suggestor onChange={onChange func} value={string value}
 *              dataItems={array of items} fetchData={fetch from server} />
 * For basic usage user  needs to give these mandatory props:
 * onChange - Callback which is called when user types into the suggestor. Here user needs to set the value which will be passed
 *            in value prop
 * value - String value typed by user into the input field which is set as a state of component where Suggestor is called, in onChange callback
 * dataItems - Array of items to be shown when user types
 * fetchData - Callback which is called for each search, gets data from server and sets dataItems Array.(Again just like 'value' prop, dataItems
 *             needs to be in parent Component state where the Suggestor is called, as it changes at every search)
 *
 * Note: If data is not to be retrieved from server then, a data prop will be passed instead of both 'dataItems' and 'fetchData'.
 *       This feature is not implemented yet and is under discussions
 *
 * @author Akshay sehgal
 * @version v1.0.0
 * @since: 03/10/2018
 */

import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { debounce, throttle } from "throttle-debounce";
import TextHighlighter from "../highlighter";
import "./suggestor.scss";

/**
 * @class
 * A Presentation Component for displaying the cross button when
 * user types something in the text field, User can also pass in a custom template for
 * rendering the cross
 */
class CrossButton extends React.Component {
    constructor() {
        super();
        this.setRef = this.setRef.bind(this);
    }
    setRef(node) {
        this.props.crossRef(node);
    }
    render() {
        let cross;
        if (this.props.renderCross && this.props.renderCross.constructor.name === "Function") {
            cross = this.props.renderCross();
        } else {
            cross = <span className="sugCross">&#10005;</span>;
        }
        return (
            <span ref={this.setRef} className="sugCrossBt" onClick={this.props.onClick} style={{ display: this.props.inputVal ? "inline-block" : "none" }}>
                {cross}
            </span>
        );
    }
}

/**
 * @class
 * A Presentational Component to render the input field of suggestor
 * passed props and mandatory props are merged and paased to the template
 */
class Input extends React.Component {
    constructor() {
        super();
        this.setRef = this.setRef.bind(this);
    }
    setRef(node) {
        this.props.inputRef(node);
    }
    render() {
        const input = this.props.renderInput(
            {
                ...this.props.inputProps,
                onChange: this.props.handleChange,
                onFocus: this.props.handleFocus,
                onBlur: this.props.handleBlur,
                onKeyDown: this.props.handleKeyDown,
                onClick: this.props.handleClick,
                value: this.props.value,
                ref: this.setRef
            },
            this.props.isTextArea
        );
        return (
            <div className="sugInputWrapper">
                {input}
                {this.props.shouldRenderCross && <CrossButton crossRef={this.props.crossRef} onClick={this.props.onClick} renderCross={this.props.renderCross} inputVal={this.props.inputVal} />}
            </div>
        );
    }
}

/**
 * @class
 * A Presentational Component to render the Menu.
 */
class Menu extends React.Component {
    constructor() {
        super();
        this.ref = null;
        this.setRef = this.setRef.bind(this);
    }

    setRef(node) {
        this.props.menuRef(node);
        this.ref = node;
    }
    render() {
        return (
            <div className="sugMenuWrapper" id="sugMenu" ref={this.setRef}>
                {this.props.children}
            </div>
        );
    }
}

/**
 * @class
 * A Presentational Component to render each menu item, support custom template.
 * Wraps each item with an Instance of TextHighlighter for highlightinh the searched keyword
 */
class MenuItem extends React.Component {
    constructor() {
        super();
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.setRef = this.setRef.bind(this);
    }
    /**
     * Handle the mouse over event
     * @param {Event} event - mouse enter event object
     */
    handleMouseEnter(event) {
        this.props.onMouseEnter(this.props.index);
    }
    /**
     * Handle the mouse click event
     * @param {DOMEvent} event - mouse click event object
     */
    handleMouseClick(event) {
        this.props.onClick(this.props.item, true);
    }
    setRef(node) {
        this.props.itemRef(node, this.props.index);
    }
    render() {
        const isChildren = this.props.children;
        const { item } = this.props;
        /**
         * Set class names based on whether custom template is passed or not,
         * 'sugItemCustomWrapper' added so that user can
         * style the wrapper of each item by using this class
         */
        let classes;
        if (isChildren) {
            classes = "sugItemCustomWrapper " + this.props.className;
        } else {
            classes = "sugItemWrapper " + this.props.className;
        }
        const itemjsx = (
            <div className={classes} tabIndex="0" ref={this.setRef} onMouseEnter={this.handleMouseEnter} onClick={this.handleMouseClick}>
                {isChildren ? (
                    this.props.children
                ) : (
                        <div className="sugItem">
                            <label id={item.id}>{item.label}</label>
                        </div>
                    )}
            </div>
        );
        /**Trim each search word before searching */
        const searchStr = this.props.searchWord ? this.props.searchWord.trim() : "";
        const finalItem =
            String(item.labelType).toLowerCase() === "s" ? (
                <React.Fragment>{itemjsx}</React.Fragment>
            ) : (
                    <TextHighlighter search={searchStr} {...this.props.hProps}>
                        {itemjsx}
                    </TextHighlighter>
                );
        return <React.Fragment>{finalItem}</React.Fragment>;
    }
}

/**
 * @class
 * Main component, which renders the suggestor as whole. Handles rendering, event binding and implemetation
 * logic of the Suggestor
 */
export default class Suggestor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeElementIndex: null,
            isMenuOpen: false,
            isElementActiveWithKeys: false
        };
        this.refs = {};
        this.suggestorData = [];
        this.searchStartIdx = 0;
        this.searchKey = "";
        /**Refs method bindiing */
        this.inputRef = this.inputRef.bind(this);
        this.itemRef = this.itemRef.bind(this);
        this.menuRef = this.menuRef.bind(this);
        this.crossRef = this.crossRef.bind(this);

        /**Event Handlers method binding */
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleChangeMultiSearch = this.handleChangeMultiSearch.bind(this);
        this.handleInputFocus = this.handleInputFocus.bind(this);
        this.handleInputClick = this.handleInputClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.ignoreBlurEvent = this.ignoreBlurEvent.bind(this);
        this.unSetActiveELement = this.unSetActiveELement.bind(this);

        /**Bind logical functions */
        this.highlightItem = this.highlightItem.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.setInputBlurEvent = this.setInputBlurEvent.bind(this);
        this.clearInput = this.clearInput.bind(this);
        this.getMenuDataThrottle = throttle(this.props.delay, this.getMenuData);
        this.getMenuDataDebounce = debounce(this.props.delay, this.getMenuData);
    }

    /**
     * Set the ref for a single menu item component
     * @param {HTMLElement} node - Element node of menu item
     * @param {*} index - index of menu item
     */
    itemRef(node, index) {
        this.refs[`item-${index}`] = node;
    }
    /**
     * Set the ref for a menu component
     * @param {HTMLElement} node - Element node of menu component
     */
    menuRef(node) {
        this.refs["menu"] = node;
    }
    /**
     * Set the ref for a input component
     * @param {HTMLElement} node - Element node of input component
     */
    inputRef(node) {
        this.refs["input"] = node;
        if ("getInputRef" in this.props && this.props.getInputRef.constructor === Function) {
            this.props.getInputRef(node);
        }
    }
    /**
     * Set the ref for a cross component
     * @param {HTMLElement} node - Element node of cross component
     */
    crossRef(node) {
        this.refs["crossBt"] = node;
    }

    /**
     * @method
     * Check if the input box is currently focussed or not
     * @return {Boolean}
     */
    isInputFocused() {
        return document.activeElement === ReactDOM.findDOMNode(this.refs.input);
    }
    /**
     * @method
     * Check if the suggestor menu is opened or not
     * @return {Boolean}
     */
    isMenuOpen() {
        /* 'shouldListOpen' in this.props ? this.props.shouldListOpen : this.state.isMenuOpen; */
        return this.state.isMenuOpen && this.props.dataItems.length > 0;
    }

    /**
     * @method
     * Opens the menu box if not already open and the input keys typed are greater than
     * or equal to the one configured
     */
    openMenu() {
        const limit = this.refs.input.value ? this.refs.input.value.length : 0;
        if (!this.isMenuOpen() && limit >= this.props.searchKeysLimit) {
            this.setState({ isMenuOpen: true });
        }
    }
    /**
     * @method
     * Clears the the value types in text box and initialise the state. This
     * function is used by 'Cross' component.
     */
    clearInput() {
        this.refs.input.value = "";
        this.props.onChange(null, "");
        this.refs.input.focus();
        this.initialiseState();
    }

    /**
     * @method
     * This function highlights the currently active menu item in the Suggestor menu
     * @param {Number} itemIndex index of currently active menu item
     * @param {Boolean} isElementActiveWithKeys  boolean which return whether item is made active using keys or mouseover
     * @param {Boolean} shouldOpenMenu determines whether to open menu(This handles the case when arrow down is pressed on input and menu is not open)
     */
    highlightItem(itemIndex, isElementActiveWithKeys, shouldOpenMenu) {
        const item = this.props.dataItems[itemIndex];
        const itemLabelType = String(item.labelType);
        if (item.disabled || itemLabelType.toLowerCase() === "s") {
            if (!isElementActiveWithKeys) {
                this.setState({
                    activeElementIndex: -1
                });
            }

            return;
        }
        let stateObj = {
            activeElementIndex: itemIndex,
            isElementActiveWithKeys
        };
        /**If item is active with keys then scroll it into view port if not there */
        if (isElementActiveWithKeys) {
            this.refs["item-" + itemIndex] &&
                this.refs["item-" + itemIndex].scrollIntoView({
                    block: "nearest",
                    inline: "nearest",
                    behavior: "instant"
                });
        }
        if (shouldOpenMenu) {
            stateObj = Object.assign(stateObj, { isMenuOpen: true });
        }
        this.setState(stateObj);
    }

    /**
     * @method
     * Dynamically style menu, based on text box's dimensions
     */
    styleMenu() {
        const inputNode = this.refs.input,
            inputNodeBoundaries = inputNode.getBoundingClientRect(),
            menuStyles = {
                /* top: inputNodeBoundaries.bottom,
                        left: inputNodeBoundaries.left, */
                width: inputNodeBoundaries.width
            };
        /* this.refs.menu.style.top = menuStyles.top +"px";
            this.refs.menu.style.left = menuStyles.left + "px"; */
        if (this.refs.menu) {
            this.refs.menu.style.minWidth = menuStyles.width + "px";
        }
    }
    /**
     * @method
     * Dynamically style menu based on text box's dimensions
     */
    styleCross() {
        const inputNode = this.refs.input,
            inputNodeBoundaries = inputNode.getBoundingClientRect(),
            crossBound = this.refs.crossBt ? this.refs.crossBt.getBoundingClientRect() : {};
        if (this.props.shouldRenderCross && this.refs.crossBt) {
            this.refs.crossBt.style.top = inputNodeBoundaries.height / 2 - crossBound.height / 2 + "px";
            this.refs.crossBt.style.right = "5px";
        }

        this.isCrossStyled = true;
    }

    /**
     * @method
     * Selects an item from the menu list
     * @param {Object} item
     * @param {Boolean} closeMenu
     */
    selectItem(item, closeMenu) {
        const { isMultiSearch, onChange } = this.props;
        const itemLabelType = String(item.labelType);
        if (item.disabled || itemLabelType.toLowerCase() === "s") {
            return;
        }
        this.setInputBlurEvent(false);
        let itemToPass = item.label;
        /**If multi level search then extracts the search word after last comma, then search for the same*/
        if (isMultiSearch) {
            const itemArr = this.refs.input.value.split(",");
            if (itemArr.length > 1) {
                itemArr.pop();
                itemToPass = itemArr.concat([item.label]).join(",");
            }
        }
        onChange({}, itemToPass);
        if (closeMenu) {
            this.initialiseState();
        }
        this.searchKey = item.label;
        this.props.onSelect({ ...item, label: itemToPass }, this.refs.input.value);
    }

    /**
     * React life cycle methods
     */
    componentWillMount() {
        this.refs = {};
        this.ignoreBlur = false;
        this.ignoreFocus = false;
    }
    componentDidMount() {
        if (this.props.isTextArea) {
            this.resizeTextArea();
        }
        this.inputKeyHandlers = this.getInputKeyHandlers();
        if (this.isMenuOpen()) {
            this.styleMenu();
        }
        this.props.focusOnMount &&
            this.refs.input &&
            setTimeout(_ => {
                this.refs.input.focus();
            });
    }
    componentDidUpdate(prevProps, prevState) {
        const { activeElementIndex, isMenuOpen } = this.state;
        const { shouldRenderCross, value, isTextArea, dataItems, shouldOpenWithoutSearch } = this.props;
        /**Style menu on each render */
        if ((this.isMenuOpen() && !prevState.isMenuOpen) || (dataItems.length && !prevProps.dataItems.length)) {
            this.styleMenu();
        } else if (isTextArea && prevProps.value !== this.props.value) {
            setTimeout(_ => {
                this.resizeTextArea();
            });
        }
        /**Initialise the active element if activeElementIndex is out of bound */
        if (activeElementIndex && activeElementIndex >= this.getDataItems().length) {
            this.setState({
                activeElementIndex: null,
                isElementActiveWithKeys: false
            });
        }
        /**Style cross */
        if (shouldRenderCross && value && !this.isCrossStyled) {
            this.setState({
                inputPadRight: {
                    paddingRight: "15px"
                }
            });
            this.styleCross();
        } else if (!value && shouldRenderCross && this.isCrossStyled) {
            this.isCrossStyled = false;
            this.setState({
                inputPadRight: {
                    paddingRight: "5px"
                }
            });
        }

        /**Open menu when shouldOpenWithoutSearch is true and
         * if input field is still empty but data items are present
         */
        if (shouldOpenWithoutSearch && !value && dataItems.length && !isMenuOpen && !this.isInputBlurred) {
            this.setState({ isMenuOpen: true });
        }
    }

    /**
     * @method
     * Initialises the state of the component
     * @param {Function} callback - function to run after setting state
     */
    initialiseState(callback) {
        const obj = {
            isMenuOpen: false,
            activeElementIndex: null,
            isElementActiveWithKeys: false
        };
        this.suggestorData = [];
        if (callback) {
            this.setState(obj, callback);
        } else {
            this.setState(obj);
        }
    }

    /**
     * @method
     * Handles the blur event of input box
     * @param {Event} event - blur event object
     */
    handleInputBlur(event) {
        this.isInputBlurred = true;
        /**If blur event is to be ignored */
        if (this.ignoreBlur) {
            this.ignoreFocus = true;
            /**Uncomment this if this feature is required in future */
            //this.refs.input.focus();
            return;
        }
        let inputBlurSelectCallback;
        const { activeElementIndex } = this.state;
        /**Select the active element on blur */
        if (this.props.selectOnBlur && activeElementIndex !== null) {
            const items = this.getDataItems();
            const item = items[activeElementIndex];
            inputBlurSelectCallback = () => this.selectItem(item);
        }
        if ("getListTemplate" in this.props) {
            setTimeout(() => {
                this.initialiseState(inputBlurSelectCallback);
            }, 10);
        } else {
            this.initialiseState(inputBlurSelectCallback);
        }
        /**Run the custom blur event if passed in the prop */
        if ("onBlur" in this.props.inputProps) {
            this.props.inputProps.onBlur(event);
        }
    }
    /**
     * @method
     * Handles the focus event of input box
     * @param {Event} event - focus event object
     */
    handleInputFocus(event) {
        this.isInputBlurred = false;
        if (this.ignoreFocus) {
            this.ignoreFocus = false;
            return;
        }
        //console.error("dsdscsdc",this.props.shouldListOpenOnFocus);
        if (this.props.shouldListOpenOnFocus) {
            this.openMenu();
        }
        if ("onFocus" in this.props.inputProps) {
            this.props.inputProps.onFocus(event);
        }
    }

    /**
     * @method
     * Handles the click event of input box
     * @param {Event} event - ckick event object
     */
    handleInputClick() {
        //checking if input is focused, since it can be disabled when clicked
        if (this.isInputFocused() && this.props.shouldListOpenOnFocus) {
            this.openMenu();
        }
    }

    /**
     * @method
     * A util function which fetches the search word after last comma
     * @param {Event} event - blur event object
     */
    extractLast(str) {
        return str.split(",").pop();
    }

    /**
     * @method
     * This method resizes the text area if needed, while the user is
     * typing into it
     */
    resizeTextArea() {
        const textArea = this.refs["input"];
        textArea.style.height = "0px";
        const newHeight = textArea.scrollHeight - 10;
        textArea.style.height = newHeight + "px";
        //Add scroll to the text area based on the height
        if (newHeight >= 120) {
            textArea.style.overflow = "auto";
        } else {
            textArea.style.overflow = "hidden";
        }
    }
    /**
     * @method
     * A util function to handle the input change event, common for both single level
     * and multi level searches
     * @param {Event} event - change event object
     * @param {Boolean} isMultiSearch - Boolean to determine if search is multilevel
     */
    handleChangeUtil(event, isMultiSearch) {
        let searchWord = event.target.value;
        this.props.onChange(event, searchWord);
        if (isMultiSearch) {
            searchWord = this.extractLast(searchWord);
            this.searchKey = searchWord;
        }
        searchWord = searchWord.trim();
        if (!searchWord || searchWord.length < this.props.searchKeysLimit) {
            this.initialiseState();
            return;
        }

        if (searchWord.length <= 5 || searchWord.endsWith(" ")) {
            this.getMenuDataDebounce(searchWord);
        } else {
            this.getMenuDataThrottle(searchWord);
        }
        if (!this.isMenuOpen()) {
            this.setState({
                isMenuOpen: true
            });
        }
    }

    /**
     * @method
     * Handles the change event of input box in case of multi level search
     * @param {Event} event - change event object
     */
    handleChangeMultiSearch(event) {
        this.handleChangeUtil(event, true);
    }
    /**
     * @method
     * Handles the change event of input box in case of single level search
     * @param {Event} event - change event object
     */
    handleInputChange(event) {
        this.handleChangeUtil(event);
    }

    /**
     * @method
     * Handles the keys pressed on input box
     * @param {Event} event - change event object
     */
    handleKeyDown(event) {
        const input = this.refs.input.value;
        if (this.inputKeyHandlers[event.key]) {
            this.inputKeyHandlers[event.key].call(this, event);
        }
    }

    /**
     * @method
     * Return all the input key handlers
     */
    getInputKeyHandlers() {
        return {
            ArrowDown(event) {
                event.preventDefault();
                this.handleUpDownKey("down", 1);
            },

            ArrowUp(event) {
                event.preventDefault();
                this.handleUpDownKey("up", -1);
            },
            Enter(event) {
                /**Unset the input blur, since blur should not be ignored in this case */
                this.setInputBlurEvent(false);

                const isOpen = this.isMenuOpen();
                const { activeElementIndex } = this.state;
                let inputVal = this.refs.input.value;
                const { isTextArea } = this.props;
                let onEnterCallback;
                if (isTextArea) {
                    event.preventDefault();
                }
                /**
                 * Perform actions based on where the enter is clicked and
                 * if the value of input box is not null
                 */
                if (inputVal && (!isOpen || activeElementIndex === null)) {
                    onEnterCallback = this.props.onEnter.bind(this, inputVal);
                } else if (activeElementIndex !== null) {
                    const dataItem = this.getDataItems()[activeElementIndex];
                    if (this.props.selectOnHover || this.state.isElementActiveWithKeys) {
                        onEnterCallback = this.selectItem.bind(this, dataItem, true);
                    } else {
                        onEnterCallback = this.props.onEnter.bind(this, inputVal);
                    }
                } else {
                    onEnterCallback = () => { };
                }

                this.initialiseState(onEnterCallback);
            },

            Escape() {
                this.setInputBlurEvent(false);
                this.initialiseState();
            },
            Tab() {
                // this.setInputBlurEvent(true)
            }
        };
    }

    /**
     * @method
     * A utitliy function to handle up and down key press events
     * @param {String} keyName - up or down key
     * @param {Number} addVal - a number to be used for fetching the next active element
     */
    handleUpDownKey(keyName, addVal) {
        const items = this.getDataItems();
        if (!items.length) return;
        let { activeElementIndex } = this.state;
        if (keyName === "up") {
            if (activeElementIndex == null || !this.isMenuOpen()) {
                return;
            }
        } else {
            if (!this.isMenuOpen()) {
                this.highlightItem(0, true, true);
                return;
            }
        }
        activeElementIndex = activeElementIndex === null ? -1 : activeElementIndex;
        let newActiveIndex = (activeElementIndex + addVal + (addVal < 0 ? items.length : 0)) % items.length;
        let i = 0;
        while (items[newActiveIndex].disabled || String(items[newActiveIndex].labelType).toLowerCase() === "s") {
            i++;
            newActiveIndex = (newActiveIndex + addVal + (addVal < 0 ? items.length : 0)) % items.length;
            if (i === items.length) {
                break;
            }
        }
        if (newActiveIndex === -1) {
            return;
        }
        if (newActiveIndex !== items.length && newActiveIndex !== activeElementIndex) {
            this.highlightItem(newActiveIndex, true);
        }
    }

    /**
     * Set the blur value of input field which is used to determine whether the blur event
     * will be ignored
     * @param {Boolean} val
     */
    setInputBlurEvent(val) {
        this.ignoreBlur = val;
    }

    /**
     * @method
     * Initialses the active element index and ingnorBlur value, Used by menu's mouse leave event
     */
    unSetActiveELement() {
        this.ignoreBlur = false;
        this.setState({
            activeElementIndex: null
        });
    }
    /**
     * @method
     * Set the value to ignore input blur, used by menu's mous enter event
     */
    ignoreBlurEvent() {
        this.ignoreBlur = true;
    }

    /**
     * @method
     * Call the prop function to fetch the data items based on search word. Used by
     * debounce aand throttle wrappers of this function
     * @param {String} searchKeyword - value to be searched for
     */
    getMenuData(searchKeyword) {
        this.props.fetchData(searchKeyword);
    }

    /**
     * @method
     * Fetches the data item based on configured max limit
     * @return {Array}
     */
    getDataItems() {
        let limit = Math.min(this.props.dataLimit, this.suggestorData.length),
            start = 0;
        if (limit === 0) {
            return [];
        }
        let resItems = this.suggestorData.slice(),
            footer = false,
            header = false;
        /**Update limit if footer is present */
        if (this.props.hasFooter) {
            resItems.splice(resItems.length - 1, 1);
            footer = true;
        }
        /**Update limit if header is present */
        if (this.props.hasHeader) {
            resItems.splice(0, 1);
            header = true;
        }
        resItems = resItems.slice(0, limit);
        if (header || footer) {
            footer && resItems.push(this.suggestorData.slice(-1)[0]);
            header && resItems.unshift(this.suggestorData.slice(0, 1)[0]);
        }
        return resItems;
    }

    /**
     * @method
     * Creates the menu items and renedr the menu
     */
    renderMenu() {
        let menuItems;
        let searchStr = this.props.value;
        if (this.props.isMultiSearch) {
            searchStr = this.searchKey;
        }

        const items = this.getDataItems();
        if (items.length === 1 && items[0].id === "notFound") {
            menuItems = this.props.notFoundTemplate(items[0], searchStr);
        } else {
            menuItems = items.map((item, index) => {
                let itemElem = "";
                if ("getListItemTemplate" in this.props) {
                    itemElem = this.props.getListItemTemplate(item, this.activeElementIndex === index);
                }

                if (itemElem && !React.isValidElement(itemElem)) {
                    console.error("Returned element is not a valid react element in getListItemTemplate function");
                    return undefined;
                }
                let className = index === this.state.activeElementIndex ? "sugHighlighted" : "";
                /**Handle disable and Heading items */
                if (String(item.labelType).toLowerCase() === "s") {
                    className += "sugHeadingLbl";
                } else if (item.disabled) {
                    className += "sugDisabled";
                }

                return (
                    <MenuItem
                        hProps={this.props.highlighterProps}
                        item={item}
                        itemRef={this.itemRef}
                        index={index}
                        key={item.id}
                        className={className}
                        searchWord={searchStr}
                        onMouseEnter={this.highlightItem}
                        onClick={this.selectItem}
                    >
                        {itemElem}
                    </MenuItem>
                );
            });
        }

        const menuItemsWrap = (
            <div onMouseEnter={this.ignoreBlurEvent} onMouseLeave={this.unSetActiveELement}>
                {menuItems}
            </div>
        );
        let menu;
        if ("getListTemplate" in this.props) {
            menu = this.props.getListTemplate(menuItemsWrap);
        } else {
            menu = menuItemsWrap;
        }

        return <Menu menuRef={this.menuRef}>{menu}</Menu>;
    }
    render() {
        let { inputProps, renderInput, value, shouldRenderCross, dataItems } = this.props;
        this.suggestorData = dataItems;
        /**If menu is closed then clear suggestor data. So as to avoid flicker on the next menu display */
        if (!this.isMenuOpen()) {
            this.suggestorData = [];
        }
        let style;
        /**Merge inputProps style for rendering cross button */
        if (shouldRenderCross) {
            if (inputProps && inputProps.style) {
                inputProps = {
                    ...inputProps,
                    style: { ...inputProps.style, ...this.state.inputPadRight }
                };
            } else {
                inputProps = { ...inputProps, style: { ...this.state.inputPadRight } };
            }
        }

        /**Construct input and cross component props */
        inputProps = {
            inputProps: {
                ...inputProps,
                ...style
            },
            handleBlur: this.handleInputBlur,
            handleFocus: this.handleInputFocus,
            handleKeyDown: this.handleKeyDown,
            handleChange: this.props.isMultiSearch ? this.handleChangeMultiSearch : this.handleInputChange,
            handleClick: this.handleInputClick,
            value,
            renderInput,
            inputRef: this.inputRef
        };
        let crossProps = {
            shouldRenderCross,
            onClick: this.clearInput,
            renderCross: this.props.getCrossTemplate,
            inputVal: this.refs.input && this.refs.input.value,
            crossRef: this.crossRef
        };

        return (
            <div className="suggestorCont" {...this.wrapperProps}>
                <Input {...inputProps} {...crossProps} isTextArea={this.props.isTextArea} />
                {this.isMenuOpen() && this.renderMenu()}
            </div>
        );
    }
}

Suggestor.defaultProps = {
    inputProps: {
        id: "sugInput",
        width: "100%"
    },
    shouldListOpenOnFocus: false,
    shouldRenderCross: false,
    inputStyle: {},
    value: "",
    dataLimit: 10,
    searchKeysLimit: 3,
    delay: 250,
    selectOnBlur: false,
    selectOnHover: false,
    isMultiSearch: false,
    focusOnMount: true,
    hasFooter: false,
    hasHeader: false,
    wrapperProps: {
        style: {
            display: "inline-block"
        }
    },
    isTextArea: false,
    renderInput(props, isTextArea) {
        if (isTextArea) {
            return <textarea autoComplete="off" {...props} />;
        }
        return <input type="search" autoComplete="off" aria-label="Search for content on the website" {...props} />;
    },
    onEnter() { },
    onSelect(item) { },
    notFoundTemplate: function (data, keyWord) {
        return (
            <div className="sugItemWrapper sugNotFoundWrapper">
                <div className="sugItem">
                    <span className="sugNotFound">
                        {data.label ? (
                            data.label
                        ) : (
                                <span>
                                    <span className="sugNotFKey ellipsis" title={keyWord}>
                                        <strong>{keyWord}</strong>
                                    </span>
                                    <span>not found</span>
                                </span>
                            )}
                    </span>
                </div>
            </div>
        );
    }
};

Suggestor.propTypes = {
    /**
     * Array of items to be displayed in suggestor's dropdown
     */
    dataItems: PropTypes.array.isRequired,
    /**
     * Arguments: `event: Event, searchedWord: String`
     * Called everty time input's value is changed and its
     * length is >= to `searchKeysLimit` prop.
     */
    onChange: PropTypes.func.isRequired,
    /**
     * Arguments: `inputValue: String`
     * Called when user presses enter on input.
     */
    onEnter: PropTypes.func,
    /**
     * Arguments: `selectedItem: Object, inputValue: String`
     * Called when the user selects an item from the dropdown menu.
     */
    onSelect: PropTypes.func,
    /**
     * Arguments: `inputValue: String`
     * Called every time user's input is changed and is its length is
     * >= to `searchKeysLimit` prop. Fetches the `dataItems` prop
     */
    fetchData: PropTypes.func.isRequired,
    /**
     * The value to display in the input field.
     */
    value: PropTypes.string.isRequired,
    /**
     * Arguments: `item: Object, isCurrentlyHighlighted: Boolean`
     * Gets a custom template for each item in the dropdown
     */
    getListItemTemplate: PropTypes.func,
    /**
     * Arguments: `menuItemsArrayJSX: ReactElement`
     * Gets a custom template for menu in the dropdown.
     */
    getListTemplate: PropTypes.func,
    /**
     * Arguments: `menuItemsArrayJSX: ReactElement`
     * Gets a custom template for cross to be rendered in
     * input when user enters a text. Should be rendered only if
     * `shouldRenderCross` prop is set to true.
     */
    getCrossTemplate: PropTypes.func,
    /**
     * Props passed to the input field. Any properties/events supported by
     * HTMLInputELement can be specified like disabled, ref, placeholder,
     * onFocus etc.
     */
    inputProps: PropTypes.object,
    /**
     * Style attribute for input field.
     */
    inputStyle: PropTypes.object,
    /**
     * Configuration object for `TextHighlighter` component
     * {highlighClass: 'myclass', wrapElement:'em'}
     */
    highlighterProps: PropTypes.object,
    /**
     * Detemines if the menu should open on focus or not,
     * provided there is some input value present, which is
     * >= to `searchKeysLimit` prop.
     */
    shouldListOpenOnFocus: PropTypes.bool,
    /**
     * Detemines whether or not to render the cross inside
     * input field whenever user enters some text.
     */
    shouldRenderCross: PropTypes.bool,
    /**
     * Detemines whether ot not to select an item when input is blurred
     * and user is hovering over one of the item. Default is false.
     */
    selectOnBlur: PropTypes.bool,
    /**
     * Detemines whether or not to select an item when user presses enter
     * on input and user is hovering over one of the item. Default is false.
     */
    selectOnHover: PropTypes.bool,
    /**
     * Props to be passed for container element of suggestor.
     * useful when using refs.
     */
    wrapperProps: PropTypes.object,
    /**
     * Maximum number of items to be rendered in dropdown.
     */
    dataLimit: PropTypes.number,
    /**
     * Minimum number of characters which are typed in input
     * before the data items are fecthed
     */
    searchKeysLimit: PropTypes.number,
    /**
     * Determines whether or not multiple keyword search is allowed.
     * After selecting on of the items, a `,` is appended so as to search
     * for further keywords
     */
    isMultiSearch: PropTypes.bool,
    /**
     * Debouce function delay while typing
     */
    delay: PropTypes.number,
    /**
     * Determines whether or not the `dataItems` prop contains a footer
     * item or not. Helps in determing the max limit on number of items
     * in dropdown
     */
    hasFooter: PropTypes.bool,
    /**
     * Determines whether or not the `dataItems` prop contains a header
     * item or not. Helps in determing the max limit on number of items
     * in dropdown
     */
    hasHeader: PropTypes.bool,
    /**
     * Determines whether the input field is textarea.
     */
    isTextArea: PropTypes.bool,
    /**
     * Determines if the menu is to be opened when input is focused but
     * no characters are present inside input. This prop is used for scenarios such as
     * showing search history or suggestion based on previous searches.
     */
    shouldOpenWithoutSearch: PropTypes.bool,
    /**
     * Argument: `inputNode: HTMLInputElement`
     * This function is invoked with the reference to input node.
     */
    getInputRef: PropTypes.func,
    /**
     * Detemines whether to focus the component on mount.
     */
    focusOnMount: PropTypes.bool,
    /**
     * Argument: `item: Object, searchedWord: String`
     * Gets the custom not found template.
     */
    notFoundTemplate: PropTypes.func
};