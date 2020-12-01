import * as React from 'react';
import { AST, ASTTransformer, Transformer} from "./../helpers/transformers";
import { assert } from '../model/util';
import { DataSet, Network, Node, Edge } from 'vis'
import ReplaceDialog from './ReplaceDialog'
type Props = {
    name: string,
    input: string,
    onBlast: (tStack: Transformer[])=>void;
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
        const nodes = [this.state.selectedNodeID];
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
    async learnTransformation() {
        /* this.setState({
         *     learningFlag: false,
         *     learningErrorFlag: false,
         *     transformationFlag: false,
         *     transformationErrorFlag: false,
         *     possibleTransformations: []
         * });
         */
        let inputAST = this.astStack[0];
        let outputAST = this.astStack[this.astStack.length - 1];

        let payload = {
            trainingInputOutput:{"input": inputAST.toString(-1, inputAST.nodeList[0]),
                                 "output": outputAST.toString(-1, outputAST.nodeList[0]),
                                 "aux": [""]},
            exp_path: this.props.name 
        };

        console.log("payload", payload);
        const response = await fetch("http://localhost:5000/spacer/learn_transformation_modified", {
            method: 'POST',
            mode :'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify(payload)
        });
        console.log(response);
        if (response.status === 200){
            let responseJson = await response.json();
            let possiblePrograms = responseJson["response"];
            console.log(possiblePrograms);
            /* this.setState({
             *     learningFlag: true,
             *     possibleTransformations: possiblePrograms
             * });
             * this.forceUpdate(); */
        }
        else {
            /* this.setState({
             *     learningErrorFlag: true
             * }); */
        }
        
    }
    
    render() {
        console.log("I'm TreeEditor. I got", this.props.input);
        let tStack = this.displayTransformers();
        return (
            <div className="tree-editor">
                <div className="editor-options-card" id="graph-container">
                    <h4>{this.state.status}</h4>
                    <ul>
                        <button onClick={this.applyLocal.bind(this, "flipCmp", {})}>Flip Cmp</button>
                        <button onClick={this.applyLocal.bind(this, "toImp", {})}>To Imp</button>
                        <button onClick={this.applyLocal.bind(this, "move", {"direction": "l"})}>Move Left</button>
                        <button onClick={this.applyLocal.bind(this, "move", {"direction": "r"})}>Move Right</button>
                        <button onClick={this.applyLocal.bind(this, "changeBreak", {})}>\n?</button>
                        <button onClick={this.applyLocal.bind(this, "changeBracket", {})}>()?</button>
                        <button onClick={this.applyLocal.bind(this, "squashNegation", {})}>Collapse Negation</button>
                        <br/>
                        <ReplaceDialog
                            onApply = {this.applyLocal.bind(this)}
                        />
                        <br/>

                        <button onClick={this.undo.bind(this)}>Undo</button>
                    </ul>
                    <pre><div dangerouslySetInnerHTML={{ __html: this.state.stringRep }} /></pre>
                    <div className= "editor-component-graph" ref = { this.graphContainer }>
                        <canvas/>
                    </div>
                </div>
                <div className="editor-options-card" id="transformer-container">
                    <h3>Transformer Queue</h3>
                    <pre>{`
Condition examples:
    - apply the transformation for all the node whose token pass the regex test "ab+c"
    /ab+c/.test(node.token)
    - // apply the transformation for all the node whose token is either x, y, or z
    ["x_", "y_", "z_"].includes(node.token)
    - // apply the transformation for all the node at depth 2
    ast.nodeDepth(node) === 2
                        `}</pre>
                    {tStack}
                    <button onClick={this.applyStack.bind(this)}>Apply for the current AST</button>
                    <button onClick={this.props.onBlast.bind(this, this.transformerStack)}>Blast</button>
                    <button onClick={this.learnTransformation.bind(this)}>Learn</button>
                </div>
            </div>
        );
    }
}

export default TreeEditor;
