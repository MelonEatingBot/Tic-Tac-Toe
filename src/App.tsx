import React, {useState, useEffect} from 'react';
import './App.css';
import {checkGameState, endBoardState, getBotDecision} from './functions';

type boardProps = {cells: string[], onClick: (i: number) => void};
type cellProps = {cellState: string, onClick: () => void};
type scoreBoardProps = {multiPlayer: boolean, value: number[], reset: () => void};

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
    else if (cellState === "#") {
      className = className + " suggestion";
      disabled = false;
    }
    else
      value = cellState;
  }

  if (value === "O")
    className = className + " blue";
  else if (value === "X")
    className = className + " red";

  return(
    <button className={className} onClick={onClick} disabled={disabled}>
      {value}
    </button>
  ); 
}

function ScoreBoard({multiPlayer, value, reset}: scoreBoardProps) {
  return (
    <table>
      <thead>
        <tr><th colSpan={3}>Score Board</th></tr>
      </thead>
      <tbody>
        <tr><td>Player (O)</td><td>{multiPlayer?"Player (X)":"Bot (X)"}</td><td>Draw</td></tr>
        <tr><td>{value[0]}</td><td>{value[1]}</td><td>{value[2]}</td></tr>
        <tr><td colSpan={3} id="buttons"><button onClick={reset}>Reset Score</button></td></tr>
      </tbody>
    </table>
  );
}

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [moves, setMoves] = useState(Array(9).fill(-1));
  const [score, setScore] = useState(Array(3).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState("O");
  const [botPlayer, setBotPlayer] = useState("X");
  const [winner, setWinner] = useState("");
  const [suggestion, setSuggestion] = useState(-1);
  const [multiPlayerMode, setmultiPlayerMode] = useState(false);
  
  const click = (i: number) => {
    play(i);
  };

  const botMove = () => {
    let botDecision = getBotDecision(board, currentPlayer, moves);
    play(botDecision);
  };

  const play = (i: number) => {
    let boardCopy = board;
    let movesCopy = moves;
    if (suggestion !== -1) {
      boardCopy[suggestion] = null;
      setSuggestion(-1);
    }
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
    else{
      boardCopy = endBoardState(boardCopy, gameState[1]);
      setWinner(gameState[0]);
      let scoreCopy = score;
      if (gameState[0]==="Draw")
        scoreCopy[2] = scoreCopy[2]+1;
      else if (gameState[0]==="O") {
        scoreCopy[0] = scoreCopy[0]+1;
        setCurrentPlayer("X");
      }
      else {
        scoreCopy[1] = scoreCopy[1]+1;
        setCurrentPlayer("O");
      }
      setScore(scoreCopy);
    } 
    setBoard(boardCopy);
  }

  const resetBoard = () => {
    let gameState = checkGameState(board);
    console.log(gameState)
    if (!gameState[0]) {
      if (moves.findIndex((x: number) => x===-1) % 2 === 1) {
        if (currentPlayer === "O")
          setCurrentPlayer("X");
        else
          setCurrentPlayer("O");
      }
    }
    setBoard(Array(9).fill(null));
    setMoves(Array(9).fill(-1));
    setWinner("");
  } ;

  const getSuggestion = () => {
    console.log("suggestion")
    let boardCopy = board;
    if (suggestion !== -1)
      boardCopy[suggestion] = null;
    let botDecision = getBotDecision(board, currentPlayer, moves);
    boardCopy[botDecision] = "#";
    setBoard(boardCopy);
    setSuggestion(botDecision);
  }

  const resetScore = () => {
    setScore([0,0,0]);
  };

  useEffect(
    () => {
      if (!multiPlayerMode && currentPlayer===botPlayer && !winner)
        botMove();
    }
  );

  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      <p>{winner?(winner==="Draw"?winner:((!multiPlayerMode&&(winner===botPlayer))?"Bot ("+winner+") wins":"Player ("+winner+") wins"))
      :(multiPlayerMode?"Player "+currentPlayer+"'s turn":(currentPlayer===botPlayer?"Bot's turn ("+botPlayer+")":"Player's turn ("+currentPlayer+")"))}</p>
      <Board cells={board} onClick={click} />
      <div id="buttons">
        <button onClick={resetBoard}>Restart</button>
        <button disabled={winner?true:false} onClick={getSuggestion}>Suggestion</button>
      </div>
      <ScoreBoard multiPlayer={multiPlayerMode} value={score} reset={resetScore}/>
    </div>
  );
}

export default App;