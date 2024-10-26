// src/queen.ts
import {Piece, PieceColor, PieceType} from './piece';

export class Queen extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.QUEEN);
  }

  isValidMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // La Reine combine les mouvements de la Tour et du Fou
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return dx === dy || fromX === toX || fromY === toY;
  }
}
