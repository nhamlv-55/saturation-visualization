import { parse, SExp} from "s-exify";

const _ = require("lodash");
export const negateMap = {
    "<=": ">",
    ">=": "<",
    "!=": "=",
    "<": ">=",
    ">": "<=",
    "=": "!=",
    "&&": "||",
    "||": "&&",
    "not": ""
};

const sortableOps = ["+", "and", "or", "*"];
const logSym = ["&&", "||", "=>"];


export function toReadable(expr: string): string{
    //NHAM: the current toReadable is so broken with anything other than
    //simple_bakery, so temporary disable it
    return expr;
}


// export function oldToReadable(expr: string): string {
//     if (expr[0] !== "("){
//         expr = "(" + expr + ")";
//     }
//     return parseResult(parse(expr), "");
//     // return parseResult(sortLST(parse(expr)), "");
// }


// function sortLST(lst: SExp){
//     //XXX: Fix me
//     if(_.isString(lst)){
//         return lst;
//     }

//     if(lst.length < 1){
//         return lst;
//     }

//     if(sortableOps.includes(lst[0])){
//         var args = _.cloneDeep(lst.slice(1));
//         args.sort(function(x, y) {
//             if (sortLST(x).toString() < sortLST(y).toString()) {
//                 return -1;
//             }
//             if (sortLST(x).toString() > sortLST(y).toString()) {
//                 return 1;
//             }
//             return 0;
//         });
        
//         return [lst[0]].concat(args);
//     }
//     // return lst;
//     else{
//         var newLst = [lst[0]];
//         for(let i = 1; i < lst.length; i++){
//             newLst.push(sortLST(lst[i]));
//         }
//         return newLst;
//     }
// }


// function parseResult(lst, sep) {
//     //symbols for logical relations
//     let logSym = {
//         "and": "&&",
//         "or": "||"
//     };

//     //symbols for mathematical operations
//     //Note: "-" is not included because negative numbers are in the form (- x)
//     let logOp = ["!=", "=", "<=", ">=", ">", "<", "+", "*", "/", "=>"];

//     //empty list should return empty string
//     if (lst.length < 1){
//         return "";
//     }

//     //logical symbol should be inserted between each child clause
//     if (lst[0] in logSym) {
//         return parseResult(lst.splice(1), logSym[lst[0]]);
//     }

//     //reorders to put operators between operands
//     //Note: accounts for "-" denoting the subtraction of 2 numbers, (- x y)
//     if (logOp.indexOf(lst[0]) >= 0 || (lst[0] === "-" && lst.length === 3)){
//         return "(" + parseResult(lst[1], "") + " " + lst[0] + " " + parseResult(lst[2], "") + ")";
//     }

//     //handles indexing into an array
//     if (lst[0] === "select") {
//         return lst[1] + "[" + parseResult(lst[2], "") + "]";
//     }

//     //Adds not symbol (!) to beginning of clause
//     if (lst[0] === "not") {
//         if (lst[1][0] in negateMap){
//             lst[1][0] = negateMap[lst[1][0]];
//             return parseResult(lst[1], "");
//         }
//         return parseResult("!" + lst[1], "");
//     }

//     //prevents trailing logical symbol
//     if (sep !== "" && lst.length === 1){
//         return parseResult(lst[0], "");
//     }

//     //actual place where logical symbol gets placed between clauses
//     if (sep !== "") {
//         return parseResult(lst[0], "") + " " + sep + "\n" + parseResult(lst.splice(1), sep);
//     }

//     //handler for negative numbers which come in the form (- x)
//     if (lst[0] === "-"){
//         return lst[0] + parseResult(lst[1], "");
//     }

//     //handler for denoting invariants. Ex. Inv (...)
//     if (typeof(lst[0]) === 'string' && Array.isArray(lst) && lst.length > 1){
//         return lst[0] + ": (" + parseResult(lst[1], "") + ")";
//     }

//     return lst.toString();
// }

export function replaceVarNames(expr: string, varList: string): string {
    if (varList === "") return expr;
    if (typeof expr === "string") {
        let newList = varList.split(" ");
        for (let i = 0; i < newList.length; i++) {
            let regex = new RegExp( "[a-zA-z0-9@$:!]+_"+ i + "_n", "gi");
            expr = expr.replace(regex, newList[i]);
        }
    }
    return expr;
}

// export function reorder(expr, lhs, op){
//     if (typeof expr !== "string") return expr;
//     let lhsFinal:Number[] = [];
//     let rhsFinal:Number[] = [];
//     let exprList = getCleanExprList(expr, op);
//     let result = "";
//     for (let i = 0; i < exprList.length; i++){
//         if (lhs.indexOf(i) > -1) {
//             if (lhsFinal.length === 0){
//                 result = negate(exprList[i]) + result;
//             }
//             else {
//                 result = negate(exprList[i]) + " " + negateMap[op] + "\n" + result;
//             }
//             lhsFinal.push(i);
            
//         }
//         else {
//             if (rhsFinal.length === 0) {
//                 result = result + " =>\n" + exprList[i];
//             }
//             else {
//                 result = result + " " + op + "\n" + exprList[i]
//             }
//            rhsFinal.push(i); 
//         }
        
//         if (i === exprList.length - 1) {
//             if (lhsFinal.length === 0) {
//                 result = "true " + result
//             }
//             if (rhsFinal.length === 0) {
//                 result = result + " =>\nfalse"
//             }
//         }
//     }
//     return result;
// }

// function negate(expr) {
//     let compOp = getCompOp(expr);
//     if (compOp === "not"){
//         return compOp + " " + expr
//     }
//     return expr.replace(compOp, negateMap[compOp]);
// }

// function getCompOp(expr: string) {
//     let keys = Object.keys(negateMap);
//     for (let i = 0; i < keys.length; i++){
//         if (expr.includes(keys[i])){
//             return keys[i];
//         } 
//     }
    
//     return "not";
// }

// export function getOp(expr) {
//     for (let i = 0; i < logSym.length; i++) {
//         if (expr.includes(logSym[i])) return logSym[i];
//     }
// }

// export function getIndexOfLiteral(exprList, literal){
//     for (let i = 0; i < exprList.length; i++){
//         if (literal === exprList[i] || literal === negate(exprList[i])){
//             return i;            
//         }
//     }
//     return -1;
// }

export function getCleanExprList(expr: string, sep: string): string[] {
    let exprList = expr.split(sep);
    let resultExprList:string[] = [];
    for (let i = 0; i < exprList.length; i++){
        if (exprList[i] !== "") {
            resultExprList.push(exprList[i].trim());
        }
    }
    
    return resultExprList;
}

// export function getVariables(literal) {
//     let regex = /([a-zA-Z])+/g;
//     return literal.match(regex);
// }

// export function getProcesses(literal) {
//     let regex = /(\[[0-9]+\])/g;
//     return literal.match(regex);
// }

// export function getProcessVariables(literal) {
//     let regex = /([a-zA-Z]+\[[0-9]+\])/g;
//     return literal.match(regex);
// }

// export function cleanExprOperators(expr) {
//     for (let i = 0; i < logSym.length; i++){
//        expr = expr.replace(logSym[i], ""); 
//     }
//     return expr;
// }

// export function getVarIndices(varList: string[], exprList: string[]) {
//     let result:number[] = [];
//     for (let i = 0; i < varList.length; i++){
//         for (let j = 0; j < exprList.length; j++){
//             if (exprList[j].includes(varList[i])){
//                 result.push(j);
//             }
//         }
//     }
//     return result;
// }


export function getProblemName(fileName: string): any {
    let regex = /.*.smt2/
    return fileName.match(regex);
}
