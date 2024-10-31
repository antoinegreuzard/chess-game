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
    const playerColor = board.getPlayerColor();
    const direction = this.color === PieceColor.WHITE ? 1 : -1;
    const startRow = this.color === PieceColor.WHITE ? 1 : 6;
    const distanceY = (toY - fromY) * direction;
    const distanceX = Math.abs(toX - fromX);

    const promotionRow = playerColor === PieceColor.WHITE ? 7 : 0;

    if (distanceX === 0 && distanceY === 1 && !board.getPiece(toX, toY)) {
      // Vérifie la rangée de promotion et déclenche la promotion uniquement à cette rangée
      if (toY === promotionRow) {
        return this.handlePromotion(toX, toY, board);
      }
      return true;
    }

    if (distanceX === 1 && distanceY === 1) {
      if (board.getPiece(toX, toY) && this.canCapture(toX, toY, board)) {
        if (toY === promotionRow) {
          return this.handlePromotion(toX, toY, board);
        }
        return true;
      }

      if (board.isEnPassantMove(fromX, fromY, toX, toY)) {
        board.captureEnPassantIfValid(fromX, fromY, toX, toY);
      }
    }

    if (
      distanceX === 0 &&
      distanceY === 2 &&
      fromY === startRow &&
      !board.getPiece(toX, toY) &&
      !board.getPiece(fromX, fromY + direction)
    ) {
      board.updateEnPassantTarget(fromX, fromY, toX, toY, this);
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
