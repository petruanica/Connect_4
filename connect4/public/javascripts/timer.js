'use strict';

import { turnTimePenalty } from "./main.js";
import {config} from "./config.js"

const clock = document.querySelector('#clock>span');
const timer = document.querySelector('#timer>span');

let secondsClock;
let secondsTimer;

let clockInterval;
let timerInterval;

startTimers();

function addOneSecond() {
    secondsClock++;
    displayClock();
}


function displayClock() {
    let sec = secondsClock % 60;
    if (sec < 10) {
        sec = '0' + sec.toString();
    } else {
        sec = sec.toString();
    }
    const min = Math.floor(secondsClock / 60).toString();
    clock.innerHTML = min + ':' + sec;
}

function substractOneSecond() {
    secondsTimer--;
    displayTimer();
}

function displayTimer() {
    if (secondsTimer == -1) {
        secondsTimer = config.TIMER_SECONDS;
        turnTimePenalty();
    }
    timer.innerHTML = secondsTimer.toString();
}

export function startTimers() {
    secondsClock = -1;
    secondsTimer = config.TIMER_SECONDS + 1;
    clockInterval = setInterval(addOneSecond, 1000);;
    timerInterval = setInterval(substractOneSecond, 1000);
}


export function resetTurnTimer() {
    secondsTimer = config.TIMER_SECONDS;
}

export function stopTimers() {
    clearInterval(clockInterval);
    clearInterval(timerInterval);
}