import React, { PropTypes, Component } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import {debounce} from "throttle-debounce";
import DropDown from "dnn-dropdown";
import Label from "dnn-label";
import Button from "dnn-button";
import Combobox from "react-widgets/lib/Combobox";
import Service from "./Service";
import IconButton from "../IconButton";

import "./style.less";

class Suggestion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestions: [],
            selectedValue: {value: -1, label: ""}
        };

        this.debounceGetSuggestions = debounce(500, this.debounceGetSuggestions);
    }

    componentWillReceiveProps(){
        this.setState({ selectedValue: { value: -1, label: "" }, suggestions: [] });
    }

    getSuggestions() {
        const {props, state} = this;
        let keyword = state.selectedValue.value > -1 ? "" : state.selectedValue.label;

        let service = new Service(this.props.service);
        let actionName = props.options.actionName;
        let parameters  = Object.assign({}, props.options, {
            keyword: keyword,
            actionName: undefined
        });

        service.getSuggestions(actionName, parameters, (data) => {
            this.setState({
                suggestions: data
            });
        });
    }

    debounceGetSuggestions() {
        this.getSuggestions();
    }

    onUserSelectorChanged(item) {
        if (item.value || item.label) {
            return;
        }

        this.setState({ selectedValue: { value: -1, label: item } });
        this.debounceGetSuggestions();
    }

    onUserSelectorSelected(item) {
        this.setState({ selectedValue: { value: item.value, label: item.label }, suggestions: [] });
    }

    onUserSelectorToggle() {
    }

    onAddSuggestion() {
        const {props, state} = this;
        let value = state.selectedValue.value;
        if (value === -1) {
            return;
        }

        if(typeof props.onSelect === "function"){
            props.onSelect(state.selectedValue);
        }

        this.setState({ selectedValue: { value: -1, label: "" } });
    }

    render() {
        const {props, state} = this;

        return (
            <div className="dnn-suggestion">
                <span>
                    <Combobox suggest={false}
                        placeholder={props.localization.placeHolder}
                        open={this.state.suggestions.length > 0 }
                        onToggle={this.onUserSelectorToggle.bind(this) }
                        onChange={this.onUserSelectorChanged.bind(this) }
                        onSelect={this.onUserSelectorSelected.bind(this) }
                        data={this.state.suggestions }
                        value={state.selectedValue.label}
                        valueField="value"
                        textField="label"/>
                    <div className="add-button" onClick={this.onAddSuggestion.bind(this) }>
                        <IconButton type="add" width={17} /> {props.localization.add}
                    </div>
                </span>
            </div>
        );
    }
}

Suggestion.propTypes = {
    dispatch: PropTypes.func.isRequired,
    service: PropTypes.object,
    localization: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired
};

Suggestion.defaultProps = {
};

export default Suggestion;