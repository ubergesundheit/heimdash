"use strict";
var dateFormatOptions = { weekday: "long", hour: "2-digit", minute: "2-digit" };
var DateFormatter = new Intl.DateTimeFormat('de-DE',dateFormatOptions);

var sourceConfig = {
  "kli": "https://geraldpape.io/kli/latest",
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
  }
};

var units = {
  "temp": "&deg;",
  "hum": "%",
  "batt": "V",
  "rain": "mm",
  "timestamp": ""
};

var fetchTheData = function (callbacks) {
  // reset views..
  [].slice.call(document.querySelectorAll("[data-default]")).forEach(function(elem) {
    elem.innerHTML = elem.dataset.default;
  });
  // just make ajax calls to the urls from newConfig..
  Object.keys(sourceConfig).forEach(function (key) {
    nanoajax.ajax(sourceConfig[key], function (code, responseText) {
      callbacks[key].bind(this)(JSON.parse(responseText));
    }.bind(this));
  }, this);
};

var handleHeimDB = function (data) {
  // response data contains an array with collection-items
  data.forEach(function (item) {
    // flatten the item.. we want the data in the data key to be on the root level of the object
    Object.keys(item.data).forEach(function (key) {
      item[key] = item.data[key];
    });
    // render item to dom
    renderDataItem(item);
  }, this);
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
  item[conf.timestamp] = DateFormatter.format(new Date(item[conf.timestamp]));
  // only allow one decimal for the rest of the values
  Object.keys(conf).filter(function (c) { return c !== "timestamp"; }).forEach(function (cc) { item[conf[cc]] = item[conf[cc]].toFixed(1); }, this);
  // apply values to dom elements
  Object.keys(conf).forEach(function (confKey) {
    elem.getElementsByClassName(confKey)[0].innerHTML = item[conf[confKey]] + units[confKey];
  }, this);
};

fetchTheData({
  "kli": handleKli,
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
    fetchTheData({
      "kli": handleKli,
      "heimdb": handleHeimDB
    });
  }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" ||
  typeof document[hidden] === "undefined") {
  alert("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

