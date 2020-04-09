import * as React from 'react';
import './../styles/Dashboard.css';
import * as d3 from 'd3';
import IndividualBenchmark from "./DashboardComponents/IndividualBenchmark";
import ResultsOverview from "./DashboardComponents/ResultsOverview";
import arrow from './../resources/icons/singles/angle-arrow-down.svg'
import TimeZoom from "./DashboardComponents/TimeZoom";
import BarGraphOverview from "./DashboardComponents/BarGraphOverview";

class Dashboard extends React.Component<any, any> {
    private readonly overviewMetrics: string[];
    constructor(props: any) {
        super(props);
        this.overviewMetrics = ["depth", "memory", "time", "result"];
            this.state = {
            data: "",
            selectedBenchmark: "",
            graphMin: 0,
            graphMax: 30,
            customMode: false,
            customData: {
                depth: [],
                result: [],
                memory: [],
                time: []
            },
            zoomMode: "",
            dashboardConfig: {
                height: 450,
                width: 1500,
                graphHeight: 400,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 60
                },
                font: {
                    title: "20px",
                    axis: "20px",
                    label: "14px"
                },
                barNum: 10
            }
        };
    }
    componentDidMount() {
        this.loadData();
        document.addEventListener("keydown", this.handleGraphTranslation.bind(this));
    }

    loadData() {
        let file = require("./../resources/files/benchmark-summary.csv");
        d3.csv(file, function (d) {
            d.SPACER_cluster_out_of_gas = +d.SPACER_cluster_out_of_gas;
            d.SPACER_expand_pob_undef = +d.SPACER_expand_pob_undef;
            d.SPACER_inductive_level = +d.SPACER_inductive_level;
            d.SPACER_max_cluster_size = +d.SPACER_max_cluster_size;
            d.SPACER_max_cvx_reduced_dim = +d.SPACER_max_cvx_reduced_dim;
            d.depth = +d.depth;
            d.SPACER_max_query_lvl = +d.SPACER_max_query_lvl;
            d.SPACER_need_sage = +d.SPACER_need_sage;
            d.SPACER_num_abstractions = +d.SPACER_num_abstractions;
            d.SPACER_num_abstractions_failed = +d.SPACER_num_abstractions_failed;
            d.SPACER_num_abstractions_success = +d.SPACER_num_abstractions_success;
            d.SPACER_num_active_lemmas = +d.SPACER_num_active_lemmas;
            d.SPACER_num_cant_abstract = +d.SPACER_num_cant_abstract;
            d.SPACER_num_ctp_blocked = +d.SPACER_num_ctp_blocked;
            d.SPACER_num_dim_reduction_success = +d.SPACER_num_dim_reduction_success;
            d.SPACER_num_invariants = +d.SPACER_num_invariants;
            d.SPACER_num_is_invariant = +d.SPACER_num_is_invariant;
            d.SPACER_num_lemma_jumped = +d.SPACER_num_lemma_jumped;
            d.SPACER_num_lemmas = +d.SPACER_num_lemmas;
            d.SPACER_num_mbp_failed = +d.SPACER_num_mbp_failed;
            d.SPACER_num_merge_gen = +d.SPACER_num_merge_gen;
            d.SPACER_num_merge_gen_failed = +d.SPACER_num_merge_gen_failed;
            d.SPACER_num_merge_gen_success = +d.SPACER_num_merge_gen_success;
            d.SPACER_num_no_over_approximate = +d.SPACER_num_no_over_approximate;
            d.SPACER_num_non_lin = +d.SPACER_num_non_lin;
            d.SPACER_num_pobs = +d.SPACER_num_pobs;
            d.SPACER_num_propagations = +d.SPACER_num_propagations;
            d.SPACER_num_queries = +d.SPACER_num_queries;
            d.SPACER_num_reach_queries = +d.SPACER_num_reach_queries;
            d.SPACER_num_refinements = +d.SPACER_num_refinements;
            d.SPACER_num_reuse_reach_facts = +d.SPACER_num_reuse_reach_facts;
            d.SPACER_num_sync_cvx_cls = +d.SPACER_num_sync_cvx_cls;
            d.SPACER_num_under_approximations = +d.SPACER_num_under_approximations;
            d.SPACER_pob_out_of_gas = +d.SPACER_pob_out_of_gas;
            d.SPACER_wide_attmpts = +d.SPACER_wide_attmpts;
            d.SPACER_wide_success = +d.SPACER_wide_success;
            d.max_memory = +d.max_memory;
            d.memory = +d.memory;
            d.time = +d.time;
            d.time_iuc_solver_get_iuc = +d.time_iuc_solver_get_iuc;
            d.time_iuc_solver_get_iuc_hyp_reduce1 = +d.time_iuc_solver_get_iuc_hyp_reduce1;
            d.time_iuc_solver_get_iuc_hyp_reduce2 = +d.time_iuc_solver_get_iuc_hyp_reduce2;
            d.time_iuc_solver_get_iuc_learn_core = +d.time_iuc_solver_get_iuc_learn_core;
            d.time_pool_solver_proof = +d.time_pool_solver_proof;
            d.time_pool_solver_smt_total = +d.time_pool_solver_smt_total;
            d.time_pool_solver_smt_total_sat = +d.time_pool_solver_smt_total_sat;
            d.time_pool_solver_smt_total_undef = +d.time_pool_solver_smt_total_undef;
            d.time_spacer_ctp = +d.time_spacer_ctp;
            d.time_spacer_init_rules = +d.time_spacer_init_rules;
            d.time_spacer_init_rules_pt_init = +d.time_spacer_init_rules_pt_init;
            d.time_spacer_mbp = +d.time_spacer_mbp;
            d.time_spacer_solve = +d.time_spacer_solve;
            d.time_spacer_solve_propagate = +d.time_spacer_solve_propagate;
            d.time_spacer_solve_pt_must_reachable = +d.time_spacer_solve_pt_must_reachable;
            d.time_spacer_solve_reach = +d.time_spacer_solve_reach;
            d.time_spacer_solve_reach_children = +d.time_spacer_solve_reach_children;
            d.time_spacer_solve_reach_cluster = +d.time_spacer_solve_reach_cluster;
            d.time_spacer_solve_reach_gen_bool_ind = +d.time_spacer_solve_reach_gen_bool_ind;
            d.time_spacer_solve_reach_gen_merge = +d.time_spacer_solve_reach_gen_merge;
            d.time_spacer_solve_reach_gen_merge_cvx_cls = +d.time_spacer_solve_reach_gen_merge_cvx_cls;
            d.time_spacer_solve_reach_gen_wide = +d.time_spacer_solve_reach_gen_wide;
            d.time_spacer_solve_reach_is_reach = +d.time_spacer_solve_reach_is_reach;
            return d;
        }).then(function(this, data)
        {
            this.setState({
                data: data
            });
        }.bind(this));
    }
    
    handleSidebarClick(origin, e) {
        if (origin === "sidebar"){
            this.setState({
                selectedBenchmark: e.target.innerText
            });
        }
        else if (origin === "dot"){
            this.setState({
                selectedBenchmark: e.index
            });
        }
        
    }
    
    handleHomeClick() {
        this.setState({
            selectedBenchmark: "",
            customMode: false,
            customData: {
                depth: [],
                time: [],
                memory: [],
                result: []
            },
            zoomMode: "", 
            graphMin: 0,
            graphMax: 30
        });
    }
    
    handleClearClick() {
        this.setState({
            customData: {
                depth: [],
                time: [],
                memory: [],
                result: []
            }
        });
    }
    
    handleGraphTranslation(e) {
        if (e.target.alt === "left-arrow" || e.keyCode === 37){
            if (this.state.graphMin > 0){
                this.setState({
                    graphMin: this.state.graphMin - 1,
                    graphMax: this.state.graphMax - 1
                });
            }
        }
        else if (e.target.alt === "right-arrow" || e.keyCode === 39) {
            if (this.state.graphMax < this.state.data.length - 1 ){
                this.setState({
                    graphMin: this.state.graphMin + 1,
                    graphMax: this.state.graphMax + 1
                });
            }
        }
        else if (e.keyCode === 40) {
            if (this.state.graphMax + 10 < this.state.data.length){
                this.setState({
                    graphMin: this.state.graphMin + 10,
                    graphMax: this.state.graphMax + 10
                });
            }
        }
        else if (e.keyCode === 38) {
            if (this.state.graphMin - 10 >= 0 ){
                this.setState({
                    graphMin: this.state.graphMin - 10,
                    graphMax: this.state.graphMax - 10
                });
            }
        }
        
    }
    
    handleCustomClick() {
        this.setState({
            customMode: !this.state.customMode
        });
        if (this.state.customMode === true){
            this.setState({
                customData: {
                    depth: [],
                    time: [],
                    memory: [],
                    result: []
                }
            });
        }
    }

    filterDictionary(keys, custom=false, index=""){
        let data = this.state.data.slice(this.state.graphMin, this.state.graphMax);
        if (custom) {
            data = this.state.data.filter(function(d) {return d.index === index})
        }
        let result:Object[] = [];
        for (let i = 0; i < data.length; i++){
            result.push({});
            for (let j = 0; j < keys.length; j ++){
                result[i][keys[j]] = data[i][keys[j]];
            }
        }
        return result;
    }
    
    addToCustomData(e) {
        for (let i = 0; i < this.overviewMetrics.length; i++){
            let metric = this.overviewMetrics[i];
            let metricDataKeys = [metric].concat(["index"]);
            if (metric === "result") {
                metricDataKeys.push("SPACER_num_invariants");
            }
            let totalData = this.state.customData[metric].concat(this.filterDictionary(metricDataKeys, true, e.target.innerHTML));
            
            if (totalData.length > (this.state.graphMax - this.state.graphMin)){
                totalData.splice(0,1);
            }
            let customDataCopy = this.state.customData;
            customDataCopy[metric] = totalData;
            this.setState({
                customData: customDataCopy
            });
        }
    }
    
    setZoomView(type: string) {
        this.setState({
            zoomMode: type, 
            graphMin: 0,
            graphMax: 21
        });
    }
    
    render() {
        let benchmarks = d3.map(this.state.data, function(d) {return d.index;}).keys();
        let selectedBenchmark = this.state.selectedBenchmark;
        let timeZoomData;
        if (this.state.zoomMode === "time") {
            let timeKeys = Object.keys(this.state.data[0]).filter(x => x.includes("time"));
            timeKeys.push("index");
            timeZoomData = this.filterDictionary(timeKeys);
        }
        return (
          <div className="page">
              {!this.state.customMode && 
                  <div className="sidebar" id="sidebar">
                  {benchmarks.map((name, key ) => {
                      if (key >= this.state.graphMin && key < this.state.graphMax){
                          return (<li className="selected" key={key} onClick={this.handleSidebarClick.bind(this, "sidebar")}>{name}</li>);
                      }
                      return (<li key={key} onClick={this.handleSidebarClick.bind(this, "sidebar")}>{name}</li>);
                  })}
              </div>}
              {this.state.customMode &&
              <div className="sidebar" id="sidebar">
                  {benchmarks.map((name, key ) => {
                      if (this.state.customData.depth.filter(d => d.index === name).length > 0){
                          return (<li className="selected" key={key} onClick={this.addToCustomData.bind(this)}>{name}</li>);
                      }
                      return (<li key={key} onClick={this.addToCustomData.bind(this)}>{name}</li>);
                  })}
              </div>}
              <div className="visual">
                  {this.state.selectedBenchmark !== "" &&
                  <IndividualBenchmark 
                      data={this.state.data.filter(function(d) {return d.index === selectedBenchmark})[0]}
                  />}
                  {this.state.selectedBenchmark === "" && this.state.zoomMode === "" &&
                  <div className="dashboard">
                      {this.overviewMetrics.map((type, key) => {
                          let data;
                          if (this.state.customMode) {
                              data = this.state.customData[type];
                              if (type === "result"){
                                  return (
                                      <ResultsOverview
                                          key={key}
                                          data={data}
                                          config={this.state.dashboardConfig}
                                          selectBenchmark={this.handleSidebarClick.bind(this, "dot")}
                                      />
                                  );
                                  
                              }
                          }
                          else if (type === "result"){
                              data = this.filterDictionary([type].concat(["index", "SPACER_num_invariants"]));
                              return (
                                  <ResultsOverview
                                      key={key}
                                      data={data}
                                      config={this.state.dashboardConfig}
                                      selectBenchmark={this.handleSidebarClick.bind(this, "dot")}
                                  />
                              );
                          }
                          else {
                              data = this.filterDictionary(["index"].concat([type]));
                          }
                          return (
                              <BarGraphOverview
                                  key={key}
                                  data={data}
                                  config={this.state.dashboardConfig}
                                  className={type + "-overview"}
                                  classText={type + "-text"}
                                  yValue={type}
                              />
                          );
                      })}
                      <img className="left-arrow" src={arrow} alt="left-arrow" onClick={this.handleGraphTranslation.bind(this)}/>
                      <img className="right-arrow" src={arrow} alt="right-arrow" onClick={this.handleGraphTranslation.bind(this)}/>
                  </div>}
                  {this.state.zoomMode === "time" &&
                  <TimeZoom
                      data={timeZoomData}
                      
                  />}
              </div>
              
              <button className="home-button" onClick={this.handleHomeClick.bind(this)}>Home</button>
              <button className="custom-button" onClick={this.handleCustomClick.bind(this)}>Custom</button>
              {this.state.customMode && <button className="clear-button" onClick={this.handleClearClick.bind(this)}>Clear</button>}
          </div>  
        );
    }
}

export default Dashboard;
