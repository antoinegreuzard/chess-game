// src/rook.ts
import {Piece, PieceColor, PieceType} from './piece';

export class Rook extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.ROOK);
  }

  isValidMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // La Tour se déplace en ligne droite, soit horizontalement, soit verticalement
    return fromX === toX || fromY === toY;
  }
}
