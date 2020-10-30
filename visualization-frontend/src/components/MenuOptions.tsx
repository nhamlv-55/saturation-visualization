import * as React from 'react';
import {options} from "../helpers/spacerOptions";
import eye from "./../resources/icons/singles/eye.svg"

type Props = {
    spacerUserOptions: string,
    onChangeVariables: (e: React.ChangeEvent<HTMLInputElement>) => void,
    changeSpacerUserOptions: (spacerUserOptions: string) => void,
}

type State = {
    optionTypeHTML: JSX.Element,
    optionValue: string,
    optionName: string,
    optionType: string,
    allOptions: {type:string, name: string, value:string}[],
    showOptions: boolean
}

class MenuOptions extends React.Component<Props, State> {
    state = {
        optionTypeHTML: <div />,
        optionType: "",
        optionValue: "",
        optionName: "",
        allOptions: [],
        showOptions: true
    };

    updateSpacerOptions() {
        let allOptions: {type:string, name: string, value:string}[] = this.state.allOptions;
        let fullOptionString = "";
        for (let option of allOptions) {
            if (option.type === "flag") {
                fullOptionString += "-" + option.name + " ";
            }
            else {
                fullOptionString += option.name + "=" + option.value + " ";
            }
        }
        this.props.changeSpacerUserOptions(fullOptionString);
    }

    storeSpacerOptions(e) {
        e.preventDefault();
        e.target.reset();
        if (this.state.optionName === "" || (this.state.optionType !== "custom" && this.state.optionValue === "")) return;
        let allOptions: {type:string, name: string, value:string}[] = this.state.allOptions;
        allOptions.push({
            name: this.state.optionName,
            value: this.state.optionValue,
            type: this.state.optionValue === "" ? "flag" : this.state.optionType
        });
        this.setState({
            allOptions: allOptions
        });
        this.setState({
            optionName: "",
            optionValue: "",
            optionType: ""
        });
        this.updateSpacerOptions();
    }

    displaySpacerOptions() {
        if (this.props.spacerUserOptions !== "") {
            return this.props.spacerUserOptions.trim().split(" ");
        }
        return []
    }

    updateOptionValue(e){
        this.setState({
            optionValue: e.target.value
        });
    }

    getOptions(name:string, type:string) {
        if (type === "bool") {
            this.setState({
                optionTypeHTML:
                    <React.Fragment>
                        <input type="radio" name={name} value="true" onClick={this.updateOptionValue.bind(this)}/>True
                        <input type="radio" name={name} value="false" onClick={this.updateOptionValue.bind(this)}/>False
                        <button className="fake-button" type="submit" value="Submit">+</button>
                    </React.Fragment>
            });
        } else {
            this.setState({
                optionTypeHTML:
                    <React.Fragment>
                        <input type="text" name={name} placeholder={type} defaultValue={this.state.optionValue} onChange={this.updateOptionValue.bind(this)}/>
                        <button className="fake-button" type="submit" value="Submit">+</button>
                    </React.Fragment>
            });
        }
    }

    changeOptionType(e: React.ChangeEvent<HTMLInputElement>){
        let tempList = options.filter(option => option.name === e.target.value);
        let type = "custom";
        if (tempList.length > 0) {
            type = tempList[0].type;
        }
        this.setState({
            optionName: e.target.value,
            optionType: type
        });
        this.getOptions(e.target.value, type);
    }

    removeOption(name:string, value:string){
        let allOptions: {type:string, name: string, value:string}[] = this.state.allOptions;
        let rIndex = -1;
        for (let i = 0; i < allOptions.length; i++){
            if (allOptions[i].name === name && allOptions[i].value === value){
                rIndex = i;
                break;
            }
        }
        if (rIndex === -1) return;
        allOptions.splice(rIndex, 1);
        this.updateSpacerOptions();
    }
    changeSpacerManualUserOptions(event: React.ChangeEvent<HTMLInputElement>) {
        const newValue = event.target.value;
        this.props.changeSpacerUserOptions(newValue);
    }

    showHideOptions() {
        this.setState({
            showOptions: !this.state.showOptions
        });
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
                            <button onClick={this.showHideOptions.bind(this)} className="showHideButton" title={"showHide"}><img className="eyeImage" src={eye} alt="eye"/></button>
                            {selectedOptions.length !== 0 && this.state.showOptions && selectedOptions.map((option, key) => {
                                if (option !== "") {
                                    let kvp = option.split("=");
                                    let name = kvp[0];
                                    let value = kvp[1];
                                    let displayValue = value ? name + ": " + value : name;
                                    return (
                                        <div className="displaySpacerOption" key={key}>
                                            <span>{displayValue}</span>
                                            <button className="fake-button" type="button" onClick={this.removeOption.bind(this, name, value)}>x</button>
                                        </div>
                                    );
                                }
                                return "";
                            })}
                            <form className="tfradio" name="tfradio" onSubmit={this.storeSpacerOptions.bind(this)}>
                                <input type="text" className="optionsList" list="spacerOptions" name="spacerOptions" onChange={this.changeOptionType.bind(this)}/>
                                <datalist id="spacerOptions">
                                    {options.map((part, key) => (
                                        <option value={part.name} key={key}/>
                                    ))}
                                </datalist>
                                {this.state.optionTypeHTML}
                            </form>
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