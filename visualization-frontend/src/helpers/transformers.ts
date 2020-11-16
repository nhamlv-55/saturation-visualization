import {parse} from "s-exify";
import { Node, Edge } from 'vis'
import { assert } from "../model/util";
const _ = require("lodash");

export class ASTNode{
    nodeID: number;
    token: string;
    shouldBreak: number;
    shouldInBracket: number;
    parentID: number;
    children: number[];
    transformers = [];
    constructor(nodeID: number, token: string, parentID: number, children: number[]){
        this.nodeID = nodeID;
        this.token = token;
        this.shouldBreak = 0;
        this.shouldInBracket = 1;
        this.parentID = parentID;
        this.children = children;
    }

}

function isOpt(lst){
    const optList = ["+", "-", "*", "/",
                     ">", "<", ">=", "<=", "=",
                     "and", "or", "not", "=>",
                     "assert",
                     "declare-datatypes",
                     "forall", "exists", "define"]
    if(typeof lst !== "string"){
        return false;
    }
    return optList.indexOf(lst)>-1;
}

export interface Transformer{
    action: string;
    condition: string;
    params: {};
}

export class ASTTransformer{
    run(node: ASTNode, ast: AST, t: Transformer): AST{
        if(t.action!=="applyStack"){
            return this[t.action](node, ast, t.params, t.condition);
        }
        return ast;
    }

    runStack(ast: AST, tStack: Transformer[]){
        let result = _.cloneDeep(ast);
        //loop over all transformer
        console.log("res:", result);
        for(var transformer of tStack){
            //apply the transformer to all the node if possible.
            for(var node of result.nodeList){
                console.log("res:", result);
                result = this.run(node, result, transformer);
            }
        }
        return result;
    }

    getCondition(action: string, node: ASTNode, ast: AST): string{
        let condition = "true";
        switch(action){
            case "move":{
                const node_depth = ast.nodeDepth(node);
                condition = `ast.nodeDepth(node) === ${node_depth}`;
                break;
            }
            case "changeBreak":{
                const current_break = node.shouldBreak;
                const node_depth = ast.nodeDepth(node);
                condition = `ast.nodeDepth(node) === ${node_depth} && node.shouldBreak === ${current_break}`;
                break;
            }
        }
        return condition;
    }


    move(node: ASTNode, ast: AST, params: {}, condition: string ): AST{
        /*
          move an AST node to the left or to the right
          E.g: moveLeft("+ x y z", "z") -> "+ x z y"
         */
        const movable = ["+", "*", "=", "and", "or"];
        let cloned_ast = _.cloneDeep(ast);

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
                    }
                    break;
                }
                case "r":{
                    if(nodePosition<siblings.length-1){
                        //ES6 magic
                        [siblings[nodePosition], siblings[nodePosition+1]] = [siblings[nodePosition+1], siblings[nodePosition]];
                    }
                    break;
                }
                default:
                    break;
            }
            cloned_ast.buildVis();
        }
        return cloned_ast;
    }

    flipCmp(node: ASTNode, ast: AST, params: {}, condition: string ): AST{
        /*
          flip a comparison node
          E.g: flipCmp("> x y") -> "<= y x"
         */
        let cloned_ast = _.cloneDeep(ast);
        if(eval(condition)){
            let new_node : ASTNode;
            switch(node.token){
                case "=":{
                    new_node = new ASTNode(node.nodeID, "=", node.parentID, [node.children[1], node.children[0]]);
                    break;
                }
                case "<":{
                    new_node = new ASTNode(node.nodeID, ">=", node.parentID, [node.children[1], node.children[0]]);
                    break;
                }
                case ">":{
                    new_node = new ASTNode(node.nodeID, "<=", node.parentID, [node.children[1], node.children[0]]);
                    break;
                }
                case ">=":{
                    new_node = new ASTNode(node.nodeID, "<", node.parentID, [node.children[1], node.children[0]]);
                    break;
                }
                case "<=":{
                    new_node = new ASTNode(node.nodeID, ">", node.parentID, [node.children[1], node.children[0]]);
                    break;
                }
                default:
                    new_node = node;
            }
            cloned_ast.nodeList[node.nodeID] = new_node;
            cloned_ast.buildVis();
        }
        return cloned_ast;
    }

    toImp(node: ASTNode, ast: AST, params: {}, condition: string ): AST{
        let cloned_ast = _.cloneDeep(ast);
        if(eval(condition)){
            let parent = cloned_ast.nodeList[node.parentID];
            console.log("parent", parent);

            if(parent.token!=="or"){
                return cloned_ast;
            }


            let newHead = new ASTNode(cloned_ast.nodeList.length, "not", parent.nodeID, [node.nodeID]);
            cloned_ast.nodeList.push(newHead);

            let newTail = new ASTNode(cloned_ast.nodeList.length, "or", parent.nodeID, []);
            cloned_ast.nodeList.push(newTail);

            for(var childID of parent.children){
                if(childID !== node.nodeID){
                    cloned_ast.nodeList[childID].parentID = newTail.nodeID;
                    newTail.children.push(childID);
                }
            }

            let newParent = new ASTNode(parent.nodeID, "=>", parent.parentID, [newHead.nodeID, newTail.nodeID]);
            cloned_ast.nodeList[parent.nodeID] = newParent;

            cloned_ast.buildVis();
        }
        return cloned_ast;
    } 

    rename(node: ASTNode, ast: AST, params: {}, condition: string ): AST{
        let cloned_ast = _.cloneDeep(ast);

        return cloned_ast;
    }
    changeBreak(node: ASTNode, ast: AST, params:{}, condition: string ): AST{
        let cloned_ast = _.cloneDeep(ast);
        cloned_ast.nodeList[node.nodeID].shouldBreak ^= 1;
        cloned_ast.buildVis();
        return cloned_ast;
    }
    changeBracket(node: ASTNode, ast: AST, params:{}, condition: string ): AST{
        let cloned_ast = _.cloneDeep(ast);
        cloned_ast.nodeList[node.nodeID].shouldInBracket ^= 1;
        cloned_ast.buildVis();
        return cloned_ast;
    }
}


export class AST {
    nodeList = new Array<ASTNode>();
    visNodes = new Array<Node>();
    visEdges = new Array<Edge>();

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


    lstToAST(parentID, lst): number{
        const nodeID = this.nodeList.length
        if(typeof lst === 'string'){
            const node = new ASTNode(nodeID, lst, parentID, []);
            this.nodeList.push(node);
            return nodeID;
        }

        //if is an opt
        if(isOpt(lst[0])){
            let node = new ASTNode(nodeID, lst[0], parentID, []);
            this.nodeList.push(node);

            for(var _i=1; _i < lst.length; _i++){

                node.children.push(this.lstToAST(nodeID, lst[_i]));
            }

            return nodeID;
        }else{
            //is a list
            let node = new ASTNode(nodeID, "list", parentID, []);
            this.nodeList.push(node);

            for(var _i=0; _i < lst.length; _i++){
                node.children.push(this.lstToAST(nodeID, lst[_i]));
            }

            return nodeID;
        }

        //
    }

    buildVis(){
        console.log(this.nodeList)
        this.visNodes = [];
        this.visEdges = [];

        for(const node of this.nodeList){
            this.visNodes.push({
                id: node.nodeID,
                label: node.token + ((node.shouldInBracket)?'+()':'') + ((node.shouldBreak)?'+nl':''),
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
            result= '\n'+ '\t'.repeat(this.nodeDepth(node)) +  result ;
        }

        return result
    }
}


