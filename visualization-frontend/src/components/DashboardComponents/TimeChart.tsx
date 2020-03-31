import * as React from 'react';
import * as d3 from 'd3';
import {potholeToNormal} from "../../helpers/naming";

class TimeChart extends React.Component<any, any> {
    private config: { width: number; palette: string[]; radius: number; height: number };
    private totalTime: string;
    
    constructor(props) {
        super(props);
        this.totalTime = "";
        this.config = {
            height: 600,
            width: 600,
            radius: 0,
            palette: ["#023FA5", "#7D87B9", "#BEC1D4", "#D6BCC0", "#BB7784", "#8E063B", "#4A6FE3", "#8595E1", "#B5BBE3",
                "#E6AFB9", "#E07B91", "#D33F6A", "#11C638", "#8DD593", "#C6DEC7", "#EAD3C6", "#F0B98D", "#EF9708",
                "#0FCFC0", "#9CDED6", "#D5EAE7", "#F3E1EB", "#F6C4E1", "#F79CD4"]
        };
        this.config.radius = Math.min(this.config.width, this.config.height) / 2;
    }
    componentDidMount() {
        this.createTimeGraph();
        
    }
    
    createTimeGraph() {
        let data = this.props.data;
        this.totalTime = data.time;
        delete data["time"];
        let svg = d3.select(".time")
            .append("svg")
            .attr("width", this.config.width)
            .attr("height", this.config.height);
        let colour = d3.scaleOrdinal(this.config.palette);
        
        let pie = d3.pie()
            .value(function(d) {return d.value;})
            .sort(null);
        
        let arc = d3.arc()
            .innerRadius(this.config.radius - 100)
            .outerRadius(this.config.radius - 20);
        
        
        let data_ready = pie(d3.entries(data));
        
        let text1,text2;

        svg.append("g")
            .attr("class", "chart")
            .selectAll('.arc')
            .data(data_ready)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .attr("fill", function(d,i) {return colour(i)})
            .on("mouseenter", function(d) {
                text1 = svg.append("text")
                    .attr("class", "tooltip")
                    .attr("text-anchor", "middle")
                    .attr("dy", "0em")
                    .text(potholeToNormal(d.data.key));
                
                text2 = svg.append("text")
                    .attr("class", "tooltip")
                    .attr("text-anchor", "middle")
                    .attr("dy", "2em")
                    .text(d.value + "s")
            })
            .on("mouseout", function(d) {
                text1.remove();
                text2.remove();
            })
        
    }
    reloadGraph() {
        let data = this.props.data;
        this.totalTime = data.time;
        delete data["time"];
        let pie = d3.pie()
            .value(function(d) {return d.value;})
            .sort(null);
        let arc = d3.arc()
            .innerRadius(this.config.radius - 100)
            .outerRadius(this.config.radius - 20);
        let data_ready = pie(d3.entries(data));
        let path = d3.select(".chart")
            .selectAll("path")
            .data(data_ready);
        path.transition().duration(0).attr("d", arc);
        
    }
    render() {
        this.reloadGraph();
        return (
          <div className="time">
              <h1>Total Time: {this.totalTime}</h1>
              
          </div>  
        );
    }
}

export default TimeChart;