// src/queen.ts
import { Piece, PieceColor, PieceType } from './piece';
import { Board } from './board';
export class Queen extends Piece {
    constructor(color) {
        super(color, PieceType.QUEEN);
    }
    isValidMove(fromX, fromY, toX, toY, board) {
        if (fromX === toX ||
            fromY === toY ||
            Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
            return this.isPathClear(fromX, fromY, toX, toY, board);
        }
        return false;
    }
}
