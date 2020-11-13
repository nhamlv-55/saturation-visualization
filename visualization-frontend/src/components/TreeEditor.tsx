import * as React from 'react';
import {options} from "../helpers/transformers";
import { AST, ASTNode, ASTTransformer, Transformer} from "./../helpers/network";
import { assert } from '../model/util';
import { DataSet, Network, Node, Edge } from 'vis'

type Props = {
    input: string,
    spacerUserOptions: string,
}

type State = {
    optionTypeHTML: JSX.Element,
    optionValue: string,
    optionName: string,
    optionType: string,
    allOptions: {type:string, name: string, value:string}[],
    showOptions: boolean,
    selectedNodeID: number,
    stringRep: string
}

class TreeEditor extends React.Component<Props, State> {
    state = {
        optionTypeHTML: <div />,
        optionType: "",
        optionValue: "",
        optionName: "",
        allOptions: [],
        showOptions: true,
        selectedNodeID: -1,
        stringRep: ""
    }
    network: Network | null = null;
    networkNodes = new DataSet<Node>([]);
    networkEdges = new DataSet<Edge>([]);
    graphContainer = React.createRef<HTMLDivElement>();
    astStack = new Array<AST>();
    transformerStack = new Array<{}>();
    transformer = new ASTTransformer();
    componentDidMount() {
        this.generateNetwork();
        this.network!.fit();
    }

    redrawAST(){
        if(this.astStack[this.astStack.length-1] != null){
            let ast = this.astStack[this.astStack.length-1];
            console.log(ast);
            console.log("visNodes", ast.visNodes);
            console.log("visEdges", ast.visEdges);

            this.networkEdges.clear();
            this.networkEdges.add(ast.visEdges);
            this.networkNodes.clear();
            this.networkNodes.add(ast.visNodes);
            /* this.network!.fit(); */
            this.network!.redraw();
            console.log(ast.toHTML(this.state.selectedNodeID, ast.nodeList[0]));
            this.setState({stringRep: ast.toHTML(this.state.selectedNodeID, ast.nodeList[0])});
        }
    }



    componentDidUpdate(prevProps: Props){
        if(prevProps.input !== this.props.input){
            this.astStack.push(new AST(this.props.input));
            this.redrawAST();
        }
    }

    generateNetwork() {
        console.log("I am Graph. I receive:", this.props)
        assert(this.graphContainer.current);
        assert(!this.network); // should only be called once
        this.network = new Network(this.graphContainer.current!, {
            nodes: this.networkNodes,
            edges: this.networkEdges
        }, {
            physics: false,
            interaction: {
                multiselect: false
            },layout: {
                hierarchical: {
                    /* direction: 'UD', */
                    sortMethod: 'directed',
                },
            }

        });

        this.network.on('click', async (clickEvent) => {
            if (clickEvent.nodes.length > 0) {
                assert(clickEvent.nodes.length === 1);
                const clickedNodeId = clickEvent.nodes[0];
                console.log("clickEvent.nodes", clickEvent.nodes);
                this.setState({selectedNodeID: clickedNodeId})
            } else {
            }
        });
        
    }




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
    displayTransformers() {
        


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
    }

    showHideOptions() {
        this.setState({
            showOptions: !this.state.showOptions
        });
    }

    flipCmp(){
        const currentAST = this.astStack[this.astStack.length - 1];
        let node = currentAST.nodeList[this.state.selectedNodeID];
        this.astStack.push(this.transformer.flipCmp(node, currentAST));
        this.transformerStack.push(new Transformer("flipCmp", ""));
        this.redrawAST();
    }
    toImp(){
        const currentAST = this.astStack[this.astStack.length - 1];
        let node = currentAST.nodeList[this.state.selectedNodeID];
        this.astStack.push(this.transformer.toImp(node, currentAST));
        this.transformerStack.push(new Transformer("toImp", ""));
        this.redrawAST();
    }
    changeBreak(){
        const currentAST = this.astStack[this.astStack.length - 1];
        let node = currentAST.nodeList[this.state.selectedNodeID];
        this.astStack.push(this.transformer.changeBreak(node, currentAST));
        this.transformerStack.push(new Transformer("changeBreak", ""));
        this.redrawAST();
    }
    changeBracket(){
        const currentAST = this.astStack[this.astStack.length - 1];
        let node = currentAST.nodeList[this.state.selectedNodeID];
        this.astStack.push(this.transformer.changeBracket(node, currentAST));
        this.transformerStack.push(new Transformer("changeBracket", ""));
        this.redrawAST();
    }
    undo(){
        /* if (this.astStack.length) */
        this.astStack.pop();
        this.transformerStack.pop();
        this.redrawAST();
    }

    render() {
        let selectedOptions = this.displaySpacerOptions();
        return (
                <fieldset className="options-card" id="graph-container">
                    <h3>Transformer Queue</h3>
                    <ul>
                        <button onClick={this.flipCmp.bind(this)}>Flip Cmp</button>
                        <button onClick={this.toImp.bind(this)}>To Imp</button>
                        <button onClick={this.changeBreak.bind(this)}>\n?</button>
                        <button onClick={this.changeBracket.bind(this)}>()?</button>
                        <button onClick={this.undo.bind(this)}>Undo</button>
                        {/* <li> */}
                            {/* <label htmlFor="userOptions" className="form-label">Transformer options</label>
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
                                </li> */}
                        {/* <label>Or using manual run parameters</label>
                            <input type="text" name="manualRun" onChange={this.changeSpacerManualUserOptions.bind(this)}/>
                            <li>
                            <label htmlFor="varOptions" className="form-label">Variable Designation</label>
                            <p>Enter a single space separated list of your chosen variables in the order they appear (var1 var2 var3 ..)</p>
                            <input type="text" name="variables" onChange={this.props.onChangeVariables}/>
                            </li> */}
                    </ul>
                    <pre><div dangerouslySetInnerHTML={{ __html: this.state.stringRep }} /></pre>
                    <div className= "component-graph" ref = { this.graphContainer }>
                        <canvas />
                    </div>
                </fieldset>
        );
    }
}

export default TreeEditor;
