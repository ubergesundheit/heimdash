'use strict';
const timeagoInst = timeago();

const fetchBox = async function fetchBox(boxid) {
  try {
    const response = await fetch(`https://api.opensensemap.org/boxes/${boxid}/sensors`)
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const responseJson = await response.json();
    for (const sensor of responseJson.sensors) {
      renderValue(sensor);
    }
  } catch(err) {
    console.log(err);
    displayError(boxid);
  }
};

let wsConnection;

const toggleWsOnlineIndicator = function toggleWsOnlineIndicator(online) {
  const onlineIndicator = document.querySelector(`.onlineIndicator[data-sensor-id="currConsumption"]`);
  onlineIndicator.classList[(online === true ? 'add' : 'remove' )]('online');
};

const wsOnMessage = function wsOnMessage(evt) {
  const [ createdAt, value ] = evt.data.split(',');

  renderValue({
    _id: 'currConsumption',
    unit: '',
    lastMeasurement: {
      value,
      createdAt
    }
   });
};

const wsOnAnything = function wsOnAnything(evt) {
  let onlineState;
  switch(evt.type) {
    case 'error':
      onlineState = false;
      displayError("currConsumption")
      break;
    case 'close':
      onlineState = false;
      break;
    case 'open':
      onlineState = true;
      break;
  }
  toggleWsOnlineIndicator(onlineState);
};

const connectWebsocket = function connectWebsocket() {
  if (!wsConnection || wsConnection.readyState !== 1) {
    if (wsConnection) {
      wsConnection.removeEventListener('message', wsOnMessage);
      wsConnection.removeEventListener('error', wsOnAnything);
      wsConnection.removeEventListener('close', wsOnAnything);
      wsConnection.removeEventListener('open', wsOnAnything);
      wsConnection.close();
    }

    wsConnection = new WebSocket("ws://192.168.0.10:3000/ws");

    wsConnection.addEventListener('error', wsOnAnything);
    wsConnection.addEventListener('close', wsOnAnything);
    wsConnection.addEventListener('open', wsOnAnything);

    wsConnection.addEventListener('message', wsOnMessage);
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
    const { numDecimals } = element.dataset;
    const { value, createdAt } = sensor.lastMeasurement;
    element.innerHTML = `${prepareValue(value, numDecimals)}${prepareUnit(sensor.unit)}`;
    element.classList.remove('loading');
    // we also want a timestamp, just use the one from temperature
    if (sensor.unit === '°C') {
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
const prepareValue = function prepareValue(value, numDecimals = 1) {
  return parseFloat(value).toFixed(numDecimals);
};
const prepareUnit = function prepareUnit(unit) {
  return unit === '°C' ? '°' : ` ${unit}`;
};

fetchTheData(); // Set the name of the hidden property and the change event for visibility

const handleVisibilityChange = function handleVisibilityChange () {
  if (document.hidden) {
   wsConnection.close();
  } else {
    fetchTheData();
  }
};

document.addEventListener('pagehide', handleVisibilityChange);
document.addEventListener('pageshow', handleVisibilityChange);
document.addEventListener('visibilitychange', handleVisibilityChange, false);
