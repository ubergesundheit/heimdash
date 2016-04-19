"use strict";
var dateFormatOptions = { weekday: "long", hour: "2-digit", minute: "2-digit" };
var DateFormatter = new Intl.DateTimeFormat('de-DE', dateFormatOptions);

var theTimeDateFormatOptions = {
  day: "numeric",
  weekday: "long",
  year: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit"
};
var TheTimeDateFormatter = new Intl.DateTimeFormat('de-DE', theTimeDateFormatOptions);

var timeTimeout
var setTime = function (firstRun) {
  var elem = document.querySelector("#thetime")
  elem.replaceChild(document.createTextNode(TheTimeDateFormatter.format(new Date())), elem.firstChild)
  var runAfter = 30000
  if (firstRun === true) {
    runAfter = 60000 - Date.now() % (60000)
  }
  timeTimeout = setTimeout(setTime, runAfter)
  if (Date.now() % 300000 < 30000) {
    console.log("refresh")
    fetchTheData({
      "heimdb": handleHeimDB,
      "sensebox": handleSensebox
    });
  }
}

var sourceConfig = {
  "heimdb": "https://geraldpape.io/heimdb/latest",
  "sensebox": "http://opensensemap.org:8000/boxes/57000b8745fd40c8196ad04c/sensors"
  //"sensebox": "https://api.opensensemap.org/boxes/57000b8745fd40c8196ad04c/sensors"
};

var config = {
  "tmps_in0": {
    "timestamp": "timestamp",
    "temp": "temp"
  },
  "tmps_out": {
    "timestamp": "timestamp",
    "temp": "temp",
    "hum": "hum",
    "batt": "batt"
  },
  "tmps_in1": {
    "timestamp": "timestamp",
    "temp": "temp",
    "hum": "hum",
    "batt": "batt"
  },
  "tmps_in2": {
    "timestamp": "timestamp",
    "temp": "temp",
    "hum": "hum"
  },
  "tmps_in3": {
    "timestamp": "timestamp",
    "temp": "temp",
    "hum": "hum",
    "baro": "baro"
  },
  "sensebox": {
    "timestamp": "timestamp",
    "temp": "temp",
    "hum": "hum",
    "baro": "baro"
      //,
    //"uv": "uv",
    //"lux": "lux"
  }
}

var units = {
  "temp": "&deg;",
  "hum": "%",
  "batt": "V",
  "timestamp": "",
  "baro": " hPa",
  "lux": "lx",
  "uv": "μW/cm&sup2;"
};

var fetchAllowed = false
function allowFetch () {
  fetchAllowed = true
}
var fetchTheData = function (callbacks) {
  // reset views..
  Array.from(document.querySelectorAll("[data-default]")).forEach(elem => {
    elem.innerHTML = elem.dataset.default;
    elem.classList.add("loading");
  });
  // just make ajax calls to the urls from newConfig..
  Object.keys(sourceConfig).forEach(key =>
      fetch(sourceConfig[key])
      .then(response => response.json())
      .then(json => callbacks[key](json))
      .then(function () {
        fetchAllowed = false
        setTimeout(allowFetch, 30000)
      })
      .catch(error => {
        //alert(error);
        console.log(error, key)
        displayError(key)
      })
  );
};

var displayError = function (key) {
  // for now, this only works for sensebox..
  var tempnode = document.querySelector("#" + key + " > .temp");
  if (tempnode) {
    tempnode.classList.remove("loading")
    tempnode.innerHTML = "&times;"
  }
}

var handleHeimDB = function (data) {
  // response data contains an array with collection-items
  data.forEach(item => {
    // flatten the item.. we want the data in the data key to be on the root level of the object
    Object.keys(item.data).forEach(key => item[key] = item.data[key]);
    // render item to dom
    renderDataItem(item);
  });
};

var handleSensebox = function (data) {
  console.log(data)
  var firstTimestamp = new Date();
  var senseboxData = Object.create(null);
  data.sensors.forEach(function (sensor) {
    switch (sensor.unit) {
      //case "μW/cm²":
      //  senseboxData.uv = parseFloat(sensor.lastMeasurement.value);
      //  break;
      //case "lx":
      //  senseboxData.lux = parseFloat(sensor.lastMeasurement.value);
      //  break;
      case "hPa":
        senseboxData.baro = parseFloat(sensor.lastMeasurement.value);
        break;
      case "%":
        senseboxData.hum = parseFloat(sensor.lastMeasurement.value);
        break;
      case "°C":
        senseboxData.temp = parseFloat(sensor.lastMeasurement.value);
    }
    var ts = new Date(sensor.lastMeasurement.updatedAt);
    if (ts < firstTimestamp) {
      firstTimestamp = ts;
    }
  });
  // add the collection and timestamp and render..
  senseboxData.timestamp = firstTimestamp;
  senseboxData.collection = "sensebox";
  renderDataItem(senseboxData);
};

var handleKli = function (data) {
  var confKey = "kli";
  // response data contains a result key which contains an array with the wanted data..
  var kliData = data.result[0];
  kliData.collection = confKey;
  // render item to dom
  renderDataItem(kliData);
};

var renderDataItem = function (item) {
  var conf = config[item.collection];
  if (conf) {
    var elem = document.getElementById(item.collection);
    // prepare the timestamp..
    item[conf.timestamp] = prepareTimestamp(item[conf.timestamp]);
    // only allow one decimal for the rest of the values
    Object.keys(conf).filter(c => c !== "timestamp").forEach(cc => item[conf[cc]] = item[conf[cc]].toFixed(1));
    // apply values to dom elements
    Object.keys(conf).forEach(confKey => {
      var htmlVal = item[conf[confKey]];
      var dataNode = elem.getElementsByClassName(confKey)[0];
      dataNode.innerHTML = htmlVal + units[confKey];
      dataNode.classList.remove("loading");
    });
  }
};

var prepareTimestamp = function (timestamp) {
  return DateFormatter.format(new Date(timestamp));
};

fetchTheData({
  "heimdb": handleHeimDB,
  "sensebox": handleSensebox
});

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
    console.log(fetchAllowed)
    if (fetchAllowed === true) {
      fetchTheData({
        //"kli": handleKli,
        "heimdb": handleHeimDB,
        "sensebox": handleSensebox
      });
    }
  }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" ||
  typeof document[hidden] === "undefined") {
  alert("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

function toggleFullScreen() {
  // init time..
  setTime(true)
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

document.getElementById("fullscreenbtn").addEventListener("touchend", toggleFullScreen, false)

// nexus 7 wall mode detection
if (window.navigator.userAgent.includes("Nexus 7")) {
  var fileref = document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute("href", "nexus-mirror.css")
  document.getElementsByTagName("head")[0].appendChild(fileref)
}
