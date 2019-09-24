import React, { PureComponent } from 'react';
import Suggestor from '../common/suggestor/suggestor';
import tagOptions from './tagOptions';
import { labeledStatement } from '@babel/types';
import './suggestor.scss';

class suggestorTag extends PureComponent {

    constructor(params) {
        super(params);
        this.state = {
            dataItems: []
        };

        this.tagOptions = this.getTagOptions();
    }
    getTagOptions = () => {
        return tagOptions.map((tagOption) => {
            return {
                id: tagOption.tag_name,
                label: tagOption.tag_name,
                description: tagOption.tag_description
            }
        });
    }
    handleChange = (event, suggestorValue) => {
        let { updateSuggestorValue, handleTagChange } = this.props;
        let dataItems = this.tagOptions.filter((tagOption) => {
            if (tagOption.id.toLowerCase().includes(suggestorValue.toLowerCase())) {
                return true;
            }
        });

        this.setState({
            dataItems
        });
        let dataItem = {};
        updateSuggestorValue(suggestorValue);
        handleTagChange({});

    }
    fetchData = () => { }
    // renderMenu = () => { }
    // renderMenuItems = () => { }
    // searchReq = () => { }

    handleItemSelection = (...arg) => {
        //console.log('handleItemSelection', arg);
        let { handleTagChange } = this.props;
        let dataItem = arg[0];
        handleTagChange(dataItem);

    }

    render() {

        // let dataItems = this.props;
        const { dataItems } = this.state;
        const { suggestorValue } = this.props;
        return (
            <div className="suggestor-section">
                <Suggestor
                    value={suggestorValue}
                    onChange={this.handleChange}
                    dataItems={dataItems}
                    fetchData={this.fetchData}

                    // getListTemplate={this.renderMenu}
                    // getListItemTemplate={this.renderMenuItems}
                    // inputProps={this.inputProps}
                    // onEnter={this.searchReq}
                    onSelect={this.handleItemSelection}
                    hasFooter={false}
                    shouldListOpenOnFocus={false}
                    shouldOpenWithoutSearch={true}
                    searchKeysLimit={2}
                    shouldRenderCross={false}
                    dataLimit={15}
                />

            </div>
        );
    }
}

export default suggestorTag;