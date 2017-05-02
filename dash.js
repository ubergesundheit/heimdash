'use strict';
const dateFormatOptions = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
const DateFormatter = new Intl.DateTimeFormat('de-DE', dateFormatOptions);

const theTimeDateFormatOptions = {
  day: 'numeric',
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit'
};

const TheTimeDateFormatter = new Intl.DateTimeFormat('de-DE', theTimeDateFormatOptions);

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
const fetchTheData = function fetchTheData() {
  // reset views..
  for (const elem of document.querySelectorAll('[data-default]')) {
    elem.innerHTML = elem.dataset.default;
    elem.classList.add('loading');
  }
  // fetch the boxes
  for (const elem of document.querySelectorAll('meta[name="sensebox-id"]')) {
    fetchBox(elem.content);
  }
};
const renderValue = function renderValue(sensor) {
  const element = document.querySelector(`[data-sensor-id="${sensor._id}"]`);
  if (element) {
    const { value, createdAt } = sensor.lastMeasurement;
    element.innerHTML = `${prepareValue(value)}${prepareUnit(sensor.unit)}`;
    element.classList.remove('loading');
    // we also want a timestamp, just use the one from temperature
    if (sensor.unit === '°C') {
      const timestampElement = document.querySelector(`.timestamp[data-sensor-id="${sensor._id}"]`);

      timestampElement.innerHTML = `${prepareTimestamp(createdAt)}`;
      timestampElement.classList.remove('loading');
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
