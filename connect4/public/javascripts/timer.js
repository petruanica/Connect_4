const timer = document.querySelector('#clock>span');
let seconds = 0;

function addOneSecond() {
    seconds++;
    displayTimer();
}

function displayTimer() {
    let sec = seconds % 60;
    if (sec < 10) {
        sec = '0' + sec.toString();
    } else {
        sec = sec.toString();
    }
    const min = Math.floor(seconds / 60).toString();
    timer.innerHTML = min + ':' + sec;
}
setInterval(addOneSecond, 1000);
