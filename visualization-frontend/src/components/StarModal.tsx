import * as React from 'react';
import '../styles/StarModal.css';

const _ = require("lodash");

type Props = {
    expName: string,
    PobLemmasMap: {},
    ExprMap: {},
}

type State = {
    input: string,
    output: string,
    finalLemmas: any[][]
}


export class StarModal extends React.Component<Props, State> {
    state: State = {
        input: "()",
        output: "",
        finalLemmas: this.getFinalInvariant()
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
        const lemma_header = this.props.ExprMap[lemma_id].raw.split("\n")[0];
        return lemma_header;
    }

    reset(){
        this.setState({
            finalLemmas: this.getFinalInvariant()
        });
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
        let lemRows: JSX.Element[] = [];

        for (const lemma of this.state.finalLemmas){
            const lemma_id = lemma[0];
            if(lemma[2]!=="oo"){continue;}
            let expr_raw = '';
            let expr_edited = '';
            if(this.props.ExprMap[lemma_id]){
                expr_edited = this.props.ExprMap[lemma_id].editedReadable;
                expr_raw = this.props.ExprMap[lemma_id].raw;
            }
            lemRows.push(<tr>
                <td>
                    <h4 key={"lemma-header-edited-"+ lemma_id}>ExprID: {lemma[0]}, From: {lemma[1]} to {lemma[2]}</h4>
                </td>
                <td>
                </td>
            </tr>)
            lemRows.push(<tr>
                <td><pre>{expr_raw}</pre></td>
                <td><pre>{expr_edited}</pre></td>
            </tr>)
        }

        return <table>{lemRows}</table>;
    }




    render() {
        console.log(this.props.ExprMap);
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
                    <div className="lemma-table">
                        {resJSX}
                    </div>

                </div>
            </section>
        );
    }
}

