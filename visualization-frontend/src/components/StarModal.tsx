import * as React from 'react';
import '../styles/StarModal.css';

import TransformerTable from './TransformerTable';
const icons = require('../resources/icons/all.svg') as string;

const _ = require("lodash");
type Props = {
    exp_path: string,
    PobLemmasMap: {},
    ExprMap: {},
}

type State = {
    localExprMap: {},
    input: string,
    output: string,
    finalLemmas: any[][],
    /* finalLemListRaw: JSX.Element[], */
    /* finalLemListEdited: JSX.Element[] */
}


export class StarModal extends React.Component<Props, State> {
    state: State = {
        localExprMap: this.props.ExprMap,
        input: "()",
        output: "",
        finalLemmas: this.getFinalInvariant()
        /* finalLemListEdited: [], */
        /* finalLemListRaw: [] */
    };


    
    getFinalInvariant(){
        let finalLemmas: Set<any[]> = new Set<any[]>();
        for(const pob in this.props.PobLemmasMap){
            /* console.log(pob); */
            let lemmas = this.props.PobLemmasMap[pob];
            for(const lemma of lemmas){
                if(lemma instanceof Array && lemma[2]==="oo"){
                    finalLemmas.add(lemma);
                }
            }
        }

        return Array.from(finalLemmas.values());
    }

    getLemmaHeader(lemma: any[]): string{
        const lemma_id = lemma[0];
        const lemma_header = this.state.localExprMap[lemma_id].raw.split("\n")[0];
        return lemma_header;
    }

    reset(){
        this.setState({finalLemmas: this.getFinalInvariant()});
    }

    sortByLevel(){
        const sorted = this.state.finalLemmas
                           .sort((lem_a, lem_b)=> lem_a[1] > lem_b[1] ? 1 : -1);
        this.setState({finalLemmas: sorted});
    }

    sortByHeader(){
        const sorted = this.state.finalLemmas
                           .sort((lem_a, lem_b) =>
                               this.getLemmaHeader(lem_a)> this.getLemmaHeader(lem_b) ? 1 : -1)
        this.setState({finalLemmas: sorted});
    }

    renderFinalInvariant(){
        /* if(finalLemmas === null){
         *     finalLemmas = this.state.finalLemmas;
         * } */
        let finalLemEdited: JSX.Element[] = [];
        let finalLemRaw: JSX.Element[] = [];

        for (const lemma of this.state.finalLemmas){
            const lemma_id = lemma[0];
            if(lemma[2]!=="oo"){continue;}
            let expr_raw = '';
            let expr_edited = '';
            if(this.state.localExprMap[lemma_id]){
                expr_edited = this.state.localExprMap[lemma_id].raw;
                expr_raw = this.props.ExprMap[lemma_id].raw;
            }

            finalLemEdited.push(<h4 key={"lemma-header-edited-"+ lemma_id}>ExprID: {lemma[0]}, From: {lemma[1]} to {lemma[2]}</h4>);
            finalLemEdited.push(<pre>{expr_raw}</pre>);

            finalLemRaw.push(<h4 key={"lemma-header-"+ lemma_id}>ExprID: {lemma[0]}, From: {lemma[1]} to {lemma[2]}</h4>);
            finalLemRaw.push(<pre>{expr_edited}</pre>);
        }
        return {"raw": finalLemRaw, "edited": finalLemEdited};       
    }



    updateLocalExprMap(newExprMap: {}){
        console.log("newExprMap", newExprMap);
        this.setState({localExprMap: newExprMap});
    }


    render() {
        const resJSX = this.renderFinalInvariant();
        /* console.log(this.props.PobLemmasMap); */
        return (

            <section className="star-modal-wrapper">
                <div className="star-modal-menu">
                    <button onClick={this.sortByHeader.bind(this)}>Order by header</button>
                    <button onClick={this.sortByLevel.bind(this)}>Order by level</button>
                    <button onClick={this.reset.bind(this)}>Reset</button>
                </div> 
                <div className="star-modal-content">
                    <div className="raw-inv">
                        {resJSX["raw"]}
                    </div>
                    <div className="edited-inv">
                        {resJSX["edited"]}
                    </div>

                    <div className="learned-ts">
                        <TransformerTable
                            exp_path={this.props.exp_path}
                            ExprMap ={this.state.localExprMap}
                            onUpdateLocalExprMap = {this.updateLocalExprMap.bind(this)}
                        />
                    </div>
                </div>
            </section>
        );
    }
}

