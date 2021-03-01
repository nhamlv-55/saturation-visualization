// @ts-nocheck
import * as React from 'react';
import TimeChart from "./TimeChart";
import {potholeToNormal} from "../../helpers/naming";
import {dataItem} from "../dashboardTypes";

type Props = {
    data: dataItem
}

type State = {}

class IndividualBenchmark extends React.Component<Props, State> {
    componentDidMount() {
        console.log(this.props.data);
    }
    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        console.log(this.props.data);
    }

    filterTimeData() {
        return Object.keys(this.props.data)
            .filter(function(d) {return d.includes("time")})
            .reduce((obj, key) => {
                obj[key] = this.props.data[key];
                return obj;
            }, {});
    }
    render() {
        let dataDisplay = ["result","depth", "memory", "max_memory", "SPACER_num_invariants", "SPACER_num_lemmas",
            "SPACER_num_propagations", "SPACER_num_active_lemmas"];
        let timeData = this.filterTimeData();
        return (
          <div className="overview">
              <div className="details">
                  <h1>{this.props.data.index}</h1>
                  {dataDisplay.map((dataKey, key) => (
                      <p className="data-details" key={key}>{potholeToNormal(dataKey)}: {this.props.data[dataKey]}</p>
                  ))}
              </div>
              <TimeChart 
                  data={timeData}
                  height={600}
                  width={600}
                  className={"time"}
                  type={""}
                  index={""}
              />
          </div>  
        );
    }
}

export default IndividualBenchmark;
