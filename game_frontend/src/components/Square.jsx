import React from 'react';

/**
 * Single cell in the 3x3 Tic Tac Toe board.
 * @param {{value: 'X'|'O'|null, onClick: () => void}} props
 */
const Square = ({ value, onClick }) => {
  return (
    <button
      className={`square ${value === 'X' ? 'square-x' : value === 'O' ? 'square-o' : ''}`}
      onClick={onClick}
      role="gridcell"
      aria-label={`Cell ${value ? value : 'empty'}`}
    >
      {value}
    </button>
  );
};

export default Square;
