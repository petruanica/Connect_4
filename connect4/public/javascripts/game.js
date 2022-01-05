'use strict';
// @ts-check

import { resetTurnTimer, stopTimers } from "./timer.js";
import { Board } from "./board.js";

const wonMessageText = document.querySelector('#win-message');
const circlesAboveRed = document.querySelectorAll(".player-turn")[0]; // red
const circlesAboveOrange = document.querySelectorAll(".player-turn")[1]; // orange





export class Game {
    constructor(socket, turnColor) {
        this.socket = socket;
        this.board = new Board();
        this.board.initializeBoard();
        this.gameEnded = false;
        this.addClickEvents();
        this.myTurnColor = turnColor;
        this.generalTurnColor = 'red';
        this.timePenalties = 0;

        if (turnColor == "red")
            this.board.makeBoardActive();
        this.updateCirclesBasedOnColor('red'); // red is the first player
    }


    /**
     * Moves the circle display based on the current game color turn
     * @param {string} newColor 
     */
    updateCirclesBasedOnColor(newColor) {
        circlesAboveRed.style.display = "none";
        circlesAboveOrange.style.display = "none";
        console.log("new color", newColor);
        if (newColor == 'red')
            circlesAboveRed.style.display = "block";
        else
            circlesAboveOrange.style.display = "block";
    }



    /**
     * add click events to the board columns
     */
    addClickEvents() {
        const columns = document.querySelectorAll('.board-column');
        let columnIndex = 0;
        for (const column of columns) {
            const click = this.clickColumn.bind(this, columnIndex);
            column.addEventListener('click', click);
            columnIndex++;
        }
    }



    /**
     * Changes the style of the winning pieces by applying an animation to them
     *
     * @param {number} column
     * @param {number} row
     */
    changeWinningPieceStyle(column, row) {
        let winColor = this.board.boardPieces[column][row].style.backgroundColor;
        this.board.boardPieces[column][row].className += ' win-animation-' + winColor;
    }

    /**
     * fuction triggered when the game was won
     * it displays the win message and the player who won and highlights the won positions
     * @param {Array} positions an array of the winning piece positions
     * @param {String} winningColor the color that won the game
     */
    handleWonGame(positions, winningColor) {
        this.gameEnded = true;
        for (const pos of positions) {
            this.changeWinningPieceStyle(pos.col, pos.row);
        }
        wonMessageText.style.display = 'block';
        document.querySelector('#win-player').innerHTML = winningColor;
        stopTimers();
        this.board.makeBoardInactive();
    }


    handleGameEndByTimePenalty() {
        this.gameEnded = true;
        wonMessageText.style.display = 'block';
        document.querySelector('#win-player').innerHTML = this.generalTurnColor;
        stopTimers();
        this.board.makeBoardInactive();
    }

    handleGameEndByDisconnect() {
        this.gameEnded = true;
        wonMessageText.style.display = 'block';
        document.querySelector('#win-player').innerHTML = this.myTurnColor;
        stopTimers();
        this.board.makeBoardInactive();
    }



    clickColumn(column) {
        // player clicks on the column
        if (this.gameEnded == true) {
            return;
        }
        if (this.generalTurnColor != this.myTurnColor) {
            console.log("You can't click because is not your turn!");
            return;
        }
        const row = this.placeColumn(column);
        if (row == undefined)
            return; // it did not change the board

        let data = {
            "event": "move",
            "column": column
        }
        console.log("I am sending the move to the other player", data);
        this.socket.send(JSON.stringify(data));

        const [outcome, positions] = this.board.checkWin(column, row, this.myTurnColor);
        console.log('Game ended is: ', outcome);
        if (outcome == true) {
            this.handleWonGame(positions,this.myTurnColor);
            data = {
                "event": "gameWon",
                "positions": positions,
                "color": this.myTurnColor,
            }
            this.socket.send(JSON.stringify(data));
        }

    }

    /**
     * Handles click event on column
     * @param {number} column
     * @return {function} a function that manages the click
     */
    placeColumn(column) {
        const row = this.board.placePiece(column, this.generalTurnColor);
        this.changeGlobalTurn();
        this.updateCirclesBasedOnColor(this.generalTurnColor);
        if (row == undefined) {
            return undefined;
        }
        return row;
    }

    /**
     * Places a piece on a random column 
     */
    clickRandomColumn() {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.board.columns);
        } while (this.board.lastCellColumn[randomIndex] >= this.board.rows);
        this.clickColumn(randomIndex);
    }

    /**
     * Adds a penalty to current player
     * If a player has 3 penalties, the game ends and the other player wins
     */
    addTimePenalty() {
        if (this.myTurnColor == this.generalTurnColor) {
            this.clickRandomColumn();
            this.timePenalties++;
        }

        if (this.timePenalties == 3) {
            this.handleGameEndByTimePenalty();
            const data = {
                "event": "timePenalty",
                "message": "ran out of time",
            }
            this.socket.send(JSON.stringify(data));
            console.log("ended game due to time penalty");
        }
    }

    /**
     * changes the player's turn
     */
    changeGlobalTurn() {
        resetTurnTimer();
        if (this.generalTurnColor == 'red') {
            this.generalTurnColor = 'yellow';
        } else {
            this.generalTurnColor = 'red';
        }
        
        if (this.myTurnColor == this.generalTurnColor) {
            console.log("changed hover");
            this.board.makeBoardActive();
        } else {
            this.board.makeBoardInactive();
        }
    }

    /**
     * resets the game by clearing the board and resting the player's turn
     */
    resetGame() {
        this.gameEnded = false;
        this.board.clearBoard();
        this.myTurnColor = 'red';
        wonMessageText.style.display = 'none';
        this.timePenalties = 0;
    }
}