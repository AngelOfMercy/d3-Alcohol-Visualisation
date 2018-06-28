
//GENERIC INTIALITATION
function initialiseDimensions(width, height){
	return {margin: {top:10, right:20, bottom:30, left:50},
		width: width - margin.left - margin.right,
		height: height - margin.top - margin.bottom}
	}



function initialCanvas(dim){

	return d3.select(".visualisation").append("svg")
	    .attr("width", dim.width + dim.margin.left + dim.margin.right)
	    .attr("height", dim.height + dim.margin.top + dim.margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + dim.margin.left + "," + dim.margin.top + ")");
}

//----------------------------------------------------------------------------------------------------------------------------
//TOOLTIP
//----------------------------------------------------------------------------------------------------------------------------

var tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip")
    	.style("opacity",0);

//Functionality
function tooltipMouseOver(d, title=""){
	seconds = 60*(d.value - Math.floor(d.value))
	time = d3.format(".0f")(d.value) + ":" + d3.format(".0f")(seconds) 
	tooltip.transition()
                .duration(200)
                .style("opacity", .95)
                .attr("id", d.class);
    tooltip.html("<strong class='tooltip-title'>"+title+"</strong></br> " + d.value + ' min')
                
}

function tooltipMouseOut(){
	tooltip.transition()    
                .duration(500)    
                .style("opacity", 0); 
}

//Bottom right corner anchored to Tooltip
function tooltipMouseMove(){
	console.log($('.tooltip').css('padding-bottom'))
	
	tooltip.style("left", (d3.event.pageX -$('.tooltip').outerWidth()) + "px")
                .style("top", (d3.event.pageY - $('.tooltip').outerHeight()) + "px");
}

//----------------------------------------------------------------------------------------------------------------------------
//DATA INITIALITAION
//----------------------------------------------------------------------------------------------------------------------------
function loadJSONData(data_target, validate, callback){
	var data;
	d3.json(data_target, function(err, json){
			if (err) throw err;
			data = json.data;
			validate(data);
		});
	}
	callback(data);
}
	

//Example validate function
function transformData(data){
	data.forEach(function(d){
		d.values.beer 		= +d.values.beer;
		d.values.rtd 		= +d.values.rtd; //Beer on licenced.
		d.values.whisky		= +d.values.whisky;
		d.values.wine 		= +d.values.wine;
		d.values.cider 		= +d.values.cider;
	});	
}
//----------------------------------------------------------------------------------------------------------------------------
//AXIS INITIALITAION
//----------------------------------------------------------------------------------------------------------------------------
function createLinearPadding(min=0, max, padding=0, nice=true){
	if(nice)
		return d3.scaleLinear().rangeRound([min, max]).paddingInner(padding).nice();
	else
		return d3.scaleLinear().rangeRound([min, max]).paddingInner(padding)
}


function drawX_Axis(svg, scale, dim){
	return svg.append('g')
				.attr('class', "x-axis")
				.attr('transform', 'translate(0,' + dim.height + ')')
				.transition()
				.call(d3.axisBottom(scale));
}

function drawY_Axis(svg, scale, dim){
	return svg.append('g')
				.attr('class', "y-axis")
				.attr('transform', 'translate(0,' + dim.height + ')')
				.transition()
				.call(d3.axisLeft(scale));
}

//----------------------------------------------------------------------------------------------------------------------------
//AXIS INITIALITAION
//----------------------------------------------------------------------------------------------------------------------------

