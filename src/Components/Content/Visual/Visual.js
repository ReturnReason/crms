import React,{Component} from 'react';
import {connect} from 'react-redux';
import * as d3 from 'd3';
import './Visual.scss'

const test={
    name:"CLOUD",
    type:"cloud",
    parent:"",
    link:[],
    children:[
        {
            name:"vpc_test",
            type:"VPC",
            parent:"CLOUD",
            link:[],
            children:[
                {
                    name:"test_sub",
                    type:"Subnet",
                    parent:"vpc_test",
                    link:[],
                    children:[
                        {
                            name:"ec2_1",
                            type:"EC2",
                            parent:"test_sub",
                            children:"",
                            link:["ec2_2","sg"]
                        },
                        {
                            name:"ec2_2",
                            type:"EC2",
                            parent:"test_sub",
                            children:"",
                            link:["ec2_1","sg"]
                        },
                        {
                            name:"sg",
                            type:"SecurityGroup",
                            parent:"test_sub",
                            children:"",
                            link:["ec2_1","ec2_2"]
                        }
                    ]
                },
                {
                    name:"sn1",
                    type:"Subnet",
                    parent:"vpc_test",
                    children:"",
                    link:[]
                }
            ]
        }
    ]
};

const logstate={
    name:"AWS",
    type:"CLOUD",
    region:"",
    platform:"",
    instype:"",
    size:"",
    parent:"",
    link:[],
    children:[] 
}

class Visual extends Component{

    drawChart() {
      var width = parseInt(window.getComputedStyle(document.querySelector("#root > div > main > div.Content > svg")).width),
          height = parseInt(window.getComputedStyle(document.querySelector("#root > div > main > div.Content > svg")).height)-200;

      //initialising hierarchical data
      var root = d3.hierarchy(test);
      
      var i = 0;
      
      var transform = d3.zoomIdentity;
      
      var nodeSvg, linkSvg, simulation, nodeEnter, linkEnter;
      
      var svg = d3.select("svg")
        .call(d3.zoom().scaleExtent([1 / 2, 8]).on("zoom", zoomed))
        .style("background-color","#27262b")
        .on("dblclick.zoom",null)
        .on("contextmenu",function(d,i){
            d3.event.preventDefault();
        })
        .append("g")
        .attr("transform", "translate(40,0)")
    
        svg.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .style("stroke","#ffc14d")
            .style("fill","#ffc14d")
            .attr("viewBox", "0 -5 10 10")
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
      
      function zoomed() {
        svg.attr("transform", d3.event.transform);
      }
      
      simulation = d3.forceSimulation()
        .force("link", d3.forceLink(linkSvg).distance(200))
        .force("charge", d3.forceManyBody().strength(-1500))
        .force("center", d3.forceCenter(width / 2, height / 2+100))
        .force("colide",d3.forceCollide().radius(d=>d.r*500))
        .on("tick", ticked);
      
      update();
      
      function update() {
        var nodes = flatten(root);
        var links = root.links();

        for(var i=0;i<nodes.length;i++){
            if(nodes[i].data.link.length>0){
                for(var j=0;j<nodes[i].data.link.length;j++){
                    for(var h=0;h<nodes.length;h++){
                        if(nodes[i].data.link[j]==nodes[h].id){
                            links.push({source:i,target:h})
                        }
                    }
                }
            }
        }

        linkSvg = svg.selectAll(".link")
            .data(links, function(d) {
            console.log(d.target.id)
            return d.target.id;
          })
        
        console.log(linkSvg)
      
        linkSvg.exit().remove();
      
        var linkEnter = linkSvg.enter()
          .append("line")
          .attr("class", "link")
          .style("stroke","#ffc14d")
          .attr("marker-end", "url(#end)");
      
        linkSvg = linkEnter.merge(linkSvg)
      
        nodeSvg = svg.selectAll(".node")
          .data(nodes, function(d) {
            return d.id;
          })
      
        nodeSvg.exit().remove();
      
        var nodeEnter = nodeSvg.enter()
          .append("g")
          .attr("class", "node")
          .on("mouseover", function(d) {
                var thisNode = d.id
                var thislink=d
                d3.selectAll(".link").attr("opacity", function(d) {
                    return (d.source.id == thisNode || d.target.id == thisNode) ? 1 : 0.2
                });
                d3.selectAll(".node").attr("opacity", function(d) {
                    if(d.data.link.length>0){
                        for(var i=0;i<d.data.link.length;i++){
                            if(d.data.link[i]==thislink.data.name)
                            return "1";
                        }
                    }
                    if(d.data.name==thislink.data.parent||d.id==thisNode||d.data.parent==thislink.data.name)
                        return "1";
                    else
                        return "0.2";
                });
                    
            })
          .on("mouseout", function(d) {
                d3.selectAll(".link").attr("opacity","1");
                d3.selectAll(".node").attr("opacity","1");
          })
          .on("contextmenu",function(d){
              d3.event.preventDefault();
              viewset(d);
          })
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

        nodeEnter.append("circle")
        .attr("stroke","#ffc14d")
        .attr("stroke-width","3")
        .attr("fill","none")
        .attr("r",50)

        nodeEnter.append("svg:image")
        .attr("xlink:href",function(d){
            if(d.data.type=="EC2")
                return "./../../../images/compute.svg";
            if(d.data.type=="SecurityGroup")
                return "./../../../images/security_group.svg";
            if(d.data.type=="Subnet")
                return "./../../../images/ec2-container-registry.svg";
            if(d.data.type=="VPC")
                return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/AWS_Simple_Icons_Virtual_Private_Cloud.svg/640px-AWS_Simple_Icons_Virtual_Private_Cloud.svg.png";
            if(d.data.type=="cloud")
                return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/AWS_Simple_Icons_AWS_Cloud.svg/1200px-AWS_Simple_Icons_AWS_Cloud.svg.png";
        })
        .attr("x", function(d) { return -30;})
        .attr("y", function(d) { return -35;})
        .attr("height", 60)
        .attr("width", 60)
        .on("click", click);
      
        nodeEnter.append("text")
          .attr("dy", 33)
          .style("fill","#ffc14d")
          .style("font-family","NanumSquare")
          .style("font-weight","bold")
          .style("font-size","14px")
          .style("text-anchor","middle")
          .text(function(d) { 
            return d.data.name;
          });
      
        nodeSvg = nodeEnter.merge(nodeSvg);

        var addresshow = d3.select(".add_res");
        var resnoshow = addresshow.select("#cancel");
        resnoshow.on("click",function(){
          addresshow.style("display","none");
        })
      
        simulation
          .nodes(nodes)
      
        simulation.force("link")
          .links(links);
      
      }
      
      function ticked() {
        
        linkSvg
          .attr("x1", function(d) {
            var angle=Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
            var length=60*Math.cos(angle);
            return d.source.x+length;
          })
          .attr("y1", function(d) {
            var angle=Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
            var length=60*Math.sin(angle);
            return d.source.y+length;
          })
          .attr("x2", function(d) {
            var angle=Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
            var length=70*Math.cos(angle);
            return d.target.x-length;
          })
          .attr("y2", function(d) {
            var angle=Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
            var length=70*Math.sin(angle);
            return d.target.y-length;
          });
      
        nodeSvg
          .attr("transform", function(d) {
            return "translate(" + d.x + ", " + d.y + ")";
          });
      }
      
      function click(d) {

        if (d.children) {
          d._children = d.children;
          d.children = null;
          update();
          simulation.restart();
        } else {
          d.children = d._children;
          d._children = null;
          update();
          simulation.restart();
        }
      }

      function viewset(d){
        var log=d3.select(".ResourceData");
        log.style('display','block');
        var cancel=log.select("#cancel")
        var resid=log.select("#id")
        var restype=log.select("#type")
        var resreg=log.select("#region")
        var resplatform=log.select("#platform")
        var resparent = log.select("#parent")
        var reslink=log.select("#link")
        var resapply=log.select("#apply")
        var reslog=log.select("#log")
        resid.attr("value",d.id)
        restype.selectAll("option").remove()
        var tyopt=restype.append("option")
        tyopt.text(d.data.type)
        reslink.attr("value",function(){
          var tmp="";
          for(var i=0;i<d.data.link.length;i++)
            tmp+=d.data.link[i]+",";
          tmp=tmp.substring(0,tmp.length-1);
          return tmp;
        })
        resapply.on("click",function(){
          log.style('display','none');
        });
        cancel.on("click",function() {
          log.style('display','none');
        })
      }
      
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        simulation.fix(d);
      }
      
      function dragged(d) {
        simulation.fix(d, d3.event.x, d3.event.y);
      }
      
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        simulation.unfix(d);
      }
      
      function flatten(root) {
        // hierarchical data to flat data for force layout
        var nodes = [];
      
        function recurse(node) {
          if (node.children) node.children.forEach(recurse);
          if (!node.id) node.id = node.data.name;
          else ++i;
          nodes.push(node);
        }
        recurse(root);
        return nodes;
      }
      
    }

    componentDidMount(){
        this.drawChart();
    }

    render(){
        return(
          <>
              <svg className="Visual">              
              </svg>
              <div className="add_res">
                <button id="cancel">
                    X
                  </button>
                  <p>
                    ID : 
                  <input className="visual-input" id="id"></input>
                  </p>
                  <p>
                    TYPE:
                    <input className="visual-input" id="type"value={this.props.value}></input>
                  </p>
                  <p>
                    Region:
                    <select className="visual-select" id="region">
                    </select>
                  </p>
                  <p>
                    Platform:
                    <select className="visual-select" id="platform">
                    </select>
                  </p>
                  <p>
                    Size:
                    <select className="visual-select" id="size">
                    </select>
                  </p>
                  <p>
                    Parent:
                    <select className="visual-select" id="parent">
                    </select>
                  </p>
                  <p>
                    Link:
                    <input className="visual-input" id="link"></input>
                  </p>
                  <button id="apply">Apply</button>
                <br/>
              </div>

                <div className="ResourceData">
                  <h2 className>ResourceData</h2>
                  <p className="resource-data__title">
                    ID
                    <input className="visual-input" id="id"></input>
                  </p>
                  <p className="resource-data__title">
                    TYPE
                    <select className="visual-select" id="type">
                    </select>
                  </p>
                  <p className="resource-data__title">
                    Region
                    <select className="visual-select" id="region">
                    </select>
                  </p>
                  <p className="resource-data__title">
                    Platform
                    <select className="visual-select" id="platform">
                    </select>
                  </p>
                  <p className="resource-data__title">
                    Size
                    <select className="visual-select" id="size">
                    </select>
                  </p>
                  <p className="resource-data__title">
                    Parent
                    <select className="visual-select" id="parent">
                    </select>
                  </p>
                  <p className="resource-data__title">
                    Link
                    <input className="visual-input" id="link"></input>
                  </p>
                  <button id="apply">APPLY</button>
                  <button id="cancel">CLOSE</button>
                  <br/>
                </div> 
    
          </>
        );
    }
}

let mapStateToProps=(state)=>{
  if(state.show.restype!=""){
      document.querySelector(".add_res").style.display="block";
    }
    return{
      value:state.show.restype
  }
}

Visual=connect(mapStateToProps)(Visual);

export default Visual;