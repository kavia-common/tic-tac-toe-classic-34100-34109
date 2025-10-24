import React from 'react';
import Square from './Square';

/**
 * Board component renders 9 squares in a 3x3 grid.
 * @param {{
 *  squares: Array<'X'|'O'|null>,
 *  onSquareClick: (index:number) => void,
 *  disabled?: boolean
 * }} props
 */
const Board = ({ squares, onSquareClick, disabled = false }) => {
  // Render one square
  const renderSquare = (i) => (
    <Square
      key={i}
      value={squares[i]}
      onClick={() => !disabled && onSquareClick(i)}
      disabled={disabled || Boolean(squares[i])}
    />
  );

  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board" aria-disabled={disabled}>
      <div className="board-row" role="row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row" role="row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row" role="row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
};

export default Board;
