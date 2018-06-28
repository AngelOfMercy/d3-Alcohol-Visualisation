var margin = {top:10, right:20, bottom:30, left:50},
	width = 600 - margin.left - margin.right;
	height = 270 - margin.top - margin.bottom;

var svg = d3.select(".visualisation").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip")
    	.style("opacity",0);

var x0 = d3.scaleBand()
			.rangeRound([0, width])
			.paddingInner(0.5);

var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear().rangeRound([height, 0]);

var barContainer = svg.append('g');

var data = null;

function transformData(data){
	data.forEach(function(d){
		d.values.beer 		= +d.values.beer;
		d.values.rtd 		= +d.values.rtd; //Beer on licenced.
		d.values.whisky		= +d.values.whisky;
		d.values.wine 		= +d.values.wine;
		d.values.cider 		= +d.values.cider;
	});
	
}

d3.json('data.json', function(err, json){
		if (err) throw err;

		data = json.data;

		transformData(data);

		keys = Object.keys(data[0].values);

		x0.domain(keys);

		xAxis = svg.append('g')
				.attr('class', "x-axis")
				.attr('transform', 'translate(0,' + height + ')')
				//.transition()
				.call(d3.axisBottom(x0));

		updateGraph();
	});


function updateGraph(income=0){

	console.log(income);

	data[1].median = income;

	keys = Object.keys(data[0].values);
	classes = data.map(a=>a.class);

	var maxValue = d3.max(data.map((d) => Object.values(d.values)).reduce((a, b) => a.concat(b), []).map(x => x/((income>0 ? Math.min(income, data[0].median) : data[0].median)/60)));


	x0.domain(keys);
	x1.domain(classes).rangeRound([0, x0.bandwidth()]);

	y.domain([0, maxValue]).nice();

	var barsWithData = barContainer.selectAll('g').data(data);

	barsWithData.exit().remove();

	var bars = barsWithData.
		enter().append('g')
		.attr('transform', function(d){ return 'translate(' + x1(d.class) + ',0)'})
		.merge(barsWithData)
		.selectAll('rect')
		.data(function (d) {
			return Object.keys(d.values).map(k => 
    				({ 
    					key: k, 
    					value: (d.median > 0 ? d.values[k]/(d.median/60) : 0), 
    					class: d.class
    				}))
		});

	bars.exit().transition().style('opacity', 0).remove()



      //.attr('class', function(d){return d.class;})

    bars.enter()
      .append('rect')
      /**.attr('fill', function (d) {
        return z(d.key)
      })*/
      // start y at height (0) so animation in looks like bars are growing upwards
      .attr('y', height)
      .on('mouseover', function(d){
      	tooltipMouseOver(d)
      })
      .on("mousemove", tooltipMouseMove)
      .on('mouseout', tooltipMouseOut)
      .merge(bars)
      .transition()
      .attr('width', x1.bandwidth())
      .attr('x', function (d) { return x0(d.key) })
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .attr('class', function(d){return d.class;})
      
      

    //yAxis.exit();

    

	yAxis = svg.select('g')
				.attr('class', 'y-axis')
				.transition()
				.call(d3.axisLeft(y).tickSizeInner(-width).ticks(5).tickSizeOuter(5));
	svg.selectAll(".tick")
    .filter(function (d) { return d === 0;  })
    .remove();
}

/** TOOL TIP */

function tooltipMouseOver(d){

	seconds = 60*(d.value - Math.floor(d.value))

	time = d3.format(".0f")(d.value) + ":" + d3.format(".0f")(seconds) 

	tooltip.transition()
                .duration(200)
                .style("opacity", .95)
                .attr("id", d.class);
    tooltip.html("<strong class='tooltip-title'>One standard every:</strong></br> " + time + ' min')
                
}

function tooltipMouseOut(){
	tooltip.transition()    
                .duration(500)    
                .style("opacity", 0); 
}

function tooltipMouseMove(){
	console.log($('.tooltip').css('padding-bottom'))
	
	tooltip.style("left", (d3.event.pageX -$('.tooltip').outerWidth()) + "px")
                .style("top", (d3.event.pageY - $('.tooltip').outerHeight()) + "px");
}