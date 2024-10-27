// src/piece.ts
import { Board } from './board';

export enum PieceColor {
  WHITE = 'white',
  BLACK = 'black',
}

export enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king',
}

export abstract class Piece {
  protected constructor(
    public color: PieceColor,
    public type: PieceType,
  ) {
  }

  // Mise à jour pour inclure le paramètre 'board'
  abstract isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean;

  // Vérifie si le chemin est dégagé pour certaines pièces
  public isPathClear(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean {
    const dx = Math.sign(toX - fromX); // Direction en X
    const dy = Math.sign(toY - fromY); // Direction en Y

    // Boucle sur toutes les cases intermédiaires jusqu'à la case cible exclue
    let x = fromX + dx;
    let y = fromY + dy;

    while (x !== toX || y !== toY) {
      // Vérifie s'il y a une pièce sur le chemin
      if (board.getPiece(x, y)) return false;

      // Avance dans la direction
      x += dx;
      y += dy;
    }

    return true; // Chemin dégagé
  }

  // Vérifie si une pièce peut capturer une autre
  canCapture(toX: number, toY: number, board: Board): boolean {
    const targetPiece = board.getPiece(toX, toY);
    return targetPiece === null || targetPiece.color !== this.color;
  }
}
