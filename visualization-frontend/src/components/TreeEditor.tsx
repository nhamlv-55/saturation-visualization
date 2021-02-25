import * as React from 'react';
import { AST, ASTTransformer, Transformer, ProseTransformation} from "../helpers/transformers";
import { assert } from '../model/util';
import { DataSet, Network, Node, Edge } from 'vis'
import ReplaceDialog from './ReplaceDialog'
const _ = require("lodash");
type Props = {
    expName: string,
    input: string,
    onBlast: (tStack: Transformer[])=>void| null,
    isModal: boolean,
    saveExprs?: ()=> void,
    onTransformExprs?: (t: string)=> Promise<void>,
}
type State = {
    selectedNodeIDs: number[],
    stringRep: string,
    status: string,
    possibleTransformations: ProseTransformation[],
    transformationSelected: string,
}

class TreeEditor extends React.Component<Props, State> {
    state = {
        selectedNodeIDs: [-1],
        stringRep: "",
        status: "",
        possibleTransformations: [],
        transformationSelected: "",
    }
    network: Network | null = null;
    networkNodes = new DataSet<Node>([]);
    networkEdges = new DataSet<Edge>([]);
    graphContainer = React.createRef<HTMLDivElement>();
    astStack = new Array<AST>();
    transformerStack = new Array<Transformer>();
    transformer = new ASTTransformer();
    localSelectedNodeIDs = [-1];
    componentDidMount() {
        if(this.props.isModal){
            this.props.saveExprs!();
        }
        this.generateNetwork();
        if(this.props.input !== "()"){
            this.astStack = [new AST(this.props.input)];
            this.redrawAST();
        }
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
            console.log(ast.toHTML(_.last(this.state.selectedNodeIDs), ast.nodeList[0]));
            this.setState({stringRep: ast.toHTML(_.last(this.state.selectedNodeIDs), ast.nodeList[0])});
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
                multiselect: true
            },layout: {
                hierarchical: {
                    /* direction: 'UD', */
                    sortMethod: 'directed',
                },
            }

        });

        this.network.on('click', async (clickEvent) => {
            if (clickEvent.nodes.length > 0) {
                console.log("clickEvent.nodes", clickEvent.nodes);
                    this.localSelectedNodeIDs = clickEvent.nodes;
            } else {
                this.setState({selectedNodeIDs: []});
            }
        });
        
    }

    updateConditionInputEvent(evt: React.ChangeEvent<HTMLInputElement>, idx: number){
        this.transformerStack[idx].condition = evt.target.value;
    }
    updateParamsInputEvent(evt: React.ChangeEvent<HTMLInputElement>, idx: number){
        this.transformerStack[idx].params = JSON.parse(evt.target.value);
    }

    displayTransformers() {
        const listItems = this.transformerStack.map((t, index) =>{
            return (
                <div  key={index} className="transformer-wrapper">
                    {`If `}
                    <input style={{display: "inline-block", width: "20rem"}}
                           ref="condition-${index}"
                           type="text"
                           defaultValue={t.condition}
                           onChange={evt => this.updateConditionInputEvent(evt, index)}/>
                    <br/>
                    {`then run __${t.action}__ with params:`}
                    <br/>
                    <input ref="params-${index}" type="text" defaultValue={JSON.stringify(t.params)}
                           style={{width: "100%"}}
                           onChange={evt => this.updateParamsInputEvent(evt, index)}/>
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
        const nodes = this.localSelectedNodeIDs;
        console.log(params)
        let t = {"action": action, "params": params, "condition": "true"};
        try{
            let [dirty, new_ast] = this.transformer.run(nodes, currentAST, t);
            if(dirty){
                this.astStack.push(new_ast);
                //guess the condition
                t.condition = this.transformer.getCondition(action, nodes, currentAST);
                this.transformerStack.push(t);
                this.redrawAST();
            }
        }catch(error){
            this.setState({"status": "Error:"+error.message});
        }
    }
    undo(){
        if(this.astStack.length>1){
            this.astStack.pop();
            this.transformerStack.pop();
            this.redrawAST();
        }
    }
    async learnTransformationFromInputOutput() {
        let inputAST = this.astStack[0];
        let outputAST = this.astStack[this.astStack.length - 1];
        console.log("transformer stack", this.transformerStack);

        let payload = {
            "inputOutputExamples":[{"input": inputAST.toString(-1, inputAST.nodeList[0]),
                                 "output": outputAST.toString(-1, outputAST.nodeList[0]),
                                 "aux": [""]}],
            "expName": this.props.expName,
            "type": this.transformerStack[0].action
        };
        if (payload["type"] === "replace") {
            payload["params"] = this.transformerStack.map((item) => {return item.params});
        }

        console.log("payload", payload);
        const response = await fetch("http://localhost:5000/spacer/learn_transformation", {
            method: 'POST',
            mode :'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify(payload)
        });
        if (response.status === 200){
            const responseJson = await response.json();
            let possiblePrograms = responseJson["response"];
            console.log(possiblePrograms);
            this.setState({
                possibleTransformations: possiblePrograms
            });
        }
        else {
            this.setState({
                possibleTransformations: []
            });
        }
    }
    
    updateTransformationSelected(e) {
        this.setState({
            transformationSelected: e.target.value
        })
    }
    render() {
        console.log("I'm TreeEditor. I got", this.props.input);
        console.log("I'm TreeEditor. My possibleTs:", this.state.possibleTransformations);
        let tStack = this.displayTransformers();
        let possibleTs = this.state.possibleTransformations.map((transformation: ProseTransformation,key) => (
            <div key={key}>
                <input type="radio" name={"transformation"} value={transformation.xmlAst}
                       onClick={this.updateTransformationSelected!.bind(this)}/>{transformation.humanReadableAst}
            </div>
        ))

        return (
            <div className="tree-editor">
                <div className="editor-options-card" id="graph-container">
                    <h4>{this.state.status}</h4>
                    <div className="editor-menu">
                        {`Hint: Long click to select multiple nodes`}
                        <br/>
                        <button onClick={this.applyLocal.bind(this, "flipCmp", {})}>Flip Cmp</button>
                        <button onClick={this.applyLocal.bind(this, "toImp", {})}>To Imp</button>
                        <button onClick={this.applyLocal.bind(this, "move", {"direction": "l"})}>Move Left</button>
                        <button onClick={this.applyLocal.bind(this, "move", {"direction": "r"})}>Move Right</button>
                        <button onClick={this.applyLocal.bind(this, "changeBreak", {})}>\n?</button>
                        <button onClick={this.applyLocal.bind(this, "changeBracket", {})}>()?</button>
                        <br/>
                        <ReplaceDialog
                            onApply = {this.applyLocal.bind(this)}
                        />
                        <br/>

                        <button onClick={this.undo.bind(this)}>Undo</button>
                        <pre className="editor-string-rep" dangerouslySetInnerHTML={{ __html: this.state.stringRep }} />
                    </div>
                    <div className= "editor-component-graph" ref = { this.graphContainer }>
                        <canvas/>
                    </div>
                </div>
                <div className="editor-options-card" id="transformer-container">
                    {/* <h3>Transformer Queue</h3>
                        <pre>{`
                        Condition examples:
                        - apply the transformation for all the node
                        whose token pass the regex test "ab+c"
                        /ab+c/.test(node.token)
                        - apply the transformation for all the node
                        whose token is either x, y, or z
                        ["x_", "y_", "z_"].includes(node.token)
                        - apply the transformation for all the node
                        at depth 2
                        ast.nodeDepth(node) === 2
                        `}</pre>
                        {tStack} */}
                    <button onClick={this.applyStack.bind(this)}>Apply for the current AST</button>
                    <button onClick={this.props.onBlast.bind(this, this.transformerStack)}>Blast</button>
                    <button onClick={this.learnTransformationFromInputOutput.bind(this)}>Learn</button>
                    <h3>Possible Transformations</h3>
                    {possibleTs}
                    {this.props.isModal?<button onClick={this.props.onTransformExprs!.bind(this, this.state.transformationSelected)}>Apply Everywhere</button>:''}
                </div>
            </div>
        );
    }
}

export default TreeEditor;
