const timer = document.querySelector('#clock>span');
const button = document.querySelector('#reset-board');
button.addEventListener("click",() => seconds = -1);

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
const interval = setInterval(addOneSecond, 1000);
