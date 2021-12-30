const resetButton = document.querySelector("#reset-board");
resetButton.addEventListener("click",resetGame );


const columns = 7;
const rows = 6;

const boardPieces = Array(columns).fill().map(() => Array(rows)); 
// boardPices[i][j] = Coloana i de la stanga la dreapta si linia j de jos in sus
console.log(boardPieces);

const lastCellColumn = Array(columns).fill().map(()=> -1);
console.log(lastCellColumn);    
// lastCellColumn[col] = ultima pozitie la care a fost pusa o piesa 
// -1 inseamna ca nu a fost pus nimic si rows inseamna ca e plin

// returnez o functie care are alta functie lol
// nu inteleg exact cum functioneaza asta dar merge

let gameEnded = false;

let playerTurnColor = 'red';

const wonMessageText = document.querySelector("#win-message");

function resetGame(){
    gameEnded = false;
    clearBoard();
    playerTurnColor = 'red';
    wonMessageText.style.display = "none";
}

function changeColor(){
    if(playerTurnColor == 'red')
        playerTurnColor = 'yellow';
    else{
        playerTurnColor = "red";
    }
}


function handleWonGame(){
    wonMessageText.style.display = "block";
    document.querySelector("#win-player").innerHTML = playerTurnColor;
}
function sameColor(column,row){
    console.log(boardPieces[column][row].style.backgroundColor,playerTurnColor,boardPieces[column][row].style.backgroundColor == playerTurnColor);
    if(boardPieces[column][row].style.backgroundColor == playerTurnColor)
        return true;
    return false;
}
function isOnBoard(column,row){
    if(0 <= column && column < columns && 0 <= row && row < rows)
        return true;
    return false;
}
function okColor(column,row){
    if(isOnBoard(column,row) && sameColor(column,row))
        return true;
    return false;
}
function changeWinningPiece(column,row){
    boardPieces[column][row].style.outline = "2px solid black";
}
function checkWinLines(column,row,dcol,drow){
    let left = 0,right = 3;
    for(let position = 1; position <= 4; position++){
        let col = column;
        let r = row;
        let win = true;
        const positions = []
        for(let x = 1; x <= left; x++){
            col -= dcol;  
            r += drow; 
            if(!okColor(col,r))
                win = false;
            positions.push({
                "col":col,
                "row":r,
            });
        }       

        col = column;
        r = row;
        for(let x = 1; x <= right; x++){
            col += dcol;   
            r -= drow;
            if(!okColor(col,r))
                win = false;
            positions.push({
                "col":col,
                "row":r,
            });
        }
        if(win == true){
            changeWinningPiece(column,row);
            for(let pos of positions){
                changeWinningPiece(pos.col,pos.row);
            }
            gameEnded = true;
            handleWonGame();
            return true;
        }
        left ++;
        right--;
    }
    return false;
}

// 2px solid black
function checkWin(column,row){
    if(checkWinLines(column,row,1,0) || checkWinLines(column,row,0,1) 
    || checkWinLines(column,row,-1,-1) || checkWinLines(column,row,1,-1))
        return true;
    return false;
}
function doSomething(column){
    return function clickColumn(){
        if(gameEnded == true)
            return;
        const goodIndex = lastCellColumn[column] + 1;
        if(goodIndex < rows){
            boardPieces[column][goodIndex].style.backgroundColor = playerTurnColor;
            checkWin(column,goodIndex);
            
            lastCellColumn[column] += 1;
            changeColor(); // change the color of the next turn
        }
    }
}
function clearBoard(){
    for(let column = 0; column < columns; column++){
        for(let row = 0; row < rows; row++){
            boardPieces[column][row].style.backgroundColor = 'white';
            boardPieces[column][row].style.outline = '';

        }
        lastCellColumn[column] = -1;
    }
}


function createBoard() {
    const board = document.querySelector("#board");
    for (let column = 0; column < columns; column++) {
        const boardColumn = document.createElement("div");
        boardColumn.className = "board-column";
        for (let row = 0; row < rows; row++) {
            const boardCell = document.createElement("div");
            boardCell.className = "board-cell";
            boardColumn.appendChild(boardCell);
            boardPieces[column][rows - row - 1] = boardCell;
        }
        const func = doSomething(column);
        boardColumn.addEventListener('click',func); // nu poti pune parametru la functie cand o chemi
        board.appendChild(boardColumn);
    }
}
createBoard();
