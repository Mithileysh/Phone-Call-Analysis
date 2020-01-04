var format=d3.time.format("%Y%m%d");
var displayFormat=d3.time.format("%m/%d/%Y");
var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
var days=['Su','Mo','Tu','We','Th','Fr','Sa'];

function dashboard(id,data){
  
  var cD=d3.nest()
    .key(function(d){return d.DIDate;})
    .rollup(function(v){return d3.sum(v,function(d){return d.ACDCalls;});})
    .entries(data);
  
  var cDMax=d3.max(cD,function(d){return d.values});
  cD=d3.nest()
    .key(function(d){return d.DIDate;})
    .rollup(function(v){return d3.sum(v,function(d){return d.ACDCalls;});})
    .map(data);
  
  var pD=d3.nest()
    .key(function(d){return d.AgName;})
    .sortKeys(d3.ascending)
    .rollup(function(v){return d3.sum(v,function(d){return d.ACDCalls;});})
    .entries(data);

  var pieColor=d3.scale.category20();
  
  function calendar(cD){
    var cal={};
    var calDim={t:90, r:30, l:30, b:0};
    calDim.w=660-calDim.l-calDim.r;
    calDim.rDim=calDim.w/23;
    //calDim.h=(calDim.w/84)*5;//-calDim.t-calDim.b;
    calDim.h=calDim.rDim*34;
    
    var calColor=d3.scale.linear()
      .domain([0,cDMax/2,cDMax])
      .range(["#ffffe0","#fdbb84","#b30000"]);
    
    var dateRange=function(d){return d3.time.days(new Date(d,0,1), new Date(d+1,0,1));};

    var calSVG=d3.select(id).selectAll("svg")
      .data([2015])
      .enter().append("svg")
      .attr("width",calDim.w)
      .attr("height",calDim.h)
      .attr("class","calendar");
    
    var calYr=calSVG.append("g")
      .attr("class","yr")
      .append("text")
      .text(function(d){return d;})
      .attr("x",0)
      .attr("y",30)
      .attr("class","yrLbl")
      .on("click",YrClick);
    
    //console.log(calYr);
    
    var calDt=calSVG.selectAll(".dt")
      .data(dateRange)
      .enter().append("g")
      .attr("class","dt")
      .attr("transform","translate(0," + calDim.t +")")
      .on("click",DtClick);
    
    var dtRect=calDt.append("rect")
      .attr("width", calDim.rDim)
      .attr("height", calDim.rDim)
      .attr("x",function(d){return calDim.rDim*(((d.getMonth()%3)*8)+d.getDay());})
      .attr("y",function(d){return calDim.rDim*(((Math.floor(d.getMonth()/3)*8))+(d3.time.weekOfYear(d)-d3.time.weekOfYear(new Date(d.getYear(),d.getMonth(),1))));})
      .attr("class","dtRect");
    //console.log(JSON.stringify(cD));
    dtRect.filter(function(d){return format(d) in cD;})
      //.attr("fill",function(d){})
      .attr("fill",function(d){return calColor(cD[format(d)]);});
    
    var dtLbl=calDt.append("text")
      .text(function(d){return d.getDate();})
      .attr("class","dtLbl")
      .attr("x",function(d){return 4+calDim.rDim*(((d.getMonth()%3)*8)+d.getDay());})
      .attr("y",function(d){return (calDim.rDim)/2+calDim.rDim*(((Math.floor(d.getMonth()/3)*8))+(d3.time.weekOfYear(d)-d3.time.weekOfYear(new Date(d.getYear(),d.getMonth(),1))));})
      
    var month=calSVG.selectAll(".month")
      .data(months)
      .enter().append("g")
      .attr("class","month")
      .attr("transform","translate(0," + calDim.t +")");
    
    var moLbl=month.append("text")
      .text(function(d){return d.toUpperCase();})
      .attr("x",function(d,i){return calDim.rDim*(i%3)*8;})
      .attr("y",function(d,i){return ((Math.floor(i/3))*8*calDim.rDim)-15;})
      .attr("class","moLbl")
      .on("click",MoClick);
    
    var dayLbl=month.each(function(v,u){
      var m=this;
      days.forEach(function(day,i){
        d3.select(m)
          .append("text")
          .text(day)
          .attr("class","dayLbl")
          .attr("x",function(d){return (calDim.rDim*(u%3)*8)+calDim.rDim*i;})
          .attr("y",function(d){return ((Math.floor(u/3))*8*calDim.rDim)-2;});
      });
    });
    
    function DtClick(d){
      var uD=d3.nest()
        .key(function(d){return d.AgName;})
        .rollup(function(v){return d3.sum(v,function(d){return d.ACDCalls;});})
        .map(data.filter(function(v){return format(d)==v.DIDate;}));
      pieC.update(uD,displayFormat(d));
      //console.log(format(d));
      console.log(uD);
    };
    
    function MoClick(d,e){
      //console.log(d);
      var uD=d3.nest()
        .key(function(d){return d.AgName;})
        .rollup(function(v){return d3.sum(v,function(d){return d.ACDCalls;});})
        .map(data.filter(function(v,i){return (Number(v.DIDate.slice(4,6))-1)==e;}));
      pieC.update(uD,d);
      //console.log(format(d));
      console.log(uD);
    }
    
    function YrClick(d){
      var uD=d3.nest()
        .key(function(d){return d.AgName;})
        .rollup(function(v){return d3.sum(v,function(d){return d.ACDCalls;});})
        .map(data);
      pieC.update(uD,"2015");
    }
    
    return cal;
  };
  
  
  function pieChart(pD){
    var pieC={}
    var pieDim={w:250, h:350};
    pieDim.r=Math.min(pieDim.w,pieDim.h)/2;
    
    var pieSVG=d3.select(id).append("svg")
      .attr("width",pieDim.w)
      .attr("height",pieDim.h)
      .attr("class","pieChart")
      .append("g")
      .attr("transform","translate(" + pieDim.w/2 + "," + (pieDim.h/2+50) +")");
    
    var pLbl=d3.select(".pieChart")
      .append("text")
      .attr("y",15)
      .text("2015");
    
    var pTotal=d3.select(".pieChart")
      .append("text")
      .attr("y",40)
      .text("Total Calls: " + d3.sum(pD,function(d){return d.values;}));  
    
    var sValue=d3.select(".pieChart")
      .append("text")
      .attr("y",60);
    
    var pie=d3.layout.pie()
      .sort(null)
      .value(function(d){
        return d.values;
      });
    
    var arc=d3.svg.arc()
      .outerRadius(pieDim.r-10)
      .innerRadius(0);
    
    var pieS=pieSVG.selectAll("path")
      .data(pie(pD))
      .enter()
      .append('path')
      .attr('d',arc)
      .attr("class","pieS")
      .attr("fill",function(d,i){return pieColor(i);})
      .on("mouseover",ViewValue)
      .on("mouseout",Mouseout);
    
    pieS.filter(function(d,i){return i>19})
      .attr("fill",function(d,i){return ColorLuminance(pieColor(i),.25);});
      
    pieC.update=function(uD,lbl){
      var nD=pD.map(function(v){
        var o={};
        o.key=v.key;
        o.values=uD[v.key] || 0;
        return o;
      });
      pieS.data(pie(nD)).transition().duration(300).attrTween('d',arcTween);
      pieS.filter(function(d,i){return i>19})
        .attr("fill",function(d,i){return ColorLuminance(pieColor(i),.25);});
      pTotal.text("Total Calls: " + d3.sum(nD,function(d){return d.values;}));
      pLbl.text(lbl);
    };
    
    function ViewValue(d){
      sValue.text(d.data.key + ": " + d.data.values + " call(s)")
    }
    
    function Mouseout(){
      sValue.text("")
    }
    
    function arcTween(d) {
      var i = d3.interpolate(d.startAngle, d.endAngle);
      return function(t){
        d.endAngle=i(t);
        return arc(d);
      };
    };
    
    return pieC;
  };
  
  function legend(lD){
    var leg={}
    var legDim={w: 300, h: 30*Math.ceil(lD.length/2)};
    var itmDim={w: legDim.w/2, h: 30};
    
    var legSVG=d3.select(id)
      .append("svg")
      .attr("width",legDim.w)
      .attr("height",legDim.h)
      .attr("class","legend");
      //.attr("transform","translate(0," + 300 + ")");
      
    var lItm=legSVG.selectAll(".lItm")
      .data(lD)
      .enter().append("g")
      .attr("width", itmDim.w)
      .attr("height",itmDim.h)
      .attr("class","lItm");
    
    var lRect=lItm.append("rect")
      .attr("width",itmDim.w/4)
      .attr("height",itmDim.h-4)
      .attr("x",function(d,i){return (i%2)*itmDim.w;})
      .attr("y",function(d,i){return Math.floor(i/2)*itmDim.h;})
      .attr("fill",function(d,i){return pieColor(i);});
    
    lRect.filter(function(d,i){return i>19})
        .attr("fill",function(d,i){return ColorLuminance(pieColor(i),.25);});
    
    var lLbl=lItm.append("text")
      .attr("x",function(d,i){return ((i%2)*itmDim.w)+itmDim.w/4;})
      .attr("y",function(d,i){return (Math.floor(i/2)*itmDim.h)+itmDim.h/2;})
      .attr("class","lLbl")
      .text(function(d){return d.key;});
    
    return leg;
  };
 
  
  var cal=calendar(cD);
  var pieC=pieChart(pD);
  var leg=legend(pD);
};

dashboard("#dashboard",dataset);

function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}