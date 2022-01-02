const clock = document.querySelector('#clock>span');
const timer = document.querySelector('#timer>span');
let seconds = 0;
let secondsLeft = 15;

function addOneSecond() {
    seconds++;
    displayClock();
}

function substractOneSecond() {
    secondsLeft--;
    displayTimer();
}

function displayClock() {
    let sec = seconds % 60;
    if (sec < 10) {
        sec = '0' + sec.toString();
    } else {
        sec = sec.toString();
    }
    const min = Math.floor(seconds / 60).toString();
    clock.innerHTML = min + ':' + sec;
}

function displayTimer() {
    if (secondsLeft == -1) {
        secondsLeft = 15;
    }
    timer.innerHTML = secondsLeft.toString();
}

setInterval(addOneSecond, 1000);
setInterval(substractOneSecond, 1000);