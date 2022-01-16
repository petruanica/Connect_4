/* eslint-disable no-undef */
'use strict';
// @ts-check

import { resetTurnTimer, stopTimers, startTimers, getClockValue } from './timer.js';
import { Board } from './board.js';

const rematchButton = document.querySelector('#rematch-button');

const wonMessageText = document.querySelector('#win-message');
const winMethodText = document.querySelector('#win-method');

const circleYou = document.querySelectorAll('.player-turn')[0]; // you
const circleOpponent = document.querySelectorAll('.player-turn')[1]; // other

const warningYou = document.querySelectorAll('.player-info')[0]; // you
const warningOpponent = document.querySelectorAll('.player-info')[1]; // other

function endAnimation (element) {
    element.style.display = 'none';
    element.className = 'player-info';
    console.log('animation ended!');
}

warningOpponent.style.display = 'none';
warningYou.style.display = 'none';

warningYou.addEventListener('webkitAnimationEnd', (e) => endAnimation(warningYou), false); // sa termin animatia
warningOpponent.addEventListener('webkitAnimationEnd', (e) => endAnimation(warningOpponent), false); // sa termin animatia

const playerDivs = document.querySelectorAll('.player-div');

const scoreYou = document.querySelectorAll('.player-score')[0];
const scoreOpponent = document.querySelectorAll('.player-score')[1];

const winIconYou = document.querySelectorAll('.player-win-icon')[0];
const winIconOpponent = document.querySelectorAll('.player-win-icon')[1];

winIconYou.style.display = 'none';
winIconOpponent.style.display = 'none';

export class Game {
    constructor (socket, turnColor) {
        this.socket = socket;
        this.board = new Board();
        this.board.initializeBoard();
        this.addClickEvents();
        this.myTurnColor = turnColor;

        this.gameEnded = false;
        this.generalTurnColor = 'red';

        if (this.myTurnColor == 'red') { this.board.makeBoardActive(); }
        this.timePenalties = {
            red: 0,
            orange: 0
        };
        this.setPlayerColors();
        this.updateCirclesBasedOnColor('red'); // red is the first player
        this.opponentRequestedRematch = false;

        // bind the rematch event
        const rematchFunction = this.rematchClick.bind(this);
        rematchButton.addEventListener('click', rematchFunction);
    }

    /**
     * Moves the circle display based on the current game color turn
     * @param {string} newColor
     */
    updateCirclesBasedOnColor (newColor) {
        circleYou.style.display = 'none';
        circleOpponent.style.display = 'none';
        console.log('Current color is:', newColor);
        if (newColor == this.myTurnColor) {
            circleYou.style.display = 'block';
        } else {
            circleOpponent.style.display = 'block';
        }
    }

    /**
     * add click events to the board columns
     */
    addClickEvents () {
        const columns = document.querySelectorAll('.board-column');
        let columnIndex = 0;
        for (const column of columns) {
            const click = this.clickColumn.bind(this, columnIndex);
            column.addEventListener('click', click);
            columnIndex++;
        }
    }

    /**
     * increment the score of my color
     */
    incrementMyScore () {
        scoreYou.innerHTML = Number.parseInt(scoreYou.innerHTML) + 1;
    }

    /**
     * increment the score of the opponent
     */
    incremenetOpponentScore () {
        scoreOpponent.innerHTML = Number.parseInt(scoreOpponent.innerHTML) + 1;
    }

    /**
     * Display a crown icon above the player who won
     * @param {String} winningColor winning color
     */
    showWinnerIcon (winningColor) {
        if (winningColor == 'none') { return; }

        if (winningColor == this.myTurnColor) {
            winIconYou.style.display = 'block';
            console.log('eu am castigat');
        } else {
            winIconOpponent.style.display = 'block';
            console.log('eu am pierdut');
        }
    }

    /**
     * handle the score displayed
     * @param {String} winningColor the color that won the game
     */
    handleGameScore (winningColor) {
        if (winningColor == 'none') { return; }

        if (winningColor == this.myTurnColor) {
            this.incrementMyScore();
            console.log('--eu am castigat');
        } else {
            this.incremenetOpponentScore();
            console.log('--eu am pierdut');
        }
    }

    /**
     * is called in all possible win cases and manages the timer, board, score and gameEnded
     * also manages the win player text
     * @param {String} winningColor the color that won the game
     */
    handleGeneralWin (winningColor) {
        this.gameEnded = true;
        resetTurnTimer();
        stopTimers();
        this.board.makeBoardInactive();
        wonMessageText.style.display = 'block';
        this.handleGameScore(winningColor);
        this.showWinnerIcon(winningColor);
        console.log(winningColor);
    }

    /**
     * fuction triggered when the game was won
     * it displays the win message and the player who won and highlights the won positions
     * @param {Array} positions an array of the winning piece positions
     * @param {String} winningColor the color that won the game
     */
    handleWonGame (positions, winningColor) {
        this.handleGeneralWin(winningColor);
        for (const pos of positions) {
            this.board.changeWinningPieceStyle(pos.col, pos.row);
        }
        winMethodText.innerHTML = 'Click the rematch button to play again. ';
        document.querySelector('#win-player').innerHTML = `Player ${winningColor} has won the game!`;
    }

    handleGameEndByTimePenalty () {
        this.handleGeneralWin(this.generalTurnColor);
        rematchButton.style.display = 'none';
        if (this.generalTurnColor == this.myTurnColor) {
            winMethodText.innerHTML = 'Your opponent ran out of time and was kicked out of the game. ';
        } else {
            winMethodText.innerHTML = 'You ran out of time and were kicked out of the game. ';
        }
        document.querySelector('#win-player').innerHTML = `Player ${this.generalTurnColor} has won the game!`;
    }

    handleGameEndByDisconnect () {
        this.handleGeneralWin(this.myTurnColor);
        rematchButton.style.display = 'none';
        winMethodText.innerHTML = 'Your opponent abandoned the match. ';
        document.querySelector('#win-player').innerHTML = `Player ${this.myTurnColor} has won the game!`;
    }

    handleGameDraw () {
        this.handleGeneralWin('none');
        winMethodText.innerHTML = 'Click the rematch button to play again. ';
        document.querySelector('#win-player').innerHTML = 'Game ended in a draw!';
    }

    /**
     * Click made by me or by a random move because my turn has passed
     * @param {number} column
     * @param {boolean} randomClicked boolean that says if the click was random or not
     */
    clickColumn (column, randomClicked = false) {
        // player clicks on the column

        if (this.gameEnded == true) {
            return;
        }
        if (this.generalTurnColor != this.myTurnColor) {
            console.log(`You can't click because is not your turn!. General turn color is ${this.generalTurnColor} and your color is ${this.myTurnColor}`);
            return;
        }
        const row = this.placeColumn(column);
        if (row == undefined) { return; } // it did not change the board

        let data = {
            event: Messages.GAME_MOVE,
            column: column,
            randomClicked: randomClicked
        }
        console.log('I am sending the move to the other player', data);
        this.socket.send(JSON.stringify(data));

        const [outcome, positions] = this.board.checkWin(column, row, this.myTurnColor);
        console.log('Game ended is: ', outcome);
        if (outcome == true && randomClicked == false) {
            this.handleWonGame(positions, this.myTurnColor);
            data = {
                event: Messages.GAME_WON,
                positions: positions,
                gameLength: getClockValue(),
                color: this.myTurnColor
            }
            this.socket.send(JSON.stringify(data));
        } else if (this.board.checkBoardFull() == true) {
            console.log('Game ended in a draw');
            this.handleGameDraw();
            console.log(getClockValue());
            data = {
                event: Messages.GAME_DRAW,
                gameLength: getClockValue(),
                message: 'game ended in a draw'
            }
            this.socket.send(JSON.stringify(data));
        }
    }

    /**
     * Handles click event on column made by the opponent that either clicked or the time passed
     * @param {number} column
     * @param {boolean} randomClicked if the oponnent timer's was out this boolean is true
     * @return {function} a function that manages the click
     */
    placeColumn (column, randomClicked) {
        const row = this.board.placePiece(column, this.generalTurnColor);
        if (row == undefined) {
            return undefined;
        }
        console.log('Placing on column!', randomClicked);
        if (randomClicked == true) {
            // https://stackoverflow.com/questions/7505623/colors-in-javascript-console
            console.log('%c Display warning for other', 'color: #bada55'); // colors in console.log()
            this.displayWarningForOther(); // display warning for other player in that case
        }
        this.changeGlobalTurn();

        return row;
    }

    /**
     * Gets the opponent color
     * @returns the opponent color
     */
    opponentColor () {
        if (this.myTurnColor == 'red') { return 'orange'; }
        return 'red';
    }

    /**
     * Places a piece on a random column on my board
     */
    clickRandomColumn () {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.board.columns);
        } while (this.board.lastCellColumn[randomIndex] >= this.board.rows - 1);
        this.clickColumn(randomIndex, true);
    }

    /**
     * Displays warning popup for me
     */
    displayWarningForMe () {
        this.timePenalties[this.myTurnColor]++;
        const count = this.timePenalties[this.myTurnColor];
        console.log(this.timePenalties);
        warningYou.firstElementChild.innerText = this.getStringFromCount(count);
        warningYou.className += ' fadeInOut';
        warningYou.style.display = 'block';
        this.checkGameEndedByPenalties(count);
    }

    /**
     * Displays warning popup for the other player
     */
    displayWarningForOther () {
        this.timePenalties[this.opponentColor()]++;
        const count = this.timePenalties[this.opponentColor()];
        console.log(this.timePenalties);
        warningOpponent.firstElementChild.innerText = this.getStringFromCount(count);
        warningOpponent.className += ' fadeInOut';
        warningOpponent.style.display = 'block';
    }

    /**
     *
     * @param {number} count the number of penalties
     * @returns {string} the message to be displayed
     */
    getStringFromCount (count) {
        if (count == 1) {
            return '1st warning';
        } else if (count == 2) {
            return '2nd warning';
        } else if (count == 3) {
            return 'Game ended!';
        }
    }

    /**
     * cheks if the game was ended and sends a message to the server
     * @param {number} count number of penalties
     */
    checkGameEndedByPenalties (count) {
        if (count == 3) {
            this.handleGameEndByTimePenalty();
            const data = {
                event: Messages.GAME_LOST_PENALTY,
                message: 'ran out of time'
            }
            this.socket.send(JSON.stringify(data));
            console.log('ended game due to time penalty');
        }
    }

    /**
     * Penalties are added only on your turn and the penalty of the other player is handled using displayWarningForOther
     * Adds a penalty to me based on the timer
     * If a player has 3 penalties, the game ends and the other player wins
     */
    addTimePenalty () {
        if (this.myTurnColor == this.generalTurnColor) {
            this.clickRandomColumn();
            this.displayWarningForMe();
        }
    }

    /**
     * changes the player's turn
     */
    changeGlobalTurn () {
        console.log('Change global turn');
        if (this.generalTurnColor == 'red') { this.generalTurnColor = 'orange'; } else { this.generalTurnColor = 'red'; }
        this.updateCirclesBasedOnColor(this.generalTurnColor);

        if (this.myTurnColor == this.generalTurnColor) {
            console.log('changed hover');
            this.board.makeBoardActive();
        } else {
            this.board.makeBoardInactive();
        }
        resetTurnTimer();
    }

    handleRematchRequest () {
        winMethodText.style.color = '#0da700';
        winMethodText.innerHTML = 'The other player wants to play with you again';
        rematchButton.className += ' rematch-animation';
        this.opponentRequestedRematch = true;
    }

    handleRematchAccepted () {
        this.resetGame();
    }

    setPlayerColors () {
        if (this.myTurnColor == 'red') {
            playerDivs[0].style.borderColor = 'red';
            playerDivs[1].style.borderColor = 'orange';
            circleYou.style.backgroundColor = 'red';
            circleOpponent.style.backgroundColor = 'orange';
        } else {
            playerDivs[0].style.borderColor = 'orange';
            playerDivs[1].style.borderColor = 'red';
            circleYou.style.backgroundColor = 'orange';
            circleOpponent.style.backgroundColor = 'red';
        }
    }

    /**
     * function called when a player click on the rematch button
     */
    rematchClick () {
        this.myTurnColor = this.opponentColor();
        if (this.opponentRequestedRematch == false) {
            // I am the first to click the rematch button
            winMethodText.innerHTML = 'Waiting for opponent to accept...';
            winMethodText.style.color = '#0da700';
            rematchButton.className += ' rematch-animation';
            const data = {
                event: Messages.GAME_REMATCH_REQUEST,
                message: 'waiting for opponent to accept rematch'
            }
            this.socket.send(JSON.stringify(data));
        } else {
            // I am accepting the rematch
            winMethodText.innerHTML = 'Accepting the rematch offer!';
            const data = {
                event: Messages.GAME_REMATCH_ACCEPTED,
                message: 'I accepeted the rematch offer'
            }
            this.socket.send(JSON.stringify(data));
            this.resetGame(); // reseting the game for me
        }
    }

    /**
     * resets the game by clearing the board and resting the player's turn
     */
    resetGame () {
        this.board.clearBoard();
        this.setPlayerColors();

        winIconYou.style.display = 'none'; // no one won
        winIconOpponent.style.display = 'none'; // no one won

        rematchButton.className = '';

        this.gameEnded = false;
        this.opponentRequestedRematch = false;

        this.generalTurnColor = 'red';
        if (this.myTurnColor == 'red') { this.board.makeBoardActive(); }
        this.timePenalties = {
            red: 0,
            orange: 0
        };
        this.updateCirclesBasedOnColor('red'); // red is the first player

        wonMessageText.style.display = 'none';
        winMethodText.style.color = 'black';

        startTimers();
    }
}
