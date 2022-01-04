export class Board {
    // TREBUIE SA AI THIS. peste tot
    constructor() {
        this.rows = 6;
        this.columns = 7;

        this.boardPieces = Array(this.columns).fill().map(() => Array(this.rows));
        // boardPices[j][i] = The column j from left to right and the row i from top to bottom( bottom = 0, top = rows - 1)
        // !! boardPiecies[col][row] the col and row are reversed because of the structure from html
        // in order to highlight a column on hover

        this.lastCellColumn = Array(this.columns).fill().map(() => -1);
        // lastCellColumn[col] = last row where a piece has been put by a player
        // lastCellColumn[col] + 1 should indicate the next free row position to put on that column
        // lastCellColumn[col] = -1 means that nothing is on that column
        // lastCellColumn[col] = rows means that the column is full
    }

    /**
     * Places a new piece on a column if it is able to do so
     * @param {number} col
     * @param {string} playerTurnColor
     * @return {number} the row where the piece was placed or undefined if it can't be placed anymore
     */
    placePiece(col, playerTurnColor) {
        const rowIndex = this.lastCellColumn[col] + 1;
        if (rowIndex < this.rows) {
            this.boardPieces[col][rowIndex].style.backgroundColor = playerTurnColor;
            this.lastCellColumn[col] += 1;
            return rowIndex;
        } else {
            return undefined;
        }
    }

    /**
     * creates the board using the 'board-column' and 'board-cell' class names
     */
    clearBoard() {
        for (let column = 0; column < this.columns; column++) {
            for (let row = 0; row < this.rows; row++) {
                this.boardPieces[column][row].style.backgroundColor = 'white';
                this.boardPieces[column][row].style.outline = '';
            }
            this.lastCellColumn[column] = -1;
        }
    }

    /**
     * creates the board using the 'board-column' and 'board-cell' class names
     */
    initializeBoard() {
        const board = document.querySelector('#board');
        for (let column = 0; column < this.columns; column++) {
            const boardColumn = document.createElement('div');
            boardColumn.className = 'board-column';
            for (let row = 0; row < this.rows; row++) {
                const boardCell = document.createElement('div');
                boardCell.className = 'board-cell';
                boardColumn.appendChild(boardCell);
                this.boardPieces[column][this.rows - row - 1] = boardCell;
            }
            // const func = clickColumnWrapper(column);
            // boardColumn.addEventListener('click', func); // nu poti pune parametru la functie cand o chemi
            board.appendChild(boardColumn);
        }
    }


    /**
     * Checks if the piece and the given row and column has the same color as the current player's turn color
     * This function is used to check if one of the player has won the game+
     * @param {number} column
     * @param {number} row
     * @param {string} color
     * @return {boolean} if the piece at the that position has the background color of the player's turn color
     */
    sameColor(column, row, color) {
        return (this.boardPieces[column][row].style.backgroundColor == color);
    }

    /**
     * Checks if the given column and row are in the board bounderies
     * This function is also used to if a player is winning
     * it is called by {@link okColor()}
     * @param {number} column
     * @param {number} row
     * @return {boolean} true/false if the given position is on the board
     */
    isOnBoard(column, row) {
        return (0 <= column && column < this.columns && 0 <= row && row < this.rows);
    }

    /**
     * Checks if the given position is on the board and the color of the position is the same
     * @param {number} column
     * @param {number} row
     * @param {string} color
     * @return {boolean}
     */
    okColor(column, row, color) {
        return (this.isOnBoard(column, row) && this.sameColor(column, row, color));
    }


    /**
     * Changes the style of the winning pieces by applying a black outline around it
     *
     * @param {number} column
     * @param {number} row
     */
    changeWinningPieceStyle(column, row) {
        this.boardPieces[column][row].style.outline = '2px solid black';
    }

    /**
     *
     * @param {number} column column where the last piece was placed
     * @param {number} row row where the last piece was placed
     * @param {string} color the color of the last move
     * @param {number} dcol how does the column change when we go a direction(column/row/diagional)
     * @param {number} drow how does the column change when we go a direction(column/row/diagional)
     * @return {boolean} true/false weather the move is a winning one
     */
    checkWinLines(column, row, color, dcol, drow) {
        let left = 0;
        let right = 3;
        for (let position = 1; position <= 4; position++) {
            let col = column;
            let r = row;
            let win = true;
            const positions = [{ 'col': col, 'row': row }];
            for (let x = 1; x <= left; x++) {
                col -= dcol;
                r += drow;
                if (!this.okColor(col, r, color)) {
                    win = false;
                }
                positions.push({
                    'col': col,
                    'row': r,
                });
            }

            col = column;
            r = row;
            for (let x = 1; x <= right; x++) {
                col += dcol;
                r -= drow;
                if (!this.okColor(col, r, color)) {
                    win = false;
                }
                positions.push({
                    'col': col,
                    'row': r,
                });
            }
            if (win == true) {
                for (const pos of positions) {
                    this.changeWinningPieceStyle(pos.col, pos.row);
                }
                return true;
            }
            left++;
            right--;
        }
        return false;
    }

    /**
     * Checks weather the last move at the position column,row is a winning one using {@link checkWinLines}
     * @param {number} column column where the last piece was placed
     * @param {number} row row where the last piece was placed
     * @param {string} color the color of the last move
     * @return {boolean} true/false if the last move was a winning one
     */
    checkWin(column, row, color) {
        if (this.checkWinLines(column, row, color, 1, 0) || this.checkWinLines(column, row, color, 0, 1) ||
            this.checkWinLines(column, row, color, -1, -1) || this.checkWinLines(column, row, color, 1, -1)) {
            return true;
        }
        return false;
    }
}