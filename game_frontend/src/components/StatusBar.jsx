import React from 'react';

/**
 * Status bar showing current player, winner, or draw.
 * @param {{winner: 'X'|'O'|null, isDraw: boolean, currentPlayer: 'X'|'O'}} props
 */
const StatusBar = ({ winner, isDraw, currentPlayer }) => {
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
    text = `Player ${currentPlayer}'s turn`;
  }

  return (
    <div className={statusClass} role="status" aria-live="polite">
      {text}
    </div>
  );
};

export default StatusBar;
