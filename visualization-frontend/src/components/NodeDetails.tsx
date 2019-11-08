import * as React from 'react';

import './NodeDetails.css';
import Sortable from 'react-sortablejs';
import { Clause } from '../model/unit';
import { Literal } from '../model/literal';
import SatNode from '../model/sat-node';

type Props = {
    node: any,
    PobLemmasMap: {},
    ExprMap: {},
    layout: string,
};

export default class NodeDetails extends React.Component<Props, {}> {

    keep = false; // hack to skip each second event generated by Sortable

    render() {
        let additional_info ="type:" + this.props.node.event_type + " level:" + this.props.node.level
        let lemma_list = new Array();
        if(this.props.layout == "PobVis" && this.props.node.event_type == "EType.EXP_POB"){
            lemma_list.push(<h2 key ="lemma-title"> Lemmas summerization </h2>)
            let lemmas = this.props.PobLemmasMap[this.props.node.exprID]
            for (const lemma of lemmas){
                lemma_list.push(<h2 key={"lemma-header-"+ lemma[0]}>ExprID: {lemma[0]}, From: {lemma[1]} to {lemma[2]}</h2>)
                lemma_list.push(<pre key={"lemma-expr-"+lemma[0]}>{this.props.ExprMap[lemma[0]]}</pre>)
            }
        }

        return (
                <section className= { 'component-node-details details'} >
                <article>
                <h2>Node <strong>{this.props.node.nodeID}, </strong>Expr < strong > { this.props.node.exprID } </strong>, Parent <strong> {this.props.node.pobID}  </strong></h2 >
                <h3>{additional_info}</h3>
                <pre>{this.props.node.expr}</pre>
                </article>
                <article>
                {lemma_list}
            </article>
                </section>
        );
    }

}
