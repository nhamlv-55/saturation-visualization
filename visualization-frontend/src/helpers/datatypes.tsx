
import { Transformer} from "../helpers/transformers";

export interface inOutExample{
    input: string,
    output: string,
    tStack: Transformer[]
}


export interface ExprItem {
    exprType: "LEMMA"|"POB"|"UNK",
    raw: string,
    editedRaw: string,
    editedReadable: string
}

export interface treeNode{
    children: number[],
    event_type: string,
    expr: string,
    exprID: number,
    level: number,
    nodeID: number,
    parent: number,
    pobID: number,
    to_be_vis: boolean
}
