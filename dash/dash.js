var dateFormatOptions = { hour: "2-digit", minute: "2-digit" };




[].slice.call(document.getElementsByClassName("cell")).forEach(function(elem) {
  var url = elem.getAttribute("dash-datasource");
  var temp_attr_name = elem.getAttribute("dash-temp-attributename");
  
  nanoajax.ajax(url, function (code, responseText) {
    var data = JSON.parse(responseText);
    
      elem.getElementsByClassName("hero-temp")[0].textContent = data.result[data.result.length -1][temp_attr_name].toFixed(1);
    
    var temps = data.result.map(function (item) { return item[temp_attr_name];});
    var sparkline = new Sparkline2(elem.getElementsByClassName("sparkline")[0]);
    sparkline.draw(temps); 
  });

});
