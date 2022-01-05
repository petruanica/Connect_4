'use strict';

import { turnTimePenalty } from "./main.js";
import { config } from "./config.js"

const clock = document.querySelector('#clock>span');
const timer = document.querySelector('#timer>span');
const button = document.querySelector('#rematch-button');
button.addEventListener("click",() => {stopTimers(); startTimers();});

let seconds = 0;
let secondsLeft = config.TIMER_SECONDS;

let clockInterval;
let timerInterval;

startTimers();

function addOneSecond() {
    seconds++;
    displayClock();
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

function substractOneSecond() {
    secondsLeft--;
    displayTimer();
}

function displayTimer() {
    if (secondsLeft == -1) {
        secondsLeft = config.TIMER_SECONDS + 1;
        console.log("time penalty");
        turnTimePenalty();
    }
    timer.innerHTML = secondsLeft.toString();
}

function startTimers() {
    seconds = -1; 
    secondsLeft = config.TIMER_SECONDS + 1;
    clockInterval = setInterval(addOneSecond, 1000);;
    timerInterval = setInterval(substractOneSecond, 1000);
}


export function resetTurnTimer() {
    secondsLeft = config.TIMER_SECONDS;
}

export function stopTimers() {
    clearInterval(clockInterval);
    clearInterval(timerInterval);
}