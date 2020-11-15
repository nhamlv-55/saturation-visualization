import * as React from 'react';
import { AST, ASTTransformer, Transformer} from "./../helpers/transformers";
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
    stringRep: string,
    status: string
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
        stringRep: "",
        status: ""
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

    displayTransformers() {
        


        if (this.props.spacerUserOptions !== "") {
            return this.props.spacerUserOptions.trim().split(" ");
        }
        return []
    }


    applyLocal(action: string, params: {}, condition: string){
        const currentAST = this.astStack[this.astStack.length - 1];
        const node = currentAST.nodeList[this.state.selectedNodeID];
        const t = {"action": action, "params": params, "condition": condition};
        try{
            this.astStack.push(this.transformer.run(node, currentAST, t));
            this.transformerStack.push(t);
            this.redrawAST();
        }catch(error){
            this.setState({"status": "Error:"+error.message});
        }
    }
    undo(){
        this.astStack.pop();
        this.transformerStack.pop();
        this.redrawAST();
    }

    
    render() {
        return (
            <section>
                <fieldset className="options-card" id="graph-container">
                    <h3>Transformer Queue</h3>
                    <h4>{this.state.status}</h4>
                    <ul>
                        <button onClick={this.applyLocal.bind(this, "flipCmp", {}, "true" )}>Flip Cmp</button>
                        <button onClick={this.applyLocal.bind(this, "toImp", {}, "true")}>To Imp</button>
                        <button onClick={this.applyLocal.bind(this, "move", {"direction": "l"}, "true")}>Move Left</button>
                        <button onClick={this.applyLocal.bind(this, "move", {"direction": "r"}, "true")}>Move Right</button>
                        <button onClick={this.applyLocal.bind(this, "changeBreak", {}, "true")}>\n?</button>
                        <button onClick={this.applyLocal.bind(this, "changeBracket", {}, "true")}>()?</button>
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

                    </ul>
                    <pre><div dangerouslySetInnerHTML={{ __html: this.state.stringRep }} /></pre>
                    <div className= "component-graph" ref = { this.graphContainer }>
                        <canvas />
                    </div>
                </fieldset>
                <fieldset className="options-card" id="transformer-container">
                    <h3>Transformer Queue</h3>

                    <button onClick={this.undo.bind(this)}>Blast</button>
                </fieldset>
            </section>
        );
    }
}

export default TreeEditor;
