// src/pawn.ts
import { Piece, PieceColor, PieceType } from './piece';
export class Pawn extends Piece {
    constructor(color) {
        super(color, PieceType.PAWN);
    }
    isValidMove(fromX, fromY, toX, toY, board) {
        // Corrige la direction : 1 pour les blancs, -1 pour les noirs
        const direction = this.color === PieceColor.WHITE ? 1 : -1; // Inverser la logique
        const startRow = this.color === PieceColor.WHITE ? 1 : 6; // Ajuster la ligne de départ pour correspondre à la direction
        const distanceY = (toY - fromY) * direction; // Déplacement vertical en tenant compte de la couleur
        const distanceX = Math.abs(toX - fromX); // Déplacement horizontal
        // 1. Déplacement d'une case vers l'avant
        if (distanceX === 0 && distanceY === 1) {
            if (!board.getPiece(toX, toY)) {
                return true;
            }
        }
        // 2. Déplacement de deux cases vers l'avant depuis la ligne de départ
        if (distanceX === 0 && distanceY === 2 && fromY === startRow) {
            if (!board.getPiece(toX, toY) &&
                !board.getPiece(fromX, fromY + direction)) {
                return true;
            }
        }
        // 3. Capture en diagonale
        if (distanceX === 1 && distanceY === 1) {
            const targetPiece = board.getPiece(toX, toY);
            if (targetPiece && targetPiece.color !== this.color) {
                return true;
            }
        }
        // Si aucune condition n'est remplie, le mouvement est invalide
        return false;
    }
}
