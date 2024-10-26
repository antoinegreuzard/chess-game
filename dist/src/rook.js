// src/rook.ts
import { Piece, PieceColor, PieceType } from './piece';
import { Board } from './board';
export class Rook extends Piece {
    constructor(color) {
        super(color, PieceType.ROOK);
        this.hasMoved = false;
    }
    isValidMove(fromX, fromY, toX, toY, board) {
        // Vérifie si le mouvement est en ligne droite et que le chemin est dégagé
        if ((fromX === toX || fromY === toY) &&
            this.isPathClear(fromX, fromY, toX, toY, board)) {
            // Vérifie si la case cible est vide ou contient une pièce ennemie
            const targetPiece = board.getPiece(toX, toY);
            return targetPiece === null || this.canCapture(toX, toY, board);
        }
        return false;
    }
}
