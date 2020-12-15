import * as React from 'react';
import '../styles/StarModal.css';
const icons = require('../resources/icons/all.svg') as string;

type Props = {
    PobLemmasMap: {},
    ExprMap: {},
}

type State = {
    input: string,
    output: string
}


export class StarModal extends React.Component<Props, State> {
    state: State = {
        input: "()",
        output: ""
    };

    getFinalInvariant() {
        let lemma_list_edited: JSX.Element[] = [];
        let lemma_list_raw: JSX.Element[] = [];
        let lemma_set = new Set();


        for(const pob in this.props.PobLemmasMap){
            console.log(pob);
            let lemmas = this.props.PobLemmasMap[pob];
            for(const lemma of lemmas){
                lemma_set.add(lemma);
            }
        }

        for (const lemma of lemma_set){
            console.log(lemma);
            /* let colorIndex = lemmas.indexOf(lemma);
             * let lemmaStyle = {
             *     color: lemmaColours[colorIndex]
             * }; */
            if(lemma instanceof Array){
                const lemma_id = lemma[0];
                if(lemma[2]!=="oo"){continue;}
                console.log(this.props.ExprMap[lemma_id]);
                let expr = this.props.ExprMap[lemma_id].edited;
                lemma_list_edited.push(<h4 key={"lemma-header-edited-"+ lemma_id}>ExprID: {lemma[0]}, From: {lemma[1]} to {lemma[2]}</h4>);
                lemma_list_edited.push(<pre>{this.props.ExprMap[lemma_id].edited}</pre>);

                lemma_list_raw.push(<h4 key={"lemma-header-"+ lemma_id}>ExprID: {lemma[0]}, From: {lemma[1]} to {lemma[2]}</h4>);
                lemma_list_raw.push(<pre>{this.props.ExprMap[lemma_id].raw}</pre>);
            }
        }
        return {"raw": lemma_list_raw, "edited": lemma_list_edited};
    }


    render() {
        const finalInv = this.getFinalInvariant();
        console.log(this.props.PobLemmasMap);
        return (
            <section className="star-modal-content">
                <div className="raw-inv">
                    {finalInv["raw"]}
                </div>
                <div className="edited-inv">
                    {finalInv["edited"]}
                </div>
            </section>
        );
    }
}

