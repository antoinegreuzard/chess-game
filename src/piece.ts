// src/piece.ts
import { createPiece } from './utils/pieceFactory';
import { King } from './pieces/king';

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

export interface BoardInterface {
  getPiece(x: number, y: number): Piece | null;

  updateEnPassantTarget(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    piece: Piece,
  ): void;

  isEnPassantMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean;

  promotePawn(
    x: number,
    y: number,
    pieceType: PieceType | string,
  ): Promise<void>;

  isSquareUnderAttack(x: number, y: number, color: PieceColor): boolean;

  isKing(x: number, y: number): boolean;

  isAdjacentToAnotherKing(x: number, y: number, color: PieceColor): boolean;

  getPlayerColor(): PieceColor;

  captureEnPassantIfValid(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): void;
}

export abstract class Piece {
  public hasMoved: boolean = false;

  protected constructor(
    public color: PieceColor,
    public type: PieceType,
  ) {}

  abstract isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: BoardInterface,
  ): boolean;

  public isPathClear(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: BoardInterface,
  ): boolean {
    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);

    let x = fromX + dx;
    let y = fromY + dy;
    while (x !== toX || y !== toY) {
      if (board.getPiece(x, y) !== null) return false;
      x += dx;
      y += dy;
    }
    return true;
  }

  static isKing(piece: Piece): piece is King {
    return piece.type === PieceType.KING;
  }

  public canCapture(toX: number, toY: number, board: BoardInterface): boolean {
    const targetPiece = board.getPiece(toX, toY);
    return !targetPiece || targetPiece.color !== this.color;
  }

  // Sérialisation des données de la pièce
  public toData(): any {
    return {
      color: this.color,
      type: this.type,
    };
  }

  static async fromData(data: any): Promise<Piece> {
    return await createPiece(data.type, data.color);
  }

  // Nouvelle méthode pour vérifier les menaces sans règles spécifiques du roi
  public isThreatenedMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return dx <= 1 && dy <= 1;
  }
}
