// src/bishop.ts
import { Piece, PieceColor, PieceType } from './piece';
import { Board } from './board';
export class Bishop extends Piece {
    constructor(color) {
        super(color, PieceType.BISHOP);
    }
    isValidMove(fromX, fromY, toX, toY, board) {
        if (Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
            return this.isPathClear(fromX, fromY, toX, toY, board);
        }
        return false;
    }
}
