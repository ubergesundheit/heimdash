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
  //elem.appendChild(document.createTextNode(TheTimeDateFormatter.format(new Date())))
  var runAfter = 30000
  if (firstRun === true) {
    runAfter = 60000 - Date.now() % (60000)
  }
  timeTimeout = setTimeout(setTime, runAfter)
}


var sourceConfig = {
  //"kli": "https://geraldpape.io/kli/latest",
  "heimdb": "https://geraldpape.io/heimdb/latest"
};

var config = {
  "kli": {
    "timestamp": "TIMESTAMP",
    "temp": "AirTC_Avg",
    "hum": "RH_Avg",
    "rain": "Rain_Tot"
  },
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
  }
};

var units = {
  "temp": "&deg;",
  "hum": "%",
  "batt": "V",
  "rain": "mm",
  "timestamp": ""
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
      })
  );
};

var handleHeimDB = function (data) {
  // response data contains an array with collection-items
  data.forEach(item => {
    // flatten the item.. we want the data in the data key to be on the root level of the object
    Object.keys(item.data).forEach(key => item[key] = item.data[key]);
    // render item to dom
    renderDataItem(item);
  });
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
};

var prepareTimestamp = function (timestamp) {
  return DateFormatter.format(new Date(timestamp));
};

fetchTheData({
  //"kli": handleKli,
  "heimdb": handleHeimDB
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
        "heimdb": handleHeimDB
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
