import React, { useState } from 'react';
import './styles.css';

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button
      className={`square ${isWinning ? 'winning-square' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, winningSquares }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i);
  }

  const winnerInfo = calculateWinner(squares);
  let status;
  if (winnerInfo) {
    status = 'Winner: ' + winnerInfo.winner;
  } else if (squares.every(square => square !== null)) {
    status = 'Game ended in a draw!';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  // Feature 2: Use loops instead of hardcoding squares
  const renderSquare = (i) => {
    const isWinning = winningSquares && winningSquares.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        isWinning={isWinning}
      />
    );
  };

  const rows = [];
  for (let row = 0; row < 3; row++) {
    const squaresInRow = [];
    for (let col = 0; col < 3; col++) {
      squaresInRow.push(renderSquare(row * 3 + col));
    }
    rows.push(
      <div key={row} className="board-row">
        {squaresInRow}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {rows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), move: null }]);
  const [currentStepNumber, setCurrentStepNumber] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const currentSquares = history[currentStepNumber].squares;
  const xIsNext = currentStepNumber % 2 === 0;

  function handlePlay(nextSquares, moveIndex) {
    const nextHistory = [...history.slice(0, currentStepNumber + 1), { squares: nextSquares, move: moveIndex }];
    setHistory(nextHistory);
    setCurrentStepNumber(nextHistory.length - 1);
  }

  function jumpTo(nextStepNumber) {
    setCurrentStepNumber(nextStepNumber);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  // Feature 5: Display location for each move
  function getMoveLocation(moveIndex) {
    if (moveIndex === null) return '';
    const row = Math.floor(moveIndex / 3) + 1;
    const col = (moveIndex % 3) + 1;
    return `(${row}, ${col})`;
  }

  const moves = history.map((step, move) => {
    let description;
    if (move > 0) {
      const location = getMoveLocation(step.move);
      description = `Go to move #${move} ${location}`;
    } else {
      description = 'Go to game start';
    }

    // Feature 1: Show current move differently
    if (move === currentStepNumber) {
      return (
        <li key={move}>
          <span className="current-move">You are at move #{move}</span>
        </li>
      );
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  // Feature 3: Sort moves in ascending or descending order
  const sortedMoves = isAscending ? moves : moves.slice().reverse();

  // Feature 4: Calculate winning squares
  const winnerInfo = calculateWinner(currentSquares);
  const winningSquares = winnerInfo ? winnerInfo.line : null;

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          winningSquares={winningSquares}
        />
      </div>
      <div className="game-info">
        <div>
          <button onClick={toggleSortOrder}>
            Sort moves: {isAscending ? 'Ascending' : 'Descending'}
          </button>
        </div>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
}

// Feature 4: Modified calculateWinner to return winning line
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: [a, b, c]
      };
    }
  }
  return null;
}