/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */

'use strict';
// @ts-check

const resetButton = document.querySelector('#reset-board');
resetButton.addEventListener('click', resetGame);



const columns = 7; // number of columns the board has
const rows = 6; // number of rows the board has

const boardPieces = Array(columns).fill().map(() => Array(rows));
// boardPices[j][i] = The column j from left to right and the row i from top to bottom( bottom = 0, top = rows - 1)
// !! boardPiecies[col][row] the col and row are reversed because of the structure from html
// in order to highlight a column on hover

const lastCellColumn = Array(columns).fill().map(() => -1);
// lastCellColumn[col] = last row where a piece has been put by a player
// lastCellColumn[col] + 1 should indicate the next free row position to put on that column
// lastCellColumn[col] = -1 means that nothing is on that column
// lastCellColumn[col] = rows means that the column is full


let gameEnded = false;
let playerTurnColor = 'red';

const wonMessageText = document.querySelector('#win-message');

/**
 * resets the game by clearing the board and resting the player's turn
 */
function resetGame() {
  gameEnded = false;
  clearBoard();
  playerTurnColor = 'red';
  wonMessageText.style.display = 'none';
}

/**
 * changes the color of the next player
 */
function changeColor() {
  if (playerTurnColor == 'red') {
    playerTurnColor = 'yellow';
  } else {
    playerTurnColor = 'red';
  }
}

/**
 * fuction triggered when the game was won
 * it displays the win message and the player who won
 */
function handleWonGame() {
  wonMessageText.style.display = 'block';
  document.querySelector('#win-player').innerHTML = playerTurnColor;
}
/**
 * Checks if the piece and the given row and column has the same color as the current player's turn color
 * This function is used to check if one of the player has won the game
 * @param {number} column
 * @param {number} row
 * @return {boolean} if the piece at the that position has the background color of the player's turn color
 */
function sameColor(column, row) {
  if (boardPieces[column][row].style.backgroundColor == playerTurnColor) {
    return true;
  }
  return false;
}

/**
 * Checks if the given column and row are in the board bounderies
 * This function is also used to if a player is winning
 * it is called by {@link okColor()}
 * @param {number} column
 * @param {number} row
 * @return {boolean} if the given position is on the board
 */
function isOnBoard(column, row) {
  return (0 <= column && column < columns && 0 <= row && row < rows);
}

/**
 * Checks if the given position is on the board and the color of the position is the same
 * @param {number} column
 * @param {number} row
 * @return {boolean}
 */
function okColor(column, row) {
  return (isOnBoard(column, row) && sameColor(column, row));
}

/**
 * Changes the style of the winning pieces by applying a black outline around it
 *
 * @param {number} column
 * @param {number} row
 */
function changeWinningPieceStyle(column, row) {
  boardPieces[column][row].style.outline = '2px solid black';
}


/**
 *
 * @param {number} column column where the last piece was placed
 * @param {number} row row where the last piece was placed
 * @param {number} dcol how does the column change when we go a direction(column/row/diagional)
 * @param {number} drow how does the column change when we go a direction(column/row/diagional)
 * @return {boolean} true/false weather the move is a winning one
 */
function checkWinLines(column, row, dcol, drow) {
  let left = 0;
  let right = 3;
  for (let position = 1; position <= 4; position++) {
    let col = column;
    let r = row;
    let win = true;
    const positions = [];
    for (let x = 1; x <= left; x++) {
      col -= dcol;
      r += drow;
      if (!okColor(col, r)) {
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
      if (!okColor(col, r)) {
        win = false;
      }
      positions.push({
        'col': col,
        'row': r,
      });
    }
    if (win == true) {
      changeWinningPiece(column, row);
      for (const pos of positions) {
        changeWinningPieceStyle(pos.col, pos.row);
      }
      gameEnded = true;
      handleWonGame();
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
 * @return {boolean} true/false if the last move was a winning one
 */
function checkWin(column, row) {
  if (checkWinLines(column, row, 1, 0) || checkWinLines(column, row, 0, 1) ||
        checkWinLines(column, row, -1, -1) || checkWinLines(column, row, 1, -1)) {
    return true;
  }
  return false;
}
/**
 * Returns a function that manages the click event on a column
 * @param {number} column
 * @return {function} a function that manages the click
 */
function clickColumnWrapper(column) {
  return function clickColumn() {
    if (gameEnded == true) {
      return;
    }
    const goodIndex = lastCellColumn[column] + 1;
    if (goodIndex < rows) {
      boardPieces[column][goodIndex].style.backgroundColor = playerTurnColor;
      checkWin(column, goodIndex);

      lastCellColumn[column] += 1;
      changeColor(); // change the color of the next turn
    }
  };
}

/**
 * clears the board by resetting the boardPieces and lastCellColumn array
 */
function clearBoard() {
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows; row++) {
      boardPieces[column][row].style.backgroundColor = 'white';
      boardPieces[column][row].style.outline = '';
    }
    lastCellColumn[column] = -1;
  }
}

/**
 * creates the board using the 'board-column' and 'board-cell' class names
 */
function createBoard() {
  const board = document.querySelector('#board');
  for (let column = 0; column < columns; column++) {
    const boardColumn = document.createElement('div');
    boardColumn.className = 'board-column';
    for (let row = 0; row < rows; row++) {
      const boardCell = document.createElement('div');
      boardCell.className = 'board-cell';
      boardColumn.appendChild(boardCell);
      boardPieces[column][rows - row - 1] = boardCell;
    }
    const func = clickColumnWrapper(column);
    boardColumn.addEventListener('click', func); // nu poti pune parametru la functie cand o chemi
    board.appendChild(boardColumn);
  }
}
createBoard();
