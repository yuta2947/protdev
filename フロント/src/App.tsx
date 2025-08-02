import { useState } from 'react';
import React from 'react';
import axios from 'axios';

export default function Game() {
  const [history, setHistory] = useState([Array(25).fill(null)]);
  const [xIsNext, setXIsNext] = useState(true);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setXIsNext(prevXIsNext => !prevXIsNext);
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
  const [isAiThinking, setIsAiThinking] = useState(false);
  async function callAiApi(nextSquares: string[]) {
    try {
      const aiRes = await axios.post('http://localhost:3000/api', {
        text: nextSquares,
      });
      console.log('Response:',JSON.stringify(aiRes.data.received.text))
      console.log('Response:',JSON.stringify(aiRes.data.received.timestamp))
      const coordinateText = aiRes.data.received.text;
      const match  = coordinateText.match(/\[(\d+),(\d+)\]/);
      if (match) {
        const row = parseInt(match[1]);
        const col = parseInt(match[2]);
        return row * 5 + col;
      }
      throw new Error('無効な座標形式');
    } catch (error) {
      console.error('エラー:', error);
      throw error;
    }
  }

   async function handleClick(i: number) {
    if (isAiThinking || squares[i] || calculateWinner(squares) || !xIsNext) {
      return;
    }

    const nextSquares: string[] = squares.slice();
    nextSquares[i] = 'X';
    onPlay(nextSquares);

    if (calculateWinner(nextSquares)) {
      return;
    }

    setIsAiThinking(true);
    try {
      const aiPosition = await callAiApi(nextSquares);
      const aiSquares = [...nextSquares];
      aiSquares[aiPosition] = 'O';
      onPlay(aiSquares);
      
      if (calculateWinner(aiSquares)) {
        return; 
      }
    } catch (error) {
      console.error('AI処理エラー:', error);
    } finally {
      setIsAiThinking(false);
    }
  }
    

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
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
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function calculateWinner(squares) {
  const size = 5;
  const lines: number[][] = [];

  for (let row = 0; row < size; row++) {
    lines.push([...Array(size)].map((_, col) => row * size + col));
  }

  for (let col = 0; col < size; col++) {
    lines.push([...Array(size)].map((_, row) => row * size + col));
  }

  lines.push([...Array(size)].map((_, i) => i * size + i));
  lines.push([...Array(size)].map((_, i) => i * size + (size - 1 - i)));

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d, e] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c] &&
      squares[a] === squares[d] &&
      squares[a] === squares[e]
    ) {
      return squares[a];
    }
  }
  return null;
}
