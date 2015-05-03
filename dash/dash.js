var config = {
  "kli": {
    "source": "https://geraldpape.io/kli/latest",
    "attrs": {
      "time": "TIMESTAMP",
      "temp": "AirTC_Avg",
      "hum": "RH_Avg",
      "rain": "Rain_Tot"
    }
  },
  "living": {
    "source": "//api.keen.io/3.0/projects/54bbebe996773d4b95ebd8ef/queries/extraction?api_key=a7857e27ed6fb6c898946cec28851c33daaa777d32685960cd9afba293236d54a1c8f168d0a1fb3eb432a9e2bae77a9aa013d7bfd83090261fb2352bea055f58b46c2d66d1edcfcdabcace8cc2ec314058fdbf24c3de2968874825d79ed175ad1d0009d5f720efe9097ae3037128d912&event_collection=whng_temps&timezone=3600&latest=1",
    "attrs": {
      "time": "timestamp",
      "temp": "temp"
    }
  },
  "out": {
    "source": "//api.keen.io/3.0/projects/54bbebe996773d4b95ebd8ef/queries/extraction?api_key=a7857e27ed6fb6c898946cec28851c33daaa777d32685960cd9afba293236d54a1c8f168d0a1fb3eb432a9e2bae77a9aa013d7bfd83090261fb2352bea055f58b46c2d66d1edcfcdabcace8cc2ec314058fdbf24c3de2968874825d79ed175ad1d0009d5f720efe9097ae3037128d912&event_collection=eltako&timezone=3600&latest=1",
    "attrs": {
      "time": "timestamp",
      "temp": "temp",
      "hum": "hum",
      "batt": "batt"
    }
  }
};

var units = {
  "temp": "&deg;",
  "hum": "%",
  "batt": "V",
  "rain": "mm",
  "time": ""
};


var dateFormatOptions = { hour: "2-digit", minute: "2-digit" };
var DateFormatter = new Intl.DateTimeFormat('de-DE',dateFormatOptions);

//var sparklineOptions = {dotRadius: 2.5, lineWidth: 1, endColor: "#2C3E50", lineColor: "#2C3E50", width: width * 0.6};

var update = function () {
  Object.keys(config).forEach(function(item) {
    var elem = document.getElementById(item);
    elem.getElementsByClassName("temp")[0].innerHTML = "-";
    var elem_conf = config[item];

    var width = elem.scrollWidth;

    nanoajax.ajax(elem_conf.source, function (code, responseText){
      var data = JSON.parse(responseText);

      var lastValues = data.result[data.result.length -1];

      var values = {};

      Object.keys(elem_conf.attrs).forEach(function (item){
        values[item] = lastValues[elem_conf.attrs[item]];
      });

      values.temp = values.temp.toFixed(1);
      values.time = DateFormatter.format(new Date(values.time));

      Object.keys(values).forEach(function(item){
        elem.getElementsByClassName(item)[0].innerHTML = values[item] + units[item];
      });
    });
  });
};

update();


// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
  hidden = "mozHidden";
  visibilityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

function handleVisibilityChange() {
  if (document[hidden]) {
  } else {
    //videoElement.play();
   update();
  }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" ||
  typeof document[hidden] === "undefined") {
  alert("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

/*
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
*/
