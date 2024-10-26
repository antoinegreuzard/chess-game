// src/board.ts
import {Piece, PieceColor, PieceType} from './piece';
import {Pawn} from './pawn';
import {Rook} from './rook';
import {Knight} from './knight';
import {Bishop} from './bishop';
import {Queen} from './queen';
import {King} from './king';

type BoardSquare = Piece | null;

export class Board {
  private readonly grid: BoardSquare[][];

  constructor() {
    this.grid = this.initializeBoard();
  }

  private initializeBoard(): BoardSquare[][] {
    const board: BoardSquare[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Ajouter les pièces blanches
    board[0] = [
      new Rook(PieceColor.WHITE), new Knight(PieceColor.WHITE), new Bishop(PieceColor.WHITE),
      new Queen(PieceColor.WHITE), new King(PieceColor.WHITE),
      new Bishop(PieceColor.WHITE), new Knight(PieceColor.WHITE), new Rook(PieceColor.WHITE)
    ];
    board[1] = Array(8).fill(null).map(() => new Pawn(PieceColor.WHITE));

    // Ajouter les pièces noires
    board[7] = [
      new Rook(PieceColor.BLACK), new Knight(PieceColor.BLACK), new Bishop(PieceColor.BLACK),
      new Queen(PieceColor.BLACK), new King(PieceColor.BLACK),
      new Bishop(PieceColor.BLACK), new Knight(PieceColor.BLACK), new Rook(PieceColor.BLACK)
    ];
    board[6] = Array(8).fill(null).map(() => new Pawn(PieceColor.BLACK));

    return board;
  }

  public getPiece(x: number, y: number): BoardSquare {
    return this.grid[y][x];
  }

  public movePiece(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const piece = this.getPiece(fromX, fromY);
    if (piece && piece.isValidMove(fromX, fromY, toX, toY, this)) {
      this.grid[toY][toX] = piece;
      this.grid[fromY][fromX] = null;
      return true;
    }
    return false;
  }

  public isKingInCheck(color: PieceColor): boolean {
    const kingPosition = this.findKing(color);
    if (!kingPosition) return false;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color !== color) {
          if (piece.isValidMove(x, y, kingPosition.x, kingPosition.y, this)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private findKing(color: PieceColor): { x: number; y: number } | null {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.type === PieceType.KING && piece.color === color) {
          return {x, y};
        }
      }
    }
    return null;
  }
}
