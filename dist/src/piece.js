// src/piece.ts
import { Board } from './board';
export var PieceColor;
(function (PieceColor) {
    PieceColor["WHITE"] = "white";
    PieceColor["BLACK"] = "black";
})(PieceColor || (PieceColor = {}));
export var PieceType;
(function (PieceType) {
    PieceType["PAWN"] = "pawn";
    PieceType["ROOK"] = "rook";
    PieceType["KNIGHT"] = "knight";
    PieceType["BISHOP"] = "bishop";
    PieceType["QUEEN"] = "queen";
    PieceType["KING"] = "king";
})(PieceType || (PieceType = {}));
export class Piece {
    color;
    type;
    constructor(color, type) {
        this.color = color;
        this.type = type;
    }
    // Vérifie si le chemin est dégagé pour certaines pièces
    isPathClear(fromX, fromY, toX, toY, board) {
        const dx = Math.sign(toX - fromX);
        const dy = Math.sign(toY - fromY);
        let x = fromX + dx;
        let y = fromY + dy;
        while (x !== toX || y !== toY) {
            if (board.getPiece(x, y))
                return false;
            x += dx;
            y += dy;
        }
        return true;
    }
    // Vérifie si une pièce peut capturer une autre
    canCapture(toX, toY, board) {
        const targetPiece = board.getPiece(toX, toY);
        return targetPiece !== null && targetPiece.color !== this.color;
    }
}
