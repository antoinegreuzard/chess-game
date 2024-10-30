// ai.test.ts
import { Board } from '../src/board';
import { AI } from '../src/ai';
import { Pawn } from '../src/pieces/pawn';
import { PieceColor } from '../src/piece';
import { King } from '../src/pieces/king';
import { Rook } from '../src/pieces/rook';
import { Queen } from '../src/pieces/queen';

describe('AI', () => {
  let board: Board;
  let ai: AI;

  function clearBoard() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        board.setPiece(x, y, null);
      }
    }
  }

  beforeEach(async () => {
    board = new Board();
    await board.init();
    ai = new AI(PieceColor.BLACK);
    clearBoard();
  });

  it('should make a move without capture when no capture is possible', () => {
    board.setPiece(1, 1, new Pawn(PieceColor.BLACK));
    const bestMove = ai.makeMove(board);
    expect(bestMove).toBeDefined();
    expect(
      board.isCapture(
        bestMove!.fromX,
        bestMove!.fromY,
        bestMove!.toX,
        bestMove!.toY,
      ),
    ).toBe(false);
  });

  it('should make no move when checkmate is inevitable', () => {
    board.setPiece(0, 0, new King(PieceColor.BLACK));
    board.setPiece(1, 2, new Queen(PieceColor.WHITE));
    board.setPiece(2, 2, new Rook(PieceColor.WHITE));
    const bestMove = ai.makeMove(board);
    expect(bestMove).toBeNull(); // Aucun mouvement possible en cas de mat
  });
});
