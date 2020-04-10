import * as React from 'react';
import * as d3 from 'd3';
import SunburstChart from "sunburst-chart";

class TimeChart extends React.Component<any, any> {
    private totalTime: string;
    private readonly palette: string[];
    constructor(props) {
        super(props);
        this.totalTime = "";
        this.palette = ["#023FA5", "#7D87B9", "#BEC1D4", "#D6BCC0", "#BB7784", "#8E063B", "#4A6FE3", "#8595E1", "#B5BBE3",
                "#E6AFB9", "#E07B91", "#D33F6A", "#11C638", "#8DD593", "#C6DEC7", "#EAD3C6", "#F0B98D", "#EF9708",
                "#0FCFC0", "#9CDED6", "#D5EAE7", "#F3E1EB", "#F6C4E1", "#F79CD4"]
    }
    componentDidMount() {
        this.createSunburst();
    }
    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        this.createSunburst();
    }

    prepareData() {
        let tmp:Object[] = [];
        let keys = Object.keys(this.props.data);
        
        for (let i = 0; i < keys.length; i++){
            tmp.push({
                name: keys[i], 
                value: this.props.data[keys[i]],
                children: []
            });
        }
        
        return tmp;
    }
    
    getData(input){
        let result = {};
        let last = "zzzzzzz";
        
        for (let i = 0; i < input.length; i++){
            let key = input[i].name;
            let value = input[i].value;
            
            if (key.includes(last)){
                result[last].children.push({
                    name: key,
                    value: value,
                    children: []
                });
            }
            else {
                result[key] = {
                    name: key,
                    value: value,
                    children: []
                };
                last = key
            }
        }
        
        let resultKeys = Object.keys(result);
        for (let i = 0; i < resultKeys.length; i++){
            if (result[resultKeys[i]].children){
                result[resultKeys[i]].children = this.getData(result[resultKeys[i]].children);
            }
        }
        
        return Object.values(result);
    }
    
    createSunburst() {
        if (!this.props.type) d3.select(".sunburst-viz").remove();
        if (this.props.type) d3.select("." + this.props.className + " .sunburst-viz").remove();
        let colour = d3.scaleOrdinal()
            .domain(Object.keys(this.props.data))
            .range(this.palette);
        let data = this.getData(this.prepareData());
        // @ts-ignore
        const myChart = SunburstChart();
        myChart.data(data[0])(document.getElementById(this.props.className))
            .width(this.props.width)
            .height(this.props.height)
            .color(x => colour(x.name))
            .label(x => x.name + ": " + x.value)
            .tooltipTitle(x => x.name + ": " + x.value);
        
        if (this.props.type){
            myChart.showLabels(false);
        }
    }


    render() {
        this.totalTime = this.props.data["time"];
        return (
          <div className={this.props.className} id={this.props.className}>
              {!this.props.type && <h2>Total Time: {this.totalTime}</h2>}
              {this.props.type && <p>{this.props.index}</p>}
              
          </div>  
        );
    }
}

export default TimeChart;