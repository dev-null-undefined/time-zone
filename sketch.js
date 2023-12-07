let map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let seconds = 1000;
let minutes = 60 * seconds;
let hours = 60 * minutes;
let days = 24 * hours;

let zones = timezones.features
  .map(function (feature) {
    return feature.properties.zone;
  })
  .sort((a, b) => a - b)
  .filter((zone, i, arr) => arr.indexOf(zone) === i);

function timeInZone(timezone, deltainHours = 0) {
  let now = new Date();
  let utc = now.getTime() % days;
  let local = utc + timezone * hours + deltainHours * hours;
  return new Date(local % days);
}

function hoursToDate(h) {
  return new Date(h * hours);
}

function sign(n) {
  return n < 0 ? -1 : 1;
}

function defaultCompare(a, b) {
  if (sign(a) === sign(b)) {
    return b - a;
  }
  return sign(b) - sign(a);
}

function sortedZones(time, compare = defaultCompare) {
  return zones.sort(function (a, b) {
    let aDiff = timeInZone(a) - time;
    let bDiff = timeInZone(b) - time;
    return compare(aDiff, bDiff);
  });
}

let targetDate = hoursToDate(24);

let sorted = sortedZones(targetDate);

let timeDiv = document.getElementById("time");

let stateDiv = document.getElementById("table");

let lastHoverZone = sorted[0];

function zoneToColor(timezone) {
  let diff = targetDate - timeInZone(timezone);
  let alpha = sorted.indexOf(timezone) / sorted.length;
  alpha = (days - diff) / days;
  alpha = Math.pow(alpha, 20);
  if (timezone == lastHoverZone) {
    alpha += 0.5;
  }
  let color = `hsla(${(timezone + 12) * 15}, 100%, 50%, ${
    alpha.toFixed(2) * 100
  }%)`;
  return color;
}

function toDigits(number, digits = 2) {
  let str = number.toString();
  while (str.length < digits) {
    str = `0${str}`;
  }
  return str;
}

let lastClick = 0;


let shouldReset = true;

let layer = L.geoJson(timezones)
  .on("mousedown", function (e) {
    lastHoverZone = e.layer.feature.properties.zone;
    clearTimeout(lastClick);
    lastClick = setTimeout(() => {
        if(shouldReset) lastHoverZone = sorted[0];
    }, seconds * 5);
  })
  .addTo(map);

// layer.bindPopup(function (layer) {
//   let time = timeInZone(layer.feature.properties.zone);
//   return `${toDigits(
//     time.getUTCHours()
//   )}:${toDigits(time.getUTCMinutes())}:${toDigits(time.getUTCSeconds())}`;
// });

function randomize(array) {
  let copy = array.slice();
  let result = [];
  while (copy.length > 0) {
    let index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

setInterval(() => {
  sorted = sortedZones(targetDate);
  layer.setStyle(function (feature) {
    return { color: zoneToColor(feature.properties.zone) };
  });
}, 50);

setInterval(() => {
  let time = timeInZone(lastHoverZone);
  timeDiv.innerText = `${toDigits(time.getUTCHours())}:${toDigits(
    time.getUTCMinutes()
  )}:${toDigits(time.getUTCSeconds())}:${toDigits(
    time.getUTCMilliseconds(),
    3
  )}`;

  let table = document.createElement("table");

  let states = {}

  let id = lastHoverZone;
  if(lastHoverZone % 1 != 0) {
    id = `${Math.floor(lastHoverZone)}:${toDigits(lastHoverZone % 1 * 60, 2)}`
  }

  zonedata[id].forEach(element => {
    if(!states[element.Country]) states[element.Country] = [];
    states[element.Country].push(...element.Cities.split(", "))
  })

  for (const [state, cities] of Object.entries(states).sort((a, b) => b[0] < a[0])) {
    let row = document.createElement("tr");
    let country = document.createElement("td");
    country.innerText = state;
    row.appendChild(country);
    let citiestd = document.createElement("td");
    citiestd.innerText = cities.slice(0, 3).join(", ");
    row.appendChild(citiestd);
    table.appendChild(row);
  }

  stateDiv.innerHTML = "";
  stateDiv.appendChild(table);
}, 10);

window.onkeydown = function (e) {
  if (e.key === " ") {
    lastHoverZone = sorted[0];
  }
  if (e.key === "r") {
    shouldReset = !shouldReset;
  }
};
