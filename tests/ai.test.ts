// ai.test.ts
import { Board } from '../src/board';
import { AI } from '../src/ai';
import { Pawn } from '../src/pieces/pawn';
import { PieceColor } from '../src/piece';
import { King } from '../src/pieces/king';
import { Rook } from '../src/pieces/rook';
import { Queen } from '../src/pieces/queen';
import { Knight } from '../src/pieces/knight';

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

  beforeEach(() => {
    board = new Board();
    ai = new AI(PieceColor.BLACK);
    clearBoard();
  });

  it('should make a move without capture when no capture is possible', () => {
    board.setPiece(1, 1, new Pawn(PieceColor.BLACK));
    const bestMove = ai.makeMove(board);
    expect(bestMove).toBeDefined();
    expect(board.isCapture(bestMove!.fromX, bestMove!.fromY, bestMove!.toX, bestMove!.toY)).toBe(false);
  });

  it('should choose a capture move when possible', () => {
    board.setPiece(0, 1, new Rook(PieceColor.BLACK));
    board.setPiece(0, 2, new Queen(PieceColor.WHITE));
    const bestMove = ai.makeMove(board);
    expect(bestMove).toBeDefined();
    expect(board.isCapture(bestMove!.fromX, bestMove!.fromY, bestMove!.toX, bestMove!.toY)).toBe(true);
  });

  it('should prioritize center control if no captures are available', () => {
    board.setPiece(3, 6, new Knight(PieceColor.BLACK)); // Position éloignée
    const bestMove = ai.makeMove(board);
    expect(bestMove).toBeDefined();
    expect(bestMove?.toX).toBeGreaterThanOrEqual(2);
    expect(bestMove?.toX).toBeLessThanOrEqual(5);
    expect(bestMove?.toY).toBeGreaterThanOrEqual(2);
    expect(bestMove?.toY).toBeLessThanOrEqual(5); // Centre de l'échiquier
  });

  it('should make no move when checkmate is inevitable', () => {
    board.setPiece(0, 0, new King(PieceColor.BLACK));
    board.setPiece(1, 2, new Queen(PieceColor.WHITE));
    board.setPiece(2, 2, new Rook(PieceColor.WHITE));
    const bestMove = ai.makeMove(board);
    expect(bestMove).toBeNull(); // Aucun mouvement possible en cas de mat
  });

  it('should apply quiescence search to handle complex positions with captures', () => {
    board.setPiece(3, 3, new King(PieceColor.BLACK));
    board.setPiece(2, 2, new Pawn(PieceColor.WHITE));
    board.setPiece(4, 2, new Pawn(PieceColor.WHITE));
    board.setPiece(1, 1, new Queen(PieceColor.WHITE));
    board.setPiece(7, 7, new King(PieceColor.WHITE));
    const bestMove = ai.makeMove(board);
    expect(bestMove).toBeDefined();
    expect(bestMove!.toX).not.toBe(3); // Mouvements qui évitent les cases dangereuses pour le roi noir
  });
});
