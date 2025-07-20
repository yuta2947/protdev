import { useState } from "react";
import React from 'react';

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [xIsNext, setXIsNext] = useState(true);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setXIsNext(nextMove % 2 === 0);
  }

  const moves = history.map((squares, move) => {

    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
      <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function Board({ xIsNext, squares, onPlay }) {

  function handleClick (i) {
    const nextSquares = squares.slice();
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
   
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);

  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: "+ winner;
  } else {
    status ="Next player: "+ (xIsNext ? "X" : "O")
  }
  
  return (
    <>
      <div className="status">{status}</div>
      {[...Array(5)].map((_, row) => (
    <div key={row} className="board-row">
      {[...Array(5)].map((_, col) => {
        const index = row * 5 + col;
        return (
          <Square
            key={index}
            value={squares[index]}
            onSquareClick={() => handleClick(index)}
          />
        );
      })}
    </div>
    ))}
    </>
  );
}

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>{value}</button>
  );
}



function calculateWinner (squares) {
  const size = 5;
  const lines: number[][] = [];
  
  for (let row =0; row < size; row++) {
    lines.push([...Array(size)].map((_, col) => row * size + col));
  }

  for (let col = 0; col < size; col++) {
    lines.push([...Array(size)].map((_, row) => row * size + col));
  }

  lines.push([...Array(size)].map((_, i) => i * size + i));
  lines.push([...Array(size)].map((_, i) => i * size + (size - 1 - i)));


  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d, e] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d] && squares[a] === squares[e]) {
      return squares[a];
    }
  }
  return null;
}

