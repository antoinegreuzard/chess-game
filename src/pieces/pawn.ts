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
    if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
      return false;
    }

    const direction = this.color === PieceColor.WHITE ? -1 : 1;
    const startRow = this.color === PieceColor.WHITE ? 6 : 1;
    const promotionRow = this.color === PieceColor.WHITE ? 0 : 7;

    const distanceY = (toY - fromY) * direction;
    const distanceX = toX - fromX;

    const targetPiece = board.getPiece(toX, toY);

    // 🧱 Vérifie qu'on ne tente pas une promotion sur une case occupée
    if (toY === promotionRow && targetPiece) {
      return false;
    }

    // Avance d'une case tout droit
    if (distanceX === 0 && distanceY === 1 && !targetPiece) {
      if (toY === promotionRow) {
        return this.handlePromotion(toX, toY, board);
      }
      return true;
    }

    // Avance de deux cases depuis la ligne de départ
    if (
      distanceX === 0 &&
      distanceY === 2 &&
      fromY === startRow &&
      !targetPiece &&
      !board.getPiece(fromX, fromY + direction)
    ) {
      board.updateEnPassantTarget(fromX, fromY, toX, toY, this);
      return true;
    }

    // Capture diagonale
    if (
      Math.abs(distanceX) === 1 &&
      distanceY === 1 &&
      targetPiece &&
      this.canCapture(toX, toY, board)
    ) {
      if (toY === promotionRow) {
        return this.handlePromotion(toX, toY, board);
      }
      return true;
    }

    // Capture en passant
    if (
      Math.abs(distanceX) === 1 &&
      distanceY === 1 &&
      board.isEnPassantMove(fromX, fromY, toX, toY)
    ) {
      board.captureEnPassantIfValid(fromX, fromY, toX, toY);
      return true;
    }

    return false;
  }

  handlePromotion(toX: number, toY: number, board: BoardInterface): boolean {
    this._toX = toX;
    this._toY = toY;
    this._board = board;
    return true;
  }
}
