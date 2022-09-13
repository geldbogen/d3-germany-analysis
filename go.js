let global_data = null
let global_projection = null
let global_path = null
let rand_scale=5
let reds=["#fff5f0","#fee0d3","#fdc3ac","#fca082","#fb7c5c","#f5553d","#e23028","#c2181c","#9b0d14","#67000d"]
let global_sitelinks=[0,250]
let global_birthyear=[1000,1200]


function splitstring(e) {
    e.birthplace=e.birthplace.replace("Point(","")
    e.birthplace=e.birthplace.replace(")","")
    let index=e.birthplace.indexOf(" ")
    e.x_coordinate=e.birthplace.slice(0,index)
    e.y_coordinate=e.birthplace.slice(index+1)
    return [e.x_coordinate,e.y_coordinate]
}
function update(data) {
        
    
    d3.select("svg").select("#germany_map_labels").selectAll("circle")
    .data(data)
    .join(
        enter => enter.append("circle")
        .attr("cx", d=>global_projection(splitstring(d))[0]+rand_scale*Math.random())
        .attr("cy", d=>global_projection(splitstring(d))[1]+rand_scale*Math.random())
        .attr("r", "3")
        .attr("fill", d=>reds[Math.min(10,Math.round(d.sitelinks/15))])
        .attr("stroke", "black")
        .attr("stroke-width", "1")
        .on("mouseover", function(event,d) {
            console.log(d) // this is the data of the hovered element
            d3.select(this).attr("fill", "blue")
            let mystring=d.name+" <br/> "+d.birthyear+" <br/> "+d.sitelinks

            document.getElementById("overview").innerHTML=mystring
        }
    )
    .on("mouseout", function(event,d) {
        d3.select(this).attr("fill", d=>reds[Math.min(10,Math.round(d.sitelinks/15))])
    }
    ),
    update => update.attr("cx", d=>global_projection(splitstring(d))[0]+rand_scale*Math.random())
    .attr("cy", d=>global_projection(splitstring(d))[1]+rand_scale*Math.random())
    .attr("r", "3")
    .attr("fill", d=>reds[Math.min(10,Math.round(d.sitelinks/15))])
    .attr("stroke", "black")
    .attr("stroke-width", "1"),

    exit => exit.remove()

    )
}



d3.json("2_hoch.geo.json").then( function (data) {
    let projection = d3.geoMercator().translate([0, 7000]).scale(6000)
    global_projection = projection
    let path = d3.geoPath()
    .projection(projection)
    d3.select("svg").select("#germany_map").selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", d=>path(d))
    .style("stroke", "black")
})

d3.csv('query_all.csv').then( function(data) {
    global_data = data
    console.log(data)
    data=data.filter(function(d) {
        return (d.birthyear<=1200 && d.birthyear>=1000)
}
    )

    update(data)

    let from_slider=d3.sliderVertical().min(0).max(2000).step(1).height(800).default([1000,1200]).fill("red").on("onchange", function(value) {
        console.log(value)
        global_birthyear=value
        let mydata=global_data.filter(function(d) {
            return ((d.birthyear>=value[0] && d.birthyear<=value[1]) && (d.sitelinks>= global_sitelinks[0] && d.sitelinks<=global_sitelinks[1]))
        })
        update(mydata)

    })
    d3.select("#from_slider").call(from_slider)
    let to_slider=d3.sliderVertical().min(0).max(250).step(1).height(800).default([0,250]).fill("red").on("onchange", function(value) {
        console.log(value)
        global_sitelinks=value
        let mydata=global_data.filter(function(d) {
            return ((d.sitelinks>=value[0] && d.sitelinks<=value[1])&& (d.birthyear>=global_birthyear[0] && d.birthyear<=global_birthyear[1]))
        })
        update(mydata)

    })
    d3.select("#to_slider").call(to_slider)

}
)