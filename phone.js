let statesFull = false;
let states = document.getElementById("states");
let timeOverlay = document.getElementById("time-div");

let timeOverlayFull = false;
console.log("states");
states.onmousedown = () => {
    statesFull = !statesFull;
    if (statesFull) {
        states.style.display = "div";
        states.style.width = "100vw";
        states.style.height = "100vh";
        states.style.top = "0";
        states.style.left = "0";
        states.style.zIndex = "5000";
        states.style.position = "absolute";
    } else {
        states.style = "";
    }
}

timeOverlay.onmousedown = () => {
    timeOverlayFull = !timeOverlayFull;
    if (timeOverlayFull) {
        timeOverlay.style.display = "div";
        timeOverlay.style.width = "100vw";
        timeOverlay.style.height = "100vh";
        timeOverlay.style.top = "0";
        timeOverlay.style.left = "0";
        timeOverlay.style.zIndex = "5000";
        timeOverlay.style.position = "fixed";
        timeOverlay.fotnSize = "5em";
    } else {
        timeOverlay.style = "";
    }
}
