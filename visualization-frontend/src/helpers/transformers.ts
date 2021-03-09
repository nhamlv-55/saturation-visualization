// @ts-nocheck

import { Node, Edge } from 'vis';
import { assert } from "./util";
import {parse, isSExpNode, SExp, SExpNode} from './uber-s-exify';
import {negateMap} from "./readable";
const _ = require("lodash");

const NULL_IDX = -100;

export interface ProseTransformation{
    humanReadableAst: string,
    xmlAst: string
}


export class ASTNode{
    nodeID: number;
    token: string;
    shouldBreak: number;
    shouldInBracket: number;
    parentID: number;
    children: number[];
    transformers = [];
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;

    constructor(nodeID: number, token: string, parentID: number, children: number[]){ 
        this.nodeID = nodeID;
        this.token = token;
        this.shouldBreak = 0;
        this.shouldInBracket = 1;
        this.parentID = parentID;
        this.children = children;
        this.startLine = -1;
        this.endLine = -1;
        this.startOffset = -1;
        this.endOffset = -1;
    }

    updateRange(node: SExpNode){
        this.startLine = node.startLine;
        this.startOffset = node.startOffset;
        this.endLine = node.endLine;
        this.endOffset = node.endOffset;
    }

}

function isOpt(lst: SExp|SExpNode){
    const optList = ["+", "-", "*", "/",
                     ">", "<", ">=", "<=", "=",
                     "and", "or", "not", "=>",
                     "assert",
                     "declare-datatypes",
                     "forall", "exists", "define",
                     "select", "store"];

    if(Array.isArray(lst)){
        return false;
    }
    return optList.indexOf(lst.token)>-1;
}

export interface Transformer{
    action: string;
    condition: string;
    params: {};
}

export class ASTTransformer extends Object{
    run(nodes: number[], ast: AST, t: Transformer): [boolean, AST]{
        if(t.action!=="runStack"){
            return this[t.action](nodes, ast, t.params, t.condition);
        }
        return [false, ast];
    }

    runStack(ast: AST, tStack: Transformer[]): AST{
        let new_ast = _.cloneDeep(ast);
        //loop over all transformer
        let t_index = 0;
        while(t_index < tStack.length){
            //apply the transformer to all the node if possible.
            let dirty = true;

            for(var node of new_ast.nodeList){
                if(node.nodeID === NULL_IDX){
                    //null node
                    continue;
                }
                [dirty, new_ast] = this.run([node.nodeID], new_ast, tStack[t_index]);
                if(dirty){
                    break;
                }
            }
            //only move to the next transformer if reach fixpoint (dirty = false)
            if(!dirty){
                t_index++;
            }
        }
        return new_ast;
    }

    getCondition(action: string, nodes: number[], ast: AST): string{
        let node = ast.nodeList[nodes[nodes.length - 1]];
        let condition = "true";
        switch(action){
            case "move":{
                const current_token = node.token;
                condition = `node.token === ${current_token}`;
                break;
            }
            case "changeBreak":{
                const current_break = node.shouldBreak;
                const node_depth = ast.nodeDepth(node);
                condition = `ast.nodeDepth(node) === ${node_depth} && node.shouldBreak === ${current_break}`;
                break;
            }
            case "changeBracket":{
                const current_in_bracket = node.shouldInBracket ;
                const node_depth = ast.nodeDepth(node);
                condition = `ast.nodeDepth(node) === ${node_depth} && node.shouldInBracket === ${current_in_bracket}`;
                break;
            }
            case "squashNegation":{
                condition = "true";
                break;
            }
            case "replace":{
                condition = "true";
                break;
            }
            default:{
                const current_token = node.token;
                const node_depth = ast.nodeDepth(node);
                condition = `node.token === "${current_token}" && ast.nodeDepth(node) === ${node_depth}`;
                break;
            }
        }
        return condition;
    }

    move(nodes: number[], ast: AST, params: {}, condition: string ): [boolean, AST]{
        /*
          move an AST node to the left or to the right
          E.g: moveLeft("+ x y z", "z") -> "+ x z y"
         */
        let node = ast.nodeList[nodes[nodes.length - 1]];
        const movable = ["+", "*", "=", "and", "or"];
        let cloned_ast = _.cloneDeep(ast);

        let dirty = false;
        if(eval(condition)){
            let parent = cloned_ast.nodeList[node.parentID];
            assert('direction' in params);
            assert(movable.indexOf(parent.token)!==-1, "The parent node doesnt support reordering.");//only can move stuff under some opt
            let siblings = parent.children;

            const nodePosition = siblings.indexOf(node.nodeID);

            switch(params["direction"]){
                case "l":{
                    if(nodePosition>0){
                        //ES6 magic
                        [siblings[nodePosition], siblings[nodePosition-1]] = [siblings[nodePosition-1], siblings[nodePosition]];
                        dirty = true;
                    }
                    break;
                }
                case "r":{
                    if(nodePosition<siblings.length-1){
                        //ES6 magic
                        [siblings[nodePosition], siblings[nodePosition+1]] = [siblings[nodePosition+1], siblings[nodePosition]];
                        dirty = true;
                    }
                    break;
                }
                default:
                    break;
            }
            cloned_ast.buildVis();
        }
        return [dirty, cloned_ast];
    }

    flipCmp(nodes: number[], ast: AST, params: {}, condition: string ): [boolean, AST]{
        /*
          flip a comparison node
          E.g: flipCmp("> x y") -> "<= y x"
         */
        let node = ast.nodeList[nodes[nodes.length - 1]];
        let cloned_ast = _.cloneDeep(ast);
        let dirty = false;
        if(eval(condition)){
            let new_node : ASTNode;
            switch(node.token){
                case "=":{
                    new_node = new ASTNode(node.nodeID, "=", node.parentID, [node.children[1], node.children[0]]);
                    dirty = true;
                    break;
                }
                case "<":{
                    new_node = new ASTNode(node.nodeID, ">", node.parentID, [node.children[1], node.children[0]]);
                    dirty = true;
                    break;
                }
                case ">":{
                    new_node = new ASTNode(node.nodeID, "<", node.parentID, [node.children[1], node.children[0]]);
                    dirty = true;
                    break;
                }
                case ">=":{
                    new_node = new ASTNode(node.nodeID, "<=", node.parentID, [node.children[1], node.children[0]]);
                    dirty = true;
                    break;
                }
                case "<=":{
                    new_node = new ASTNode(node.nodeID, ">=", node.parentID, [node.children[1], node.children[0]]);
                    dirty = true;
                    break;
                }
                default:
                    new_node = node;
            }
            cloned_ast.nodeList[node.nodeID] = new_node;
            cloned_ast.buildVis();
        }
        return [dirty, cloned_ast];
    }

    toImp(nodes: number[], ast: AST, params: {}, condition: string ): [boolean, AST]{
        /*
          Convert (or X Y Z T) to (and(~X ~Y) => (or Z T))

        */
        if(nodes.length === 0){
            return [false, _.cloneDeep(ast)];
        }
        
        let node = ast.nodeList[nodes[nodes.length - 1]];
        let cloned_ast = _.cloneDeep(ast);
        let cloned_node = cloned_ast.nodeList[node.nodeID];
        let dirty = false;
        if(eval(condition)){
            //get the `or` node
            let parent = cloned_ast.nodeList[cloned_node.parentID];

            if(!parent || parent.token!=="or"){
                return [false, cloned_ast];
            }
            // For an implication X => Y, X is the head, Y is the tail
            let headChildren = new Array<number>();
            let tailChildren = new Array<number>();
            let newHead: ASTNode;
            let newTail: ASTNode;
            for(var cID of parent.children){
                if(nodes.includes(cID)){
                    // console.log("c negate", cloned_ast.nodeList[cID].negate());
                    let new_cID = cloned_ast.negateNode(cID);
                    headChildren.push(new_cID);
                }else{
                    tailChildren.push(cID);
                }
            }


            //build the head (X in X => Y)
            if(headChildren.length>1){
                newHead = new ASTNode(cloned_ast.nodeList.length, "and", parent.nodeID, headChildren);
                cloned_ast.nodeList.push(newHead);
                for(var childID of headChildren){
                    cloned_ast.nodeList[childID].parentID = newHead.nodeID;
                }
            }else{
                newHead = cloned_ast.nodeList[headChildren[0]];
            }


            //build the tail (Y in X => Y)
            if(tailChildren.length > 1){
                newTail = new ASTNode(cloned_ast.nodeList.length, "or", parent.nodeID, tailChildren);
                cloned_ast.nodeList.push(newTail);
                for(var childID of tailChildren){
                    cloned_ast.nodeList[childID].parentID = newTail.nodeID;
                }
            }else{
                newTail = cloned_ast.nodeList[tailChildren[0]];
            }
            //change the `or` node into the `=>` node
            parent.token = "=>";
            parent.children = [newHead.nodeID, newTail.nodeID];

            cloned_ast.buildVis();
            dirty = true;
        }
        return [dirty, cloned_ast];
    } 

    replace(nodes: number[], ast: AST, params: {}, condition: string ): [boolean, AST]{
        let node = ast.nodeList[_.last(nodes)];
        let cloned_ast = _.cloneDeep(ast);
        let dirty = false;
        let source = params["source"]
        if(eval(condition)){
            if(params["regex"]){
                source = new RegExp(params["source"])
            }


            for(var cloned_node of cloned_ast.nodeList){
                let old_token = cloned_node.token
                cloned_node.token = old_token.replace(source, params["target"]);
                if(cloned_node.token !== old_token){
                    dirty = true;
                }
            }

            if(dirty){
                cloned_ast.buildVis();
            }
        }

        return [dirty, cloned_ast];
    }
    changeBreak(nodes: number[], ast: AST, params:{}, condition: string ): [boolean,AST]{
        let node = ast.nodeList[_.last(nodes)];
        let cloned_ast = _.cloneDeep(ast);
        if(eval(condition)){
            cloned_ast.nodeList[node.nodeID].shouldBreak ^= 1;
            cloned_ast.buildVis();
            return [true, cloned_ast];
        }
        return [false, cloned_ast];
    }
    changeBracket(nodes: number[], ast: AST, params:{}, condition: string ): [boolean, AST]{
        let node = ast.nodeList[_.last(nodes)];
        let cloned_ast = _.cloneDeep(ast);
        if(eval(condition)){
            cloned_ast.nodeList[node.nodeID].shouldInBracket ^= 1;
            cloned_ast.buildVis();
            return [true, cloned_ast];
        }
        return [false, cloned_ast];
    }
}


export class AST {
    nodeList = new Array<ASTNode>();
    visNodes = new Array<Node>();
    visEdges = new Array<Edge>();

    null_node = new ASTNode(NULL_IDX, "null-node", NULL_IDX, []);
    constructor(formula: string){
        this.lstToAST(-1, parse(formula));
        this.buildVis();
    }

    nodeDepth(node: ASTNode): number{
        if (node.parentID===-1){
            return 0;
        }

        return this.nodeDepth(this.nodeList[node.parentID])+1;
    }
    negateNode(nodeID: number): number{
        let node = this.getNode(nodeID);
        //if node is `not`, squash it
        if(node.token==="not"){
            /*
              if a node is not->formula
              replace it with ``formula``
             */
            let child = this.getNode(node.children[0]);
            this.nodeList[nodeID] = new ASTNode(node.nodeID, child.token, node.parentID, child.children);
            //point all child to the new parent
            for(var cID of child.children){
                this.getNode(cID).parentID = node.nodeID;
            }

            this.deleteNode(child.nodeID);
            return node.nodeID;
        }
        //negate using negateMap if operator is in negate map
        if(node.token in negateMap){
            this.nodeList[nodeID] = new ASTNode(node.nodeID, negateMap[node.token], node.parentID, node.children);
            return node.nodeID;
        }
        //negate a normal node
        let new_node = new ASTNode(this.nodeList.length, `not`, node.parentID, [nodeID]);
        console.log("new node", new_node);
        node.parentID = new_node.nodeID;
        this.nodeList.push(new_node);
        return new_node.nodeID;
    }

    getNode(nodeID: number): ASTNode{
        return this.nodeList[nodeID];
    }

    deleteNode(nodeID: number): void{
        this.nodeList[nodeID] = this.null_node;
    }

    findNode(line: number, character: number): ASTNode| null{
        for(var node of this.nodeList){
            if(node.startLine<=line &&
                node.endLine>=line &&
                node.startOffset<=character &&
                node.endOffset>=character)
                return node;
        }
        return null;
    }


    lstToAST(parentID: number, lst: SExp|SExpNode): number{
        // console.log(lst);
        const nodeID = this.nodeList.length;
        if(isSExpNode(lst)){
            const node = new ASTNode(nodeID, lst.token, parentID, []);
            node.updateRange(lst); 
            this.nodeList.push(node);
            return nodeID;
        }
        //if is an opt
        if(isOpt(lst[0])){
            let node = new ASTNode(nodeID, (lst[0] as SExpNode).token, parentID, []);
            node.updateRange(lst[0] as SExpNode);
            this.nodeList.push(node);

            for(var _i=1; _i < lst.length; _i++){

                node.children.push(this.lstToAST(nodeID, lst[_i]));
            }

            return nodeID;
        }else{
            //is a list
            // console.log(lst[0], lst[0] as SExpNode, (lst[0] as SExpNode).token);
            // let node = new ASTNode(nodeID, (lst[0] as SExpNode).token, parentID, []); 
            let node = new ASTNode(nodeID, "list", parentID, []);
            //TODO: fix the update range. it shouldnt be a problem with the visualizer, but only a problem for the VSCode extension
            // node.updateRange(lst);
            this.nodeList.push(node);

            for(var _i=0; _i < lst.length; _i++){
                node.children.push(this.lstToAST(nodeID, lst[_i]));
            }

            return nodeID;
        }

        //
    }

    buildVis(){
        this.visNodes = [];
        this.visEdges = [];

        for(const node of this.nodeList){
            if(node.nodeID!==NULL_IDX){
                let label = node.token;

                if(node.shouldInBracket){
                    label = '(' + label + ')';
                }
                this.visNodes.push({
                    id: node.nodeID,
                    label: label + ((node.shouldBreak)?'\u21B5':''),
                    shape: "box",
                    size: 20,
                })
                for(const childID of node.children){
                    this.visEdges.push({
                        id: this.visEdges.length,
                        from: node.nodeID,
                        to: childID
                    })
                }
            }
        }
    }



    toString(selectedID: number, node: ASTNode): string{
        return this.toHTML(selectedID, node);
    }
    toHTML(selectedID: number, node: ASTNode, add_highlight = true): string{
        let result: string;
        if(node.children.length === 0){
            result = node.token
        }else{
            let children = new Array<string>();
            if(node.token !== 'list'){ children.push(node.token);  }

            for(const childID of node.children){
                children.push(this.toHTML(selectedID, this.nodeList[childID]));
            }
            if (children.length === 1 || !node.shouldInBracket){
                result = children.join(" ");
            }else{
                result = "("+children.join(" ")+")";
            }


        }

        //add highlight
        if(add_highlight && selectedID === node.nodeID){
            result = '<span class="highlighted">' + result + '</span>'
        }

        //add linebreak
        if(node.shouldBreak){
            result= '\n'+ '    '.repeat(this.nodeDepth(node)) +  result ;
        }

        return result
    }
}


