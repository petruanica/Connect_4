'use strict';
// @ts-check

import { resetTurnTimer, stopTimers } from "./timer.js";
import { Board } from "./board.js";

const wonMessageText = document.querySelector('#win-message');

export class Game {
    constructor(socket, turnColor) {
        this.socket = socket;
        this.board = new Board();
        this.board.initializeBoard();
        this.gameEnded = false;
        this.addClickEvents();
        this.myTurnColor = turnColor;
        this.generalTurnColor = 'red';
        this.timePenalties = {
            'red': 0, 
            'yellow': 0
        };
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
     * fuction triggered when the game was won
     * it displays the win message and the player who won
     */
    handleWonGame() {
        wonMessageText.style.display = 'block';
        document.querySelector('#win-player').innerHTML = this.myTurnColor;
        stopTimers();
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

        const outcome = this.board.checkWin(column, row, this.myTurnColor);
        console.log('Game ended is: ', outcome);
        if (outcome == true) {
            this.gameEnded = true;
            this.handleWonGame();
        }

        const data = {
            "event": "move",
            "column": column
        }
        console.log("I am sending the move to the other player", data);
        this.socket.send(JSON.stringify(data));
    }

    /**
     * Handles click event on column
     * @param {number} column
     * @return {function} a function that manages the click
     */
    placeColumn(column) {
        const row = this.board.placePiece(column, this.generalTurnColor);
        this.changeGlobalTurn();
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
            this.timePenalties[this.myTurnColor]++;
        }

        if (this.timePenalties[this.myTurnColor] == 3) {
            this.gameEnded = true;
            this.handleWonGame();
            console.log("ended game due to time penalty");
        }
    }

    /**
     * changes the player's turn
     */
    changeGlobalTurn() {
        resetTurnTimer();
        if (this.generalTurnColor == 'red')
            this.generalTurnColor = 'yellow';
        else
            this.generalTurnColor = 'red';
    }


    /**
     * resets the game by clearing the board and resting the player's turn
     */
    resetGame() {
        this.gameEnded = false;
        this.board.clearBoard();
        this.myTurnColor = 'red';
        wonMessageText.style.display = 'none';
        this.timePenalties = {
            'red': 0,
            'yellow': 0
        };
    }
}