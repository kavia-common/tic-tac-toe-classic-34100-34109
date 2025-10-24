import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
 * - Sound: Retro move/win/draw effects with a Mute toggle. Mute persists per session via localStorage (key: "ttt-muted").
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

  // Sound & mute state (persisted)
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem('ttt-muted') === '1';
    } catch {
      return false;
    }
  });

  // Create Audio elements via refs to avoid re-creating on every render
  const moveAudioRef = useRef(null);
  const winAudioRef = useRef(null);
  const drawAudioRef = useRef(null);

  // Debounce guard to prevent stacking on rapid clicks
  const lastMovePlayedAtRef = useRef(0);

  // Initialize audio only once
  useEffect(() => {
    // Use small mp3s placed in public/assets/sounds/
    moveAudioRef.current = new Audio('/assets/sounds/move.mp3');
    winAudioRef.current = new Audio('/assets/sounds/win.mp3');
    drawAudioRef.current = new Audio('/assets/sounds/draw.mp3');

    // Slightly lower the volume to keep it subtle
    if (moveAudioRef.current) moveAudioRef.current.volume = 0.4;
    if (winAudioRef.current) winAudioRef.current.volume = 0.55;
    if (drawAudioRef.current) drawAudioRef.current.volume = 0.45;

    // Do not loop
    if (moveAudioRef.current) moveAudioRef.current.loop = false;
    if (winAudioRef.current) winAudioRef.current.loop = false;
    if (drawAudioRef.current) drawAudioRef.current.loop = false;

    return () => {
      // Cleanup references to help GC
      moveAudioRef.current = null;
      winAudioRef.current = null;
      drawAudioRef.current = null;
    };
  }, []);

  // Persist mute flag
  useEffect(() => {
    try {
      localStorage.setItem('ttt-muted', muted ? '1' : '0');
    } catch {
      // ignore
    }
  }, [muted]);

  // Compute winner and draw states
  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const isDraw = useMemo(
    () => !winner && squares.every(Boolean),
    [winner, squares]
  );

  const currentPlayer = xIsNext ? 'X' : 'O';

  // Play helper functions (guard against stacking and mute)
  const playMove = useCallback(() => {
    if (muted) return;
    const now = Date.now();
    if (now - lastMovePlayedAtRef.current < 60) {
      // Prevent stacking if another move sound was just played
      return;
    }
    lastMovePlayedAtRef.current = now;
    const el = moveAudioRef.current;
    if (el) {
      try {
        // Restart from beginning
        el.currentTime = 0;
        // Stop if currently playing to avoid overlap
        el.pause();
        el.play().catch(() => {});
      } catch {
        // ignore play failures
      }
    }
  }, [muted]);

  const playWin = useCallback(() => {
    if (muted) return;
    const el = winAudioRef.current;
    if (el) {
      try {
        el.currentTime = 0;
        el.pause();
        el.play().catch(() => {});
      } catch {
        // ignore
      }
    }
  }, [muted]);

  const playDraw = useCallback(() => {
    if (muted) return;
    const el = drawAudioRef.current;
    if (el) {
      try {
        el.currentTime = 0;
        el.pause();
        el.play().catch(() => {});
      } catch {
        // ignore
      }
    }
  }, [muted]);

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
    // Play move sound on valid human move
    playMove();
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
          // Play move sound for AI move too
          playMove();
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
  }, [mode, xIsNext, winner, isDraw, selectAiMove, playMove]);

  // Outcome sounds: fire once when a terminal state is first reached
  const terminalPlayedRef = useRef(false);
  useEffect(() => {
    if (winner) {
      if (!terminalPlayedRef.current) {
        playWin();
        terminalPlayedRef.current = true;
      }
    } else if (isDraw) {
      if (!terminalPlayedRef.current) {
        playDraw();
        terminalPlayedRef.current = true;
      }
    } else {
      // Reset terminal state when game isn't over
      terminalPlayedRef.current = false;
    }
  }, [winner, isDraw, playWin, playDraw]);

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true); // X always starts
    setIsAiThinking(false);
    // also clear terminal guard so new game can play outcome later
    terminalPlayedRef.current = false;
  };

  // PUBLIC_INTERFACE
  const toggleMode = () => {
    // Switch mode and reset to keep logic simple and predictable
    setMode((m) => (m === 'pvp' ? 'pve' : 'pvp'));
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setIsAiThinking(false);
    terminalPlayedRef.current = false;
  };

  // PUBLIC_INTERFACE
  const toggleMute = () => {
    setMuted((m) => !m);
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

        <div className="controls" style={{ gap: 8 }}>
          <button className="btn-reset" onClick={resetGame} aria-label="Start a new game">
            ↻ New Game
          </button>
          <button
            className="btn-toggle"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            style={{ minWidth: 90 }}
          >
            {muted ? '🔇 Mute' : '🔊 Sound'}
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
