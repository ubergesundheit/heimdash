'use strict';
const timeagoInst = timeago();

const fetchBox = function fetchBox(boxid) {
  return fetch(`https://api.opensensemap.org/boxes/${boxid}/sensors`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(responseJson => {
      for (const sensor of responseJson.sensors) {
        renderValue(sensor);
      }
    })
    .catch(err => {
      console.log(err);
      displayError(boxid);
    });
};

let connection
const connectWebsocket = function connectWebsocket() {
  if (!connection || connection.readyState !== 1) {
    if (connection) {
      connection.close();
    }

    connection = new WebSocket("ws://192.168.0.33:3000/ws");
    connection.onopen = function(evt) {
      const onlineIndicator = document.querySelector(`.onlineIndicator[data-sensor-id="currConsumption"]`);
      onlineIndicator.classList.add("online");
    };
    connection.onmessage = function(evt) {
      const [ createdAt, value ] = evt.data.split(',');

      renderValue({
        _id: 'currConsumption',
        unit: 'W',
        lastMeasurement: {
          value,
          createdAt
        }
       });
    };
  }
}
const fetchTheData = async function fetchTheData() {
  // reset views..
  for (const elem of document.querySelectorAll('[data-default]')) {
    elem.innerHTML = elem.dataset.default;
    if (elem.classList.contains('temp')) {
      elem.classList.add('loading');
    }
  }
  // fetch the boxes
  for (const elem of document.querySelectorAll('meta[name="sensebox-id"]')) {
    await fetchBox(elem.content);
  }

  // connect websocket for power consumption
  connectWebsocket();

  // use render method to render nodes in real time
  timeagoInst.render(document.querySelectorAll('.timestamp'), 'de');

};
const renderValue = function renderValue(sensor) {
  const element = document.querySelector(`[data-sensor-id="${sensor._id}"]`);
  if (element) {
    const { value, createdAt } = sensor.lastMeasurement;
    element.innerHTML = `${prepareValue(value)}${prepareUnit(sensor.unit)}`;
    element.classList.remove('loading');
    // we also want a timestamp, just use the one from temperature
    if (sensor.unit === '°C' || sensor.unit === 'W') {
      const timestampElement = document.querySelector(`.timestamp[data-sensor-id="${sensor._id}"]`);

      timestampElement.dataset.timeago = createdAt;
    }
  }
};
const displayError = function displayError(boxid) {
  const elements = document.querySelectorAll(`[data-error-id="${boxid}"]`);
  if (elements) {
    for (const elem of elements) {
      elem.classList.remove('loading');
      elem.innerHTML = '&times;';
    }
  }
};
const prepareTimestamp = function prepareTimestamp(timestamp) {
  return DateFormatter.format(new Date(timestamp));
};
const prepareValue = function prepareValue(value) {
  return parseFloat(value).toFixed(1);
};
const prepareUnit = function prepareUnit(unit) {
  return unit === '°C' ? '°' : ` ${unit}`;
};

fetchTheData(); // Set the name of the hidden property and the change event for visibility

let hidden, visibilityChange;
if (typeof document.hidden !== 'undefined') {
  // Opera 12.10 and Firefox 18 and later support
  hidden = 'hidden';
  visibilityChange = 'visibilitychange';
} else if (typeof document.mozHidden !== 'undefined') {
  hidden = 'mozHidden';
  visibilityChange = 'mozvisibilitychange';
} else if (typeof document.msHidden !== 'undefined') {
  hidden = 'msHidden';
  visibilityChange = 'msvisibilitychange';
} else if (typeof document.webkitHidden !== 'undefined') {
  hidden = 'webkitHidden';
  visibilityChange = 'webkitvisibilitychange';
}
function handleVisibilityChange() {
  if (document[hidden]) {
  } else {
    fetchTheData();
  }
} // Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === 'undefined' || typeof document[hidden] === 'undefined') {
  alert('This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.');
} else {
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}
