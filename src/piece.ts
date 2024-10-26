// src/piece.ts
import {Board} from './board'; // Import de Board pour être utilisé dans isValidMove

export enum PieceColor {
  WHITE = "white",
  BLACK = "black"
}

export enum PieceType {
  PAWN = "pawn",
  ROOK = "rook",
  KNIGHT = "knight",
  BISHOP = "bishop",
  QUEEN = "queen",
  KING = "king"
}

export abstract class Piece {
  protected constructor(public color: PieceColor, public type: PieceType) {
  }

  // Mise à jour pour inclure le paramètre 'board'
  abstract isValidMove(
    fromX: number, fromY: number,
    toX: number, toY: number,
    board: Board
  ): boolean;

  protected isPathClear(
    fromX: number, fromY: number,
    toX: number, toY: number,
    board: Board
  ): boolean {
    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);

    let x = fromX + dx;
    let y = fromY + dy;

    while (x !== toX || y !== toY) {
      if (board.getPiece(x, y)) return false;
      x += dx;
      y += dy;
    }

    return true;
  }
}
