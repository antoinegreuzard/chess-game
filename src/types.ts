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

// Utilisation de `any` pour éviter la dépendance de `BoardInterface` vers `Piece`
export interface BoardInterface {
  getPiece(x: number, y: number): any | null;

  updateEnPassantTarget(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    piece: any,
  ): void;

  isEnPassantMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean;

  promotePawn(x: number, y: number, pieceType: string): void;

  isSquareUnderAttack(x: number, y: number, color: string): boolean;

  isKing(x: number, y: number): boolean;

  isAdjacentToAnotherKing(x: number, y: number, color: PieceColor): boolean;
}
