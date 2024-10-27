// src/pieces/pawn.ts
import { Piece, PieceColor, PieceType } from '../piece';
import { Board } from '../board';

export class Pawn extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.PAWN);
  }

  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean {
    const direction = this.color === PieceColor.WHITE ? 1 : -1;
    const startRow = this.color === PieceColor.WHITE ? 1 : 6;
    const distanceY = (toY - fromY) * direction;
    const distanceX = Math.abs(toX - fromX);

    // 1. Déplacement d'une case vers l'avant (sans capture)
    if (distanceX === 0 && distanceY === 1) {
      if (!board.getPiece(toX, toY)) {
        // Promotion si le pion atteint la dernière rangée
        if (
          (this.color === PieceColor.WHITE && toY === 7) ||
          (this.color === PieceColor.BLACK && toY === 0)
        ) {
          this.handlePromotion(toX, toY, board);
        }
        return true;
      }
    }

    // 2. Déplacement de deux cases vers l'avant depuis la ligne de départ (sans capture)
    if (distanceX === 0 && distanceY === 2 && fromY === startRow) {
      if (
        !board.getPiece(toX, toY) &&
        !board.getPiece(fromX, fromY + direction)
      ) {
        // Mettre à jour la cible de la prise en passant
        board.updateEnPassantTarget(fromX, fromY, toX, toY, this);
        return true;
      }
    }

    // 3. Capture en diagonale
    if (distanceX === 1 && distanceY === 1) {
      // Vérifie qu'il y a une pièce ennemie à capturer
      if (board.getPiece(toX, toY) && this.canCapture(toX, toY, board)) {
        // Promotion si le pion atteint la dernière rangée
        if (
          (this.color === PieceColor.WHITE && toY === 7) ||
          (this.color === PieceColor.BLACK && toY === 0)
        ) {
          this.handlePromotion(toX, toY, board);
        }
        return true;
      }

      // Prise en passant
      if (board.isEnPassantMove(fromX, fromY, toX, toY)) {
        return true;
      }
    }

    // Si aucune des conditions n'est remplie, le mouvement est invalide
    return false;
  }

  private handlePromotion(toX: number, toY: number, board: Board): void {
    const promotionDialog = document.getElementById('promotionDialog');
    if (promotionDialog) {
      promotionDialog.style.display = 'block';

      // Définis la fonction promote sur l'objet global window
      window.promote = (pieceType: string) => {
        promotionDialog.style.display = 'none';
        board.promotePawn(toX, toY, pieceType);
      };
    }
  }
}
