let time_constants = (() => {
    let seconds = 1000;
    let minutes = 60 * seconds;
    let hours = 60 * minutes;
    let days = 24 * hours;
    return {seconds, minutes, hours, days};
})();

function timeInZone(timezone, deltaInHours = 0) {
    let now = new Date();
    let utc = now.getTime() % time_constants.days;
    let local = utc + timezone * time_constants.hours + deltaInHours * time_constants.hours;
    return new Date(local % time_constants.days);
}

function hoursToDate(h) {
    return new Date(h * time_constants.hours);
}