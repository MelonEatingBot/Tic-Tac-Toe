import React, {useState} from 'react';
import './App.css';
import {checkGameState, endBoardState, getBotDecision} from './functions';

type boardProps = {cells: string[], onClick: (i: number) => void};
type cellProps = {cellState: string, onClick: () => void, }

function Board ({ cells, onClick }: boardProps) {
  return (
    <div className="Board">
      {cells.map((cell, i) => (
        <Square key={i} cellState={cell} onClick={() => onClick(i)} />
      ))}
    </div>
  );
}

function Square ({ cellState, onClick }: cellProps) {
  let className: string = "Cell";
  let disabled = cellState ? true : false;
  let value: string = "";

  if (cellState)
  {
    if (cellState.startsWith("*")) {
      value = cellState.substring(1);
      className = className + " highlight";
    }
    else if (cellState === "-")
      value = "";
    else
      value = cellState;
  }

  return(
    <button className={className} onClick={onClick} disabled={disabled}>
      {value}
    </button>
  ); 
}

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [moves, setMoves] = useState(Array(9).fill(-1));
  const [currentPlayer, setCurrentPlayer] = useState("O");
  const [singlePlayerMode, setSinglePlayerMode] = useState(true);
  
  const click = (i: number) => {
    let boardCopy = board;
    let movesCopy = moves;
    boardCopy[i] = currentPlayer;
    movesCopy[movesCopy.findIndex((x: number) => x===-1)] = i;
    setMoves(movesCopy);
    let gameState = checkGameState(board);
    if (!gameState[0]) {
      if (currentPlayer === "O")
        setCurrentPlayer("X");
      else
        setCurrentPlayer("O");
    }
    else
      boardCopy = endBoardState(boardCopy, gameState[1]);
    setBoard(boardCopy);
    if (singlePlayerMode) {
      let botDecision = getBotDecision(board, currentPlayer, moves);
      boardCopy[botDecision] = currentPlayer;
      movesCopy[movesCopy.findIndex((x: number) => x===-1)] = botDecision;
      setMoves(movesCopy);
      gameState = checkGameState(board);
      if (!gameState[0]) {
        if (currentPlayer === "O")
          setCurrentPlayer("X");
        else
          setCurrentPlayer("O");
      }
      else
        boardCopy = endBoardState(boardCopy, gameState[1]);
      setBoard(boardCopy);
    }
  };

  return (
    <div className="App">
      <Board cells={board} onClick={click} />
    </div>
  );
}



export default App;
