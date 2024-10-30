// src/pieces/pawn.ts
import { Piece } from '../piece';
import { PieceColor, PieceType, BoardInterface } from '../types';

export class Pawn extends Piece {
  public hasMoved: boolean = false;

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
    const direction = this.color === PieceColor.WHITE ? 1 : -1;
    const startRow = this.color === PieceColor.WHITE ? 1 : 6;
    const distanceY = (toY - fromY) * direction;
    const distanceX = Math.abs(toX - fromX);

    if (distanceX === 0 && distanceY === 1 && !board.getPiece(toX, toY)) {
      if (
        ((this.color === PieceColor.WHITE && toY === 7) ||
          (this.color === PieceColor.BLACK && toY === 0)) &&
        board.getPiece(fromX, fromY)?.type === PieceType.PAWN
      ) {
        this.handlePromotion(toX, toY, board);
      }
      return true;
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

    if (distanceX === 1 && distanceY === 1) {
      if (board.getPiece(toX, toY) && this.canCapture(toX, toY, board)) {
        if (
          (this.color === PieceColor.WHITE && toY === 7) ||
          (this.color === PieceColor.BLACK &&
            toY === 0 &&
            board.getPiece(fromX, fromY)?.type === PieceType.PAWN)
        ) {
          this.handlePromotion(toX, toY, board);
        }
        return true;
      }

      if (board.isEnPassantMove(fromX, fromY, toX, toY)) {
        return true;
      }
    }

    return false;
  }

  handlePromotion(toX: number, toY: number, board: BoardInterface): void {
    const promotionDialog = document.getElementById(
      'promotionDialog',
    ) as HTMLDivElement;

    if (promotionDialog) {
      promotionDialog.style.display = 'block';

      // Définir la fonction de promotion en capturant le contexte (x, y)
      window.promote = async (pieceType: string) => {
        promotionDialog.style.display = 'none';
        await board.promotePawn(toX, toY, pieceType);
      };
    }
  }
}
