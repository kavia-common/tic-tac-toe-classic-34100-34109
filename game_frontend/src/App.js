import React, { useState, useMemo } from 'react';
import './App.css';
import './styles/theme.css';
import Board from './components/Board';
import StatusBar from './components/StatusBar';

/**
 * Root Game component controlling Tic Tac Toe game state and flow.
 * Retro-themed styling is applied via theme.css.
 */
// PUBLIC_INTERFACE
function App() {
  // Internal board is an array of 9 cells with values: 'X' | 'O' | null
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // Compute winner and draw states
  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const isDraw = useMemo(
    () => !winner && squares.every(Boolean),
    [winner, squares]
  );

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    // Ignore click if square occupied or game over
    if (squares[index] || winner) return;

    const next = squares.slice();
    next[index] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  const currentPlayer = xIsNext ? 'X' : 'O';

  return (
    <div className="retro-app">
      <div className="game-wrapper">
        <h1 className="retro-title">Tic Tac Toe</h1>
        <StatusBar
          winner={winner}
          isDraw={isDraw}
          currentPlayer={currentPlayer}
        />
        <Board squares={squares} onSquareClick={handleSquareClick} />
        <div className="controls">
          <button className="btn-reset" onClick={resetGame} aria-label="Start a new game">
            ↻ New Game
          </button>
        </div>
        <footer className="footnote">Two players on one device. Be nice!</footer>
      </div>
    </div>
  );
}

/**
 * Determine the winner given the board.
 * @param {Array<('X'|'O'|null)>} sq
 * @returns {'X'|'O'|null}
 */
function calculateWinner(sq) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ];
  for (const [a,b,c] of lines) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
      return sq[a];
    }
  }
  return null;
}

export default App;
