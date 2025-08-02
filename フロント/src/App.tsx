import { useState } from 'react';
import React from 'react';
import axios from 'axios';
import './App.css';

export default function Game() {
  const [history, setHistory] = useState<(string | null)[][]>([
    Array(25).fill(null),
  ]);
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [currentMove, setCurrentMove] = useState<number>(0);
  const currentSquares = history[currentMove];
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setXIsNext((prevXIsNext) => !prevXIsNext);
  }

  function jumpTo(nextMove: number) {
    if (isAiThinking) {
      return;
    }
    setCurrentMove(nextMove);
    setXIsNext(true);
  }

  const moves = history.map((_, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button
          onClick={() => jumpTo(move)}
          disabled={isAiThinking}
          style={{
            opacity: isAiThinking ? 0.5 : 1,
            cursor: isAiThinking ? 'not-allowed' : 'pointer',
          }}
        >
          {description}
        </button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          isAiThinking={isAiThinking}
          setIsAiThinking={setIsAiThinking}
        />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (squares: (string | null)[]) => void;
  isAiThinking: boolean;
  setIsAiThinking: (thinking: boolean) => void;
}

function Board({
  xIsNext,
  squares,
  onPlay,
  isAiThinking,
  setIsAiThinking,
}: BoardProps) {
  async function callAiApi(nextSquares: (string | null)[]): Promise<number> {
    try {
      const boardString = formatBoardForAI(nextSquares);
      const aiRes = await axios.post('http://localhost:3000/api', {
        text: boardString,
      });
      console.log('Response:', JSON.stringify(aiRes.data.received.text));
      console.log('Response:', JSON.stringify(aiRes.data.received.timestamp));
      const coordinateText = aiRes.data.received.text;
      const match = coordinateText.match(/\[(\d+),(\d+)\]/);
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

  function formatBoardForAI(squares: (string | null)[]): string {
    let boardString = '盤面の状態:\n';
    boardString += ' 0 1 2 3 4\n';

    for (let row = 0; row < 5; row++) {
      boardString += `${row} `;
      for (let col = 0; col < 5; col++) {
        const index = row * 5 + col;
        const value = squares[index];
        boardString += (value || '.') + ' ';
      }
      boardString += '\n';
    }
    return boardString;
  }

  async function handleClick(i: number) {
    if (isAiThinking || squares[i] || calculateWinner(squares) || !xIsNext) {
      return;
    }

    const nextSquares: (string | null)[] = squares.slice();
    nextSquares[i] = 'X';
    onPlay(nextSquares);

    if (calculateWinner(nextSquares)) {
      return;
    }

    setIsAiThinking(true);
    try {
      await executeAiMove(nextSquares);
    } catch (error) {
      console.error('AI処理エラー:', error);
    } finally {
      setIsAiThinking(false);
    }
  }

  async function executeAiMove(
    currentSquares: (string | null)[],
  ): Promise<void> {
    const maxRetries = 5;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const aiPosition = await callAiApi(currentSquares);

        if (aiPosition < 0 || aiPosition >= 25) {
          console.warn(
            `AIが無効な座標を選択: ${aiPosition}. 再試行します (${
              retryCount + 1
            }/${maxRetries})`,
          );
          retryCount++;
          continue;
        }

        if (currentSquares[aiPosition] !== null) {
          console.warn(
            `AIが占有済みの座標を選択: ${aiPosition}.再試行します (${
              retryCount + 1
            }/${maxRetries})`,
          );
          retryCount++;
          continue;
        }

        const aiSquares = [...currentSquares];
        aiSquares[aiPosition] = 'O';
        onPlay(aiSquares);

        if (calculateWinner(aiSquares)) {
          return;
        }
        return;
      } catch (error) {
        console.error(
          `AI API呼び出しエラー  (試行 ${retryCount + 1}/${maxRetries}):`,
          error,
        );
        retryCount++;

        if (retryCount >= maxRetries) {
          throw new Error('AI思考の最大試行回数に達しました');
        }
      }
    }
    console.warn(
      'AIが有効な手を見つけられませんでした。ランダムな手を選択します。',
    );
    executeRandomMove(currentSquares);
  }

  function executeRandomMove(currentSquares: (string | null)[]): void {
    const availablePositions = currentSquares
      .map((square, index) => (square === null ? index : null))
      .filter((position) => position !== null) as number[];

    if (availablePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const randomPosition = availablePositions[randomIndex];

      const aiSquares = [...currentSquares];
      aiSquares[randomPosition] = 'O';
      onPlay(aiSquares);

      console.log(
        `フォールバック: ランダム座標 ${randomPosition} を選択しました`,
      );
    }
  }

  const winner = calculateWinner(squares);
  let status: string | React.ReactElement;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (isAiThinking) {
    status = (
      <span className="ai-thinking">
        AI思考中
        <span className="dots">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </span>
      </span>
    );
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

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
}

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function calculateWinner(squares: (string | null)[]): string | null {
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
