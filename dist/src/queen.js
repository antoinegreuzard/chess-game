// src/queen.ts
import { Piece, PieceType } from './piece';
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
