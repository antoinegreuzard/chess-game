// src/king.ts
import { Piece, PieceColor, PieceType } from './piece';
import { Board } from './board';
import { Rook } from './rook';
export class King extends Piece {
    constructor(color) {
        super(color, PieceType.KING);
        this.hasMoved = false;
    }
    isValidMove(fromX, fromY, toX, toY, board) {
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        // Le Roi se déplace d'une case dans n'importe quelle direction
        if (dx <= 1 && dy <= 1) {
            // Vérifie que la case cible n'est pas occupée par un roi adverse
            const targetPiece = board.getPiece(toX, toY);
            return !(targetPiece && targetPiece.type === PieceType.KING);
        }
        // Logique pour le roque
        if (!this.hasMoved && dy === 0 && dx === 2) {
            const direction = toX > fromX ? 1 : -1;
            const rookX = toX > fromX ? 7 : 0;
            const rook = board.getPiece(rookX, fromY);
            if (rook && rook instanceof Rook && !rook.hasMoved) {
                // Vérifie que les cases entre le roi et la tour sont libres
                for (let x = fromX + direction; x !== rookX; x += direction) {
                    if (board.getPiece(x, fromY))
                        return false;
                }
                // Assure que le roi n'est pas en échec avant, pendant ou après le roque
                if (!board.isKingInCheck(this.color)) {
                    return true;
                }
            }
        }
        return false;
    }
}
