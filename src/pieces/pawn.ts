// src/pieces/pawn.ts
import { BoardInterface, Piece, PieceColor, PieceType } from '../piece';

export class Pawn extends Piece {
  public hasMoved: boolean = false;
  private _toX: number | null = null;
  private _toY: number | null = null;
  private _board: BoardInterface | null = null;

  constructor(color: PieceColor) {
    super(color, PieceType.PAWN);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: BoardInterface,
  ): boolean {
    if (!board.isWithinBounds(toX, toY)) return false;

    const direction = this.color === PieceColor.WHITE ? -1 : 1;
    const startRow = this.color === PieceColor.WHITE ? 6 : 1;
    const promotionRow = this.color === PieceColor.WHITE ? 0 : 7;
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;

    const target = board.getPiece(toX, toY);

    // Avance simple
    if (deltaX === 0 && deltaY === direction && !target) {
      return true;
    }

    // Avance double depuis la position initiale
    if (
      deltaX === 0 &&
      deltaY === 2 * direction &&
      fromY === startRow &&
      !target &&
      !board.getPiece(toX, fromY + direction)
    ) {
      board.updateEnPassantTarget(fromX, fromY, toX, toY, this);
      return true;
    }

    // Capture diagonale normale
    if (
      Math.abs(deltaX) === 1 &&
      deltaY === direction &&
      target &&
      target.color !== this.color
    ) {
      return true;
    }

    // Capture en passant
    if (
      Math.abs(deltaX) === 1 &&
      deltaY === direction &&
      board.isEnPassantMove(fromX, fromY, toX, toY)
    ) {
      return true;
    }

    // Promotion (autorisé même sans capture)
    if (
      deltaX === 0 &&
      toY === promotionRow &&
      deltaY === direction &&
      !target
    ) {
      return true;
    }

    if (
      Math.abs(deltaX) === 1 &&
      deltaY === direction &&
      toY === promotionRow &&
      ((target && target.color !== this.color) ||
        board.isEnPassantMove(fromX, fromY, toX, toY))
    ) {
      return true;
    }

    return false;
  }
}
