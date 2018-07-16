var margin = {top: 20, right: 140, bottom: 80, left: 80},
    width = $('.visualisation').width() - margin.left - margin.right,
    height = $('.content').height()/2 - margin.top - margin.bottom


var svg = d3.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom),
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1)
    .align(0.1);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
      .range(["#84BD00", "#63B22C", "#42A859", "#219D85", "#0093B2"]);



// Define the div for the tooltip
var tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);


var t = d3.transition()
            .duration(500)
            .ease(d3.easeQuad);

svg.append("text")             
      .attr("transform",
            "translate(" + (width/2 + margin.left) + " ," + 
                           (height + margin.top + 50) + ")")
      .style("text-anchor", "middle")
      .text("Feeling Isolated?");

svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 + margin.left/4)
      .attr("x",0 - height/2 - margin.top)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Portion of Population (%)"); 

//Create the initial graph.
d3.csv("data/anxiety.csv", function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  console.log(columns);
  console.log(d);
  return d;
}, function(error, data) {
  if (error) throw error;

  //data.sort(function(a, b) { return b.total - a.total; });
  x.domain(data.map(function(d) { return d.Anxiety; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);

  //X Axis
  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  //Y Axis
  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000");

  updateGraph('Anxiety');
  
});


function updateGraph(dataset){
  console.log(dataset);

  
  //bars.exit().transition(500).attr("height", 0).remove();

  d3.select(".dropbtn").text(dataset);

  d3.csv("data/" + dataset.toLowerCase() + ".csv", function(d, i, columns) {
        for (i = 1, t = 0; i < columns.length; ++i) {
          t += d[columns[i]] = +d[columns[i]];
        }
        d.total = t;
        return d;
      },
      function(error, data){
        if (error) throw error;

        var keys = data.columns.slice(1);

        z.domain(keys);

        loadLegend(data.columns.slice(1));

        console.log(keys);
        console.log(data);

        for (i = 0; i < 2; i++){
          for (key in keys){
            key = keys[key]
            data[i][key] = data[i][key]/data[i].total*100;
            console.log(data[i]);
          };
        };

        var bars = g.selectAll('rect.bars').remove();

        g.append("g")
          .selectAll("g")
          .data(d3.stack().keys(keys)(data))
          .enter().append("g")
            .attr("fill", function(d) { return z(d.key); })
          .selectAll("rect")
          .data(function(d) { return d; })
          
          .enter().append("rect")
            .attr("x", function(d) { return x(d.data[dataset]); })
            .attr("y", function(d) { 
              console.log(d);
              return y(d[1]); 
            })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("class", "bars")

            .on("mouseover", function(d){mouseover(d, d3.select(this));})
            .on("mousemove", function(d){mousefollow(d);})
            .on("mouseout", function(d) {mouseout(d, d3.select(this));});

        /**console.log(data);

        var bars = g.selectAll('rect.bars').data(data);

        console.log(bars);

        console.log(d3.stack().keys(keys)(data))

        bars.enter().append("rect")
              .attr("x", function(d) { 
                return x(d[dataset]); 
              })
              .attr("y", function(d) { 
                console.log(d); 
              })
              .attr("height", function(d) { return y(d[0]) - y(d[1]); })
              .attr("width", x.bandwidth())
              .attr("class", "bars")
            //.merge(bars)*/

        //bars.exit().remove();



  });


}

function loadLegend(keys){

  g.selectAll(".legend").remove();

  //Legend
  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(120," + i * 20 + ")"; })
      .attr("class", "legend");

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
}


function mouseover(d, highlight){
  tooltip.transition()
                .duration(200)
                .style("opacity", .9)
              tooltip.html(d3.format(".1%")((d[1]-d[0])/100))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");

  highlight.attr('class', 'highlight');
}


function mousefollow(d){
  tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
}

function mouseout(d, highlight){
  tooltip.transition()    
                .duration(500)    
                .style("opacity", 0); 
  highlight.attr('class', 'no-highlight');
}