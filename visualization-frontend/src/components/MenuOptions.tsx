import * as React from 'react';
import {options} from "../helpers/spacerOptions";
import eye from "./../resources/icons/singles/eye.svg"

class MenuOptions extends React.Component<any, any> {
    state = {
        typeOfOption: "",
        optionValue: "",
        optionName: ""
    };
    
    storeSpacerOptions() {
        if (this.state.optionValue === "" || this.state.optionName === "") return;
        let fullOptionString = this.props.spacerUserOptions +  " "  + this.state.optionName + "=" + this.state.optionValue + " ";
        this.props.changeSpacerUserOptions(fullOptionString);
        this.setState({
            optionName: "",
            optionValue: ""
        })
    }
    
    displaySpacerOptions() {
        if (this.props.spacerUserOptions !== "") {
            return this.props.spacerUserOptions.split(" ");
        }
        return []
    }
    
    updateOptionValue(e){
        this.setState({
            optionValue: e.target.value
        });
    }
    
    getOptions(name, type) {
        if (type === "bool") {
            this.setState({
                typeOfOption:
                    <form className="tfradio">
                        <input type="radio" name={name} value="true" onClick={this.updateOptionValue.bind(this)}/>True
                        <input type="radio" name={name} value="false" onClick={this.updateOptionValue.bind(this)}/>False
                        <button className="fake-button" type="button" value="Submit" onClick={this.storeSpacerOptions.bind(this)}>+</button>
                    </form>
            });
        } else {
            this.setState({
                typeOfOption:
                    <form className="tfradio">
                        <input type="text" name={name} placeholder={type} onChange={this.updateOptionValue.bind(this)}/>
                        <button className="fake-button" type="button" value="Submit" onClick={this.storeSpacerOptions.bind(this)}>+</button>
                    </form>
            });
        }
    }
    
    changeOptionType(e){
        let tempList = options.filter(option => option.name === e.target.value);
        let type = "custom";
        if (tempList.length > 0) {
            type = tempList[0].type;
        }
        this.setState({
            optionName: e.target.value
        });
        this.getOptions(e.target.value, type);
    }
    changeSpacerManualUserOptions(event: React.ChangeEvent<HTMLInputElement>) {
        const newValue = event.target.value;
        this.props.changeSpacerUserOptions(newValue);
    }
    render() {
        let selectedOptions = this.displaySpacerOptions();
        return (
            <aside>
                <fieldset className="options-card">
                    <h3>Z3 Options</h3>
                    <ul>
                        <li>
                            <label htmlFor="userOptions" className="form-label">Additional Spacer options</label>
                            <button className="showHideButton" title={"showHide"}><img className="eyeImage" src={eye} alt="eye"/></button>
                            {selectedOptions.length !== 0 && selectedOptions.map((option, key) => {
                                if (option !== "") {
                                    let kvp = option.split("=");
                                    let name = kvp[0];
                                    let value = kvp[1];
                                    return (
                                        <div className="displaySpacerOption">
                                            <span key={key}>{name}: {value}</span>
                                            <button className="fake-button" type="button">x</button>
                                        </div>
                                    );
                                }
                                return "";
                            })}
                            <input className="optionsList" list="spacerOptions" name="spacerOptions" onChange={this.changeOptionType.bind(this)}/>
                            <datalist id="spacerOptions">
                                {options.map((part, key) => (
                                    <option value={part.name} key={key}/>
                                ))}
                            </datalist>
                            {this.state.typeOfOption}
                        </li>
                        <label>Or using manual run parameters</label>
                        <input type="text" name="manualRun" onChange={this.changeSpacerManualUserOptions.bind(this)}/>
                        <li>
                            <label htmlFor="varOptions" className="form-label">Variable Designation</label>
                            <p>Enter a single space separated list of your chosen variables in the order they appear (var1 var2 var3 ..)</p>
                            <input type="text" name="variables" onChange={this.props.onChangeVariables}/>
                        </li>
                    </ul>
                </fieldset>
            </aside>
        );
    }
}

export default MenuOptions;
