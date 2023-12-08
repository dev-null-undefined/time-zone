
function unique(array) {
    return array.filter((elem, i, arr) => arr.indexOf(elem) === i)
}

function randomize(array) {
    let copy = array.slice();
    let result = [];
    while (copy.length > 0) {
        let index = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(index, 1)[0]);
    }
    return result;
}

function sign(n) {
    return n < 0 ? -1 : 1;
}


function toDigits(number, digits = 2) {
    let str = number.toString();
    while (str.length < digits) {
        str = `0${str}`;
    }
    return str;
}