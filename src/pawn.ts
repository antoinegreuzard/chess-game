// src/pawn.ts
import {Piece, PieceColor, PieceType} from './piece';
import {Board} from './board';

export class Pawn extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.PAWN);
  }

  isValidMove(fromX: number, fromY: number, toX: number, toY: number, board: Board): boolean {
    const direction = this.color === PieceColor.WHITE ? -1 : 1; // Direction des pions : -1 pour blancs, 1 pour noirs
    const startRow = this.color === PieceColor.WHITE ? 6 : 1; // Ligne de départ des pions
    const distanceY = (toY - fromY) * direction; // Déplacement vertical en tenant compte de la couleur
    const distanceX = Math.abs(toX - fromX); // Déplacement horizontal

    console.log(`Déplacement demandé: de (${fromX}, ${fromY}) à (${toX}, ${toY})`);
    console.log(`Direction: ${direction}, Distance Y: ${distanceY}, Distance X: ${distanceX}`);

    // 1. Déplacement d'une case vers l'avant
    if (distanceX === 0 && distanceY === 1) {
      if (!board.getPiece(toX, toY)) {
        console.log("Déplacement d'une case vers l'avant validé.");
        return true;
      } else {
        console.log("Case devant occupée, déplacement refusé.");
      }
    }

    // 2. Déplacement de deux cases vers l'avant depuis la ligne de départ
    if (distanceX === 0 && distanceY === 2 && fromY === startRow) {
      if (!board.getPiece(toX, toY) && !board.getPiece(fromX, fromY + direction)) {
        console.log("Déplacement de deux cases vers l'avant validé.");
        return true;
      } else {
        console.log("Cases devant occupées, déplacement de deux cases refusé.");
      }
    }

    // 3. Capture en diagonale
    if (distanceX === 1 && distanceY === 1) {
      const targetPiece = board.getPiece(toX, toY);
      if (targetPiece && targetPiece.color !== this.color) {
        console.log("Capture en diagonale validée.");
        return true;
      } else {
        console.log("Pas de pièce ennemie en diagonale, capture refusée.");
      }
    }

    console.log("Mouvement refusé.");
    // Si aucune condition n'est remplie, le mouvement est invalide
    return false;
  }
}
