// src/board.ts
import {Piece, PieceColor} from './piece';
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

  // Récupérer une pièce à une position spécifique
  public getPiece(x: number, y: number): BoardSquare {
    return this.grid[y][x];
  }

  // Déplacer une pièce sur l'échiquier
  public movePiece(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const piece = this.getPiece(fromX, fromY);
    if (piece && piece.isValidMove(fromX, fromY, toX, toY)) {
      this.grid[toY][toX] = piece;
      this.grid[fromY][fromX] = null;
      return true;
    }
    return false;
  }
}
