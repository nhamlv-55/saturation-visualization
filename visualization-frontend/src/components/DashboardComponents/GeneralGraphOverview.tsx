// @ts-nocheck
import * as React from 'react';
import * as d3 from 'd3';
import {potholeToNormal} from "../../helpers/naming";
import {dashboardConfig, depthItem, memoryItem, timeItem} from "../dashboardTypes";

type Props = {
    key: number,
    data: (depthItem | memoryItem | timeItem) [],
    config: dashboardConfig,
    className: string,
    classText: string,
    yValue: string,
    updateZoomView: (type:string) => void
}

type State = {}

class GeneralGraphOverview extends React.Component<Props, State> {
    componentDidMount() {
        this.createGraph();
    }
    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        this.createGraph();
    }
    
    createGraph() {
        d3.select("." + this.props.className + " svg").remove();
        
        if (this.props.data.length === 0) return;
        let data = this.props.data;
        let xValue = function(d) {
            return d.index;
        };
        let index = d3.map(data,function(d) {return d.index;}).keys();
        let xScale = d3.scaleBand()
            .domain(index)
            .range([this.props.config.margin.left, this.props.config.width - this.props.config.margin.right]);
        let xMap = function(d) {
            return xScale(xValue(d))
        };
        let xAxis = d3.axisBottom(xScale).tickValues([]);

        let yValue = function(this,d) {
            return d[this.props.yValue];
        }.bind(this);
        let yScale = d3.scaleLinear()
            .domain([d3.min(data, yValue), d3.max(data, yValue)])
            .range([this.props.config.graphHeight - this.props.config.margin.top, this.props.config.margin.bottom]);
        let yMap = function(d) {
            return yScale(yValue(d))
        };
        let yAxis = d3.axisLeft(yScale);

        let svg = d3.select("." + this.props.className)
            .append("svg")
            .attr("width", this.props.config.width)
            .attr("height", this.props.config.height)
            .on ("click", this.props.updateZoomView);
        svg.append("text")
            .attr("x", this.props.config.width / 2)
            .attr("y", this.props.config.margin.top)
            .attr("text-anchor", "middle")
            .style("font-size", this.props.config.font.title)
            .style("text-decoration", "underline")
            .text("Index x " + potholeToNormal(this.props.yValue));
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (this.props.config.graphHeight - this.props.config.margin.top) + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + this.props.config.margin.left + ",0)")
            .style("font-size", this.props.config.font.axis)
            .call(yAxis);
        let g = svg.append("g");
        
        g.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", xMap)
            .attr("y", yMap)
            .attr("width", xScale.bandwidth() - 1)
            .attr("height", function(this,d) {return (this.props.config.graphHeight - this.props.config.margin.top - yScale(d[this.props.yValue]))}.bind(this));

        g.selectAll("." + this.props.classText)
            .data(data)
            .enter()
            .append("text")
            .style("font-size", this.props.config.font.label)
            .attr("class", "label")
            .attr("x", function(d) {return xMap(d)})
            .attr("y", function(d) {return yMap(d) - 15})
            .attr("dy", ".75em")
            .text(function(this,d) {return d[this.props.yValue]}.bind(this));
    }
    render() {
        return (
            <div className={this.props.className}>
            </div>

        );
    }
}

export default GeneralGraphOverview;
