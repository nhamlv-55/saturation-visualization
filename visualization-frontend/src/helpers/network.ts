import {parse} from "s-exify";
import { DataSet, Network, Node, Edge } from 'vis'
import { isObject } from "util";
import { assert } from "../model/util";
const _ = require("lodash");

const styleTemplates = require('../resources/styleTemplates');

export const lemmaColours = [
    "#e6194B",
    "#f58231",
    "#3cb44b",
    "#42d4f4",
    "#000075",
    "#469990",
    "#911eb4",
    "#f032e6",
    "#fabebe",
    "#800000",
];

//BUILD POB LEMMAS MAP////////////////////
export function buildPobLemmasMap(tree: any, varList: string[]): any{
    // construct exprID->expr map
    let ExprMap = new Map<number, string>();
    for (const nodeID in tree) {
        const node = tree[nodeID];
        ExprMap[node.exprID] = node.expr;
    }

    // construct PobExprID->a list of lemmas
    let PobLemmasMap = {};
    for (const nodeID in tree) {
        let node = tree[nodeID];
        if (node.event_type !== "EType.ADD_LEM") {
            continue
        }
        const lemmaExprID = node.exprID;
        const level = node.level;
        const pobID = node.pobID;
        if (!(pobID in PobLemmasMap)) {
            PobLemmasMap[pobID] = new Array<{}>();
        }

        //traverse the list, if lemmaExprID is already in the list, update its min max
        let existPrevLemma = false;
        for (const lemma of PobLemmasMap[pobID]) {
            if (lemma[0] === lemmaExprID) {
                existPrevLemma = true;
                let prev_min = lemma[1];
                let prev_max = lemma[2];

                if (level > prev_max || level === "oo") {
                    lemma[2] = level
                }
                if (level < prev_min) {
                    lemma[1] = level
                }
                break
            }
        }

        if (!existPrevLemma) {
            PobLemmasMap[node.pobID].push([lemmaExprID, level, level])
        }
    }
    return PobLemmasMap
}


//BUILD EXPR MAP////////////////////////
export function buildExprMap(tree: any, varList: string[]): any{
    let ExprMap = new Map<number, Object>();
    for (const nodeID in tree) {
        const node = tree[nodeID];
        const exprMapItem = {
            raw: node.expr.raw,
            readable: node.expr.readable,
            lhs: [], 
            edited: node.expr.readable,
            changed: false
        };
        ExprMap[node.exprID] = exprMapItem;
    }
    return ExprMap

}


export function PobVisLayout(tree): any{
    let treeCloned = JSON.parse(JSON.stringify(tree));

    for (const nodeID in treeCloned){
        let node = treeCloned[nodeID];
        if(node.event_type !== "EType.EXP_POB"){
            node.to_be_vis = false;
            continue
        }

        let parent = treeCloned[node.parent];
        let siblings = parent.children;
        let same_as_sibl = false;
        let identical_sibl;
        for(const siblID of siblings){

            const sibl = treeCloned[siblID];
            if(sibl.nodeID !== node.nodeID && sibl.exprID === node.exprID){
                same_as_sibl = true;
                identical_sibl = sibl;
                break
            }

        }
        if(same_as_sibl){
            // I will disappear
            node.to_be_vis = false;

            // point all my children to my sibling
            for(const childID of node.children){
                treeCloned[childID].parent = identical_sibl.nodeID;
                identical_sibl.children.push(childID)
            }
            //change my parent's children
            let new_children = new Array<number>();
            for (const childID of siblings){
                if(childID !== node.nodeID){
                    new_children.push(childID)
                }
            }
            parent.children = new_children
        }
    }

    return treeCloned
}

export function toVisNode(node: any, style: string, nodeSelection, finalInv: number, color:number = -1): any {
    const styleData = styleTemplates[style];
    const isMarked = nodeSelection.includes(node.nodeID);

    let finalColor  = {
        border : isMarked ? styleData.markedStyle.border : styleData.defaultStyle.border,
            background : isMarked ? styleData.markedStyle.background : styleData.defaultStyle.background,
            highlight : {
            border : styleData.highlightStyle.border,
                background : styleData.highlightStyle.background
        }
    };
    
    if (style === "lemma" && color !== -1) {
        finalColor = {
            border: lemmaColours[color],
            background: lemmaColours[color],
            highlight: {
                border: lemmaColours[color],
                background: lemmaColours[color]
            }
        }
    }
    return {
        id: node.nodeID,
        shape: finalInv > 0 ? finalInv > 1 ? "hexagon" : "star" : styleData.shape,
        fixed: true,
        color: finalColor
    };
}


export function toVisEdge(edgeId: number, parentNodeId: number, nodeID: number, hidden: boolean) {
    return {
        id: edgeId,
        arrows: "to",
        color: {
            color: "#dddddd",
            highlight: "#f8cfc1",
        },
        from: parentNodeId,
        to: nodeID,
        smooth: false,
        hidden: hidden
    }
}

export function getSliderValue(slider): number {
    return slider.current ? parseInt(slider.current.value, 10) : 0;
}

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
                    "forall"]
    if(typeof lst !== "string"){
        return false;
    }
    return optList.indexOf(lst)>-1;
}

export class Transformer{
    action: string;
    params: {};

    constructor(action: string, params: {}){
        this.action = action;
        this.params = params;
    }
}

export class ASTTransformer{
    run(node: ASTNode, ast: AST, t: Transformer): AST{
        switch(t.action){
            case "move":
                return this.move(node, ast, t.params);
            case "flipCmp":
                return this.flipCmp(node, ast, t.params);
            case "toImp":
                return this.toImp(node, ast, t.params);
            case "rename":
                return this.rename(node, ast, t.params);
            case "changeBreak":
                return this.changeBreak(node, ast, t.params);
            case "changeBracket":
                return this.changeBracket(node, ast, t.params);
            default:
                return ast;
        }
    }

    runStack(node: ASTNode, ast: AST, s: Transformer[]){
        let result = _.cloneDeep(ast);
        for(var transformer of s){
            result = this.run(node, ast, transformer);
        }
        return result;
    }

    move(node: ASTNode, ast: AST, params: {}): AST{
        /*
          move an AST node to the left or to the right
          E.g: moveLeft("+ x y z", "z") -> "+ x z y"
         */
        const movable = ["+", "*", "=", "and", "or"];
        let cloned_ast = _.cloneDeep(ast);
        let parent = cloned_ast.nodeList[node.parentID];
        assert('direction' in params);
        assert(movable.indexOf(parent.token)!=-1, "The parent node doesnt support reordering.");//only can move stuff under some opt
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
        return cloned_ast;
    }

    flipCmp(node: ASTNode, ast: AST, params: {}): AST{
        /*
          flip a comparison node
          E.g: flipCmp("> x y") -> "<= y x"
         */
        let cloned_ast = _.cloneDeep(ast);
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
        return cloned_ast;
    }

    toImp(node: ASTNode, ast: AST, params: {}): AST{
        let cloned_ast = _.cloneDeep(ast);

        let parent = cloned_ast.nodeList[node.parentID];
        console.log("parent", parent);

        let newHead = new ASTNode(cloned_ast.nodeList.length, "not", parent.nodeID, [node.nodeID]);
        cloned_ast.nodeList.push(newHead);

        let newTail = new ASTNode(cloned_ast.nodeList.length, "or", parent.nodeID, []);
        cloned_ast.nodeList.push(newTail);

        for(var childID of parent.children){
            if(childID != node.nodeID){
                cloned_ast.nodeList[childID].parentID = newTail.nodeID;
                newTail.children.push(childID);
            }
        }

        let newParent = new ASTNode(parent.nodeID, "=>", parent.parentID, [newHead.nodeID, newTail.nodeID]);
        cloned_ast.nodeList[parent.nodeID] = newParent;

        cloned_ast.buildVis();

        return cloned_ast;
    } 

    rename(node: ASTNode, ast: AST, params: {}): AST{
        let cloned_ast = _.cloneDeep(ast);
        return cloned_ast;
    }
    changeBreak(node: ASTNode, ast: AST, params:{}): AST{
        let cloned_ast = _.cloneDeep(ast);
        cloned_ast.nodeList[node.nodeID].shouldBreak ^= 1;
        cloned_ast.buildVis();
        return cloned_ast;
    }
    changeBracket(node: ASTNode, ast: AST, params:{}): AST{
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
        if (node.parentID==-1){
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
        if(node.children.length == 0){
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
        if(add_highlight && selectedID == node.nodeID){
            result = '<span class="highlighted">' + result + '</span>'
        }

        //add linebreak
        if(node.shouldBreak){
            result= '\n'+ '\t'.repeat(this.nodeDepth(node)) +  result ;
        }

        return result
    }
}

