import React from 'react';

/**
 * Status bar showing current player, winner, or draw.
 * @param {{
 *  winner: 'X'|'O'|null,
 *  isDraw: boolean,
 *  currentPlayer: 'X'|'O',
 *  mode?: 'pvp'|'pve',
 *  isAiThinking?: boolean
 * }} props
 */
const StatusBar = ({ winner, isDraw, currentPlayer, mode = 'pvp', isAiThinking = false }) => {
  let statusClass = 'status';
  let text = '';

  if (winner) {
    statusClass += ' status-win';
    text = `Player ${winner} wins!`;
  } else if (isDraw) {
    statusClass += ' status-draw';
    text = `It's a draw!`;
  } else {
    statusClass += ' status-turn';
    if (mode === 'pve') {
      if (currentPlayer === 'X') {
        text = `Single Player • Your turn (X)`;
      } else {
        text = isAiThinking ? `Single Player • AI is thinking…` : `Single Player • AI's turn (O)`;
      }
    } else {
      text = `Two Players • Player ${currentPlayer}'s turn`;
    }
  }

  return (
    <div className={statusClass} role="status" aria-live="polite">
      {text}
    </div>
  );
};

export default StatusBar;
