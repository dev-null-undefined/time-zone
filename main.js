let timeDiv = document.getElementById("time");
let stateDiv = document.getElementById("table");

leaflet.map = L.map("map").setView([0, 0], 2)

leaflet.layers.openstreetmap = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(leaflet.map);


let time_zones = leaflet.data.time_zones.features
    .map(function (feature) {
        return feature.properties.zone;
    })
    .sort((a, b) => a - b);

time_zones = unique(time_zones);

function sortedZones(time) {
    return time_zones.sort((a, b) => {
        return Math.abs(timeInZone(a) - time) % time_constants.days - Math.abs(timeInZone(b) - time) % time_constants.days
    });
}

let targetDate = hoursToDate(48);

let sorted = sortedZones(targetDate);

let focused_zone = {
    zone: sorted[0],
    is_selected: (zone) => (zone + 24) % 24 === (focused_zone.zone + 24) % 24,
    last_click_timeout: 0,
    should_reset: true
}


function zoneToColor(timezone) {
    let diff = Math.abs(targetDate - timeInZone(timezone)) % time_constants.days;
    let alpha = 1 - sorted.indexOf(timezone) / sorted.length;
    alpha = (time_constants.days - diff) / time_constants.days;
    alpha = Math.pow(alpha, 1.5);
    if (focused_zone.is_selected(timezone)) {
        alpha += 0.5;
    } else {
        alpha -= 0.6;
    }
    return `hsla(${(timezone + 12) * 15}, 100%, 50%, ${
        alpha.toFixed(2) * 100
    }%)`;
}

leaflet.layers.time_zones = L.geoJson(leaflet.data.time_zones)
    .on("mousedown", function (e) {
        focused_zone.zone = e.layer.feature.properties.zone;
        clearTimeout(focused_zone.last_click_timeout);
        focused_zone.last_click_timeout = setTimeout(() => {
            if (focused_zone.should_reset) focused_zone.zone = sorted[0];
        }, time_constants.seconds * 5);
    })
    .addTo(leaflet.map);

leaflet.layers.cities = L.geoJson(leaflet.data.cities, {
    pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 4,
            fillColor: '#ff7800',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }
}).addTo(leaflet.map);

leaflet.layers.cities.bindPopup(function (layer) {
    return `${layer.feature.properties.city}, ${layer.feature.properties.country}`;
});

setInterval(() => {
    let last_closest = sorted[0];
    sorted = sortedZones(targetDate);
    if (last_closest !== sorted[0] && focused_zone.should_reset) {
        focused_zone.zone = sorted[0];
        explode()
    }
    leaflet.layers.time_zones.setStyle(feature => ({color: zoneToColor(feature.properties.zone)}));
}, 100);

function zoneFloatToTime(timezone) {
    let id = timezone;
    if (timezone % 1 !== 0) {
        id = `${Math.trunc(timezone)}:${toDigits(
            Math.abs((timezone % 1) * 60),
            2
        )}`;
    }
    return id;
}

setInterval(() => {
    let zone = focused_zone.zone;
    let time = timeInZone(zone);
    timeDiv.innerText = `${toDigits(time.getUTCHours())}:${toDigits(
        time.getUTCMinutes()
    )}:${toDigits(time.getUTCSeconds())}:${toDigits(
        time.getUTCMilliseconds(),
        3
    )}`;

    let table = document.createElement("table");

    let states = {};

    if (leaflet.data.countries[zoneFloatToTime(zone)]) {
        leaflet.data.countries[zoneFloatToTime(zone)].forEach((element) => {
            if (!states[element.Country]) states[element.Country] = [];
            states[element.Country].push(...element.Cities.split(", "));
        });
    }

    let alternative_zone;
    if (zone > 0) {
        alternative_zone = zone - 24;
    } else {
        alternative_zone = zone + 24;
    }
    if (leaflet.data.countries[zoneFloatToTime(alternative_zone)]) {
        leaflet.data.countries[zoneFloatToTime(alternative_zone)].forEach((element) => {
            if (!states[element.Country]) states[element.Country] = [];
            states[element.Country].push(...element.Cities.split(", "));
        });
    }

    for (const [state, cities] of Object.entries(states).sort(
        (a, b) => (b[0] < a[0]) - (a[0] < b[0])
    )) {
        let row = document.createElement("tr");
        let country = document.createElement("td");
        country.innerText = state;
        row.appendChild(country);
        let citiestd = document.createElement("td");
        citiestd.innerText = cities.filter((city) => city !== "").slice(0, 3).join(", ");
        row.appendChild(citiestd);
        table.appendChild(row);
    }

    stateDiv.innerHTML = "";
    stateDiv.appendChild(table);
}, 10);

window.onkeydown = function (e) {
    if (e.key === " ") {
        focused_zone.zone = sorted[0];
    }
    if (e.key === "r") {
        focused_zone.should_reset = !focused_zone.should_reset;
    }
};
