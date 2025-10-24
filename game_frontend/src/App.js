import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './App.css';
import './styles/theme.css';
import Board from './components/Board';
import StatusBar from './components/StatusBar';

/**
 * Root Game component controlling Tic Tac Toe game state and flow.
 * Retro-themed styling is applied via theme.css.
 *
 * Usage notes:
 * - Mode toggle allows Two Players (PvP) or Single Player (PvE).
 * - In Single Player mode: human is X (goes first), AI is O and plays after 300ms delay.
 * - StatusBar reflects mode and whose turn it is.
 * - Reset returns to a fresh board with X to move.
 */
// PUBLIC_INTERFACE
function App() {
  // Internal board is an array of 9 cells with values: 'X' | 'O' | null
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // Game mode: 'pvp' for Two Players; 'pve' for Single Player vs AI
  const [mode, setMode] = useState('pvp'); // 'pvp' | 'pve'

  // Prevent user input during AI turn
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Compute winner and draw states
  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const isDraw = useMemo(
    () => !winner && squares.every(Boolean),
    [winner, squares]
  );

  const currentPlayer = xIsNext ? 'X' : 'O';

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    // Ignore click if square occupied, game over, or AI is thinking
    if (squares[index] || winner || (mode === 'pve' && isAiThinking)) return;

    // In PvE, ensure it's human turn (human is X)
    if (mode === 'pve' && !xIsNext) return;

    const next = squares.slice();
    next[index] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext(!xIsNext);
  };

  // AI move selection with simple heuristic (center > corners > edges)
  const selectAiMove = useCallback((board) => {
    const available = board
      .map((v, i) => (v === null ? i : null))
      .filter((i) => i !== null);

    if (available.length === 0) return null;

    // Heuristic order
    const center = [4];
    const corners = [0, 2, 6, 8];
    const edges = [1, 3, 5, 7];

    const pickFrom = (candidates) => candidates.find((i) => available.includes(i));

    // Try center, then corners, then edges
    const best =
      pickFrom(center) ??
      pickFrom(corners) ??
      pickFrom(edges);

    // Fallback to random if something goes off
    return best ?? available[Math.floor(Math.random() * available.length)];
  }, []);

  // Trigger AI move after human plays, if game isn't over
  useEffect(() => {
    if (mode !== 'pve') return;
    if (winner || isDraw) {
      setIsAiThinking(false);
      return;
    }

    // If it's AI's turn (O), schedule a move
    if (!xIsNext) {
      setIsAiThinking(true);
      const tid = setTimeout(() => {
        setSquares((prev) => {
          // Re-check game state just before moving
          if (calculateWinner(prev) || prev.every(Boolean)) {
            setIsAiThinking(false);
            return prev;
          }
          const aiIndex = selectAiMove(prev);
          if (aiIndex === null || prev[aiIndex] !== null) {
            setIsAiThinking(false);
            return prev;
          }
          const next = prev.slice();
          next[aiIndex] = 'O';
          return next;
        });
        setXIsNext(true);
        setIsAiThinking(false);
      }, 300);

      return () => clearTimeout(tid);
    } else {
      // Human's turn
      setIsAiThinking(false);
    }
  }, [mode, xIsNext, winner, isDraw, selectAiMove]);

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true); // X always starts
    setIsAiThinking(false);
  };

  // PUBLIC_INTERFACE
  const toggleMode = () => {
    // Switch mode and reset to keep logic simple and predictable
    setMode((m) => (m === 'pvp' ? 'pve' : 'pvp'));
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setIsAiThinking(false);
  };

  const isBoardDisabled = Boolean(winner) || isDraw || (mode === 'pve' && isAiThinking);

  return (
    <div className="retro-app">
      <div className="game-wrapper">
        <h1 className="retro-title">Tic Tac Toe</h1>

        <div className="mode-toggle" role="group" aria-label="Game mode toggle">
          <button
            className={`btn-toggle ${mode === 'pvp' ? 'active' : ''}`}
            onClick={toggleMode}
            aria-pressed={mode === 'pvp'}
            title="Switch to Single Player"
          >
            Two Players
          </button>
          <button
            className={`btn-toggle ${mode === 'pve' ? 'active' : ''}`}
            onClick={toggleMode}
            aria-pressed={mode === 'pve'}
            title="Switch to Two Players"
          >
            Single Player
          </button>
        </div>

        <StatusBar
          winner={winner}
          isDraw={isDraw}
          currentPlayer={currentPlayer}
          mode={mode}
          isAiThinking={isAiThinking}
        />

        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          disabled={isBoardDisabled}
        />

        <div className="controls">
          <button className="btn-reset" onClick={resetGame} aria-label="Start a new game">
            ↻ New Game
          </button>
        </div>
        <footer className="footnote">
          {mode === 'pvp'
            ? 'Two players on one device. Be nice!'
            : 'Single Player: You are X. The AI (O) moves after you.'}
        </footer>
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
