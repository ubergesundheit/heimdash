var dateFormatOptions = { hour: "2-digit", minute: "2-digit" };
var DateFormatter = new Intl.DateTimeFormat('de-DE',dateFormatOptions);



[].slice.call(document.getElementsByClassName("cell")).forEach(function(elem) {
  var url = elem.getAttribute("dash-datasource");
  var temp_attr_name = elem.getAttribute("dash-temp-attributename");
    var time_attr_name = elem.getAttribute("dash-time-attributename");
  var width = elem.scrollWidth;
  
  nanoajax.ajax(url, function (code, responseText) {
    var data = JSON.parse(responseText);
    
    var tempValue = data.result[data.result.length -1][temp_attr_name].toFixed(1);
    
    var lastUpdateValue = DateFormatter.format(new Date(data.result[data.result.length -1][time_attr_name]));
    
      elem.getElementsByClassName("hero-temp")[0].innerHTML = tempValue + "&deg;";
    
      elem.getElementsByClassName("last-update")[0].textContent = lastUpdateValue;
    
    var temps = data.result.map(function (item) { return item[temp_attr_name];});
    var sparkline = new Sparkline2(elem.getElementsByClassName("sparkline")[0], {dotRadius: 2.5, lineWidth: 1, endColor: "#2C3E50", lineColor: "#2C3E50", width: width * 0.6});
    sparkline.draw(temps); 
  });

});
