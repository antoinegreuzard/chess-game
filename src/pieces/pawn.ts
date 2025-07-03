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

  public isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: BoardInterface,
  ): boolean {
    if (!board.isWithinBounds(toX, toY)) return false;

    const direction = this.color === PieceColor.WHITE ? 1 : -1;
    const startRow = this.color === PieceColor.WHITE ? 1 : 6;
    const dy = toY - fromY;
    const dx = toX - fromX;

    const targetPiece = board.getPiece(toX, toY);

    // Avance d'une case
    if (dx === 0 && dy === direction && !targetPiece) {
      return true;
    }

    // Avance de deux cases depuis la ligne de départ
    if (
      dx === 0 &&
      dy === 2 * direction &&
      fromY === startRow &&
      !targetPiece &&
      !board.getPiece(toX, fromY + direction)
    ) {
      // Définir la cible en passant
      board.updateEnPassantTarget(fromX, fromY, toX, toY, this);
      return true;
    }

    // Capture diagonale
    if (
      Math.abs(dx) === 1 &&
      dy === direction &&
      targetPiece &&
      targetPiece.color !== this.color
    ) {
      return true;
    }

    // En passant
    if (
      Math.abs(dx) === 1 &&
      dy === direction &&
      !targetPiece &&
      board.isEnPassantMove(fromX, fromY, toX, toY)
    ) {
      return true;
    }

    // Promotion (autorisé ici en tant que mouvement valide)
    const promotionRow = this.color === PieceColor.WHITE ? 7 : 0;
    if (toY === promotionRow && dx === 0 && dy === direction && !targetPiece) {
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
