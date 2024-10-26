// src/bishop.ts
import {Piece, PieceColor, PieceType} from './piece';

export class Bishop extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.BISHOP);
  }

  isValidMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Le Fou se déplace en diagonale, donc la différence en X doit être égale à la différence en Y
    return Math.abs(toX - fromX) === Math.abs(toY - fromY);
  }
}
