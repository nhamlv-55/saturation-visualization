
import { Transformer} from "../helpers/transformers";

export interface inOutExample{
    input: string,
    output: string,
    tStack: Transformer[]
}


export interface IExprItem {
    exprType: "LEMMA"|"POB"|"UNK",
    raw: string,
    editedRaw: string,
    editedReadable: string
}

export interface ITreeNode{
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

export interface IExprMap{
    string: IExprItem
}
