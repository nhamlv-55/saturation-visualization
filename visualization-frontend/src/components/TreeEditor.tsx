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
    transformerStack = new Array<Transformer>();
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
            //new formula. clear everything
            this.astStack = [new AST(this.props.input)];
            this.transformerStack = [];
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

    updateConditionInputEvent(evt: React.ChangeEvent<HTMLInputElement>, idx: number){
        this.transformerStack[idx].condition = evt.target.value;
    }

    displayTransformers() {
        const listItems = this.transformerStack.map((t, index) =>{
            return (
                <div  key={index}>
                <span>If (best guess):</span>
                <input ref="condition-${index}" type="text" defaultValue={t.condition} width="20rem" onChange={evt => this.updateConditionInputEvent(evt, index)}/>
                then
                {t.action}
                </div>);
        });

        return listItems;
    }


    applyStack(){
        const original_ast = new AST(this.props.input);

        try{
            this.astStack.push(this.transformer.runStack(original_ast, this.transformerStack));
            this.transformerStack.push({"action": "runStack", "params": "", "condition": ""});
            this.redrawAST();
        }catch(error){
            this.setState({"status": "Error:"+error.message});
        }
    }

    applyLocal(action: string, params: {}){
        const currentAST = this.astStack[this.astStack.length - 1];
        const node = currentAST.nodeList[this.state.selectedNodeID];
        let t = {"action": action, "params": params, "condition": "true"};
        try{
            this.astStack.push(this.transformer.run(node, currentAST, t));
            //guess the condition
            t.condition = this.transformer.getCondition(action, node, currentAST);
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
        let tStack = this.displayTransformers();
        return (
            <section>
                <fieldset className="options-card" id="graph-container">
                    <h3>Transformer Queue</h3>
                    <h4>{this.state.status}</h4>
                    <ul>
                        <button onClick={this.applyLocal.bind(this, "flipCmp", {})}>Flip Cmp</button>
                        <button onClick={this.applyLocal.bind(this, "toImp", {})}>To Imp</button>
                        <button onClick={this.applyLocal.bind(this, "move", {"direction": "l"})}>Move Left</button>
                        <button onClick={this.applyLocal.bind(this, "move", {"direction": "r"})}>Move Right</button>
                        <button onClick={this.applyLocal.bind(this, "changeBreak", {})}>\n?</button>
                        <button onClick={this.applyLocal.bind(this, "changeBracket", {})}>()?</button>
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
                    {tStack}
                    <button onClick={this.applyStack.bind(this)}>Apply for the current AST</button>
                    <button onClick={this.undo.bind(this)}>Blast</button>
                </fieldset>
            </section>
        );
    }
}

export default TreeEditor;
