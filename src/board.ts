// src/board.ts
import {Bishop} from './bishop';
import {King} from './king';
import {Knight} from './knight';
import {Pawn} from './pawn';
import {Piece, PieceColor, PieceType} from './piece';
import {Queen} from './queen';
import {Rook} from './rook';

type BoardSquare = Piece | null;

export class Board {
  private grid: BoardSquare[][];

  constructor() {
    this.grid = this.initializeBoard();
  }

  private initializeBoard(): BoardSquare[][] {
    // Initialise un échiquier vide avec les pièces aux positions de départ
    const emptyRow: BoardSquare[] = Array(8).fill(null);
    const board: BoardSquare[][] = Array(8).fill(emptyRow.map(() => null));

    // Ajouter les pièces blanches
    board[0] = [
      new Rook(PieceColor.WHITE), new Knight(PieceColor.WHITE), new Bishop(PieceColor.WHITE),
      new Queen(PieceColor.WHITE), new King(PieceColor.WHITE),
      new Bishop(PieceColor.WHITE), new Knight(PieceColor.WHITE), new Rook(PieceColor.WHITE)
    ];
    board[1] = Array(8).fill(new Pawn(PieceColor.WHITE));

    // Ajouter les pièces noires
    board[7] = [
      new Rook(PieceColor.BLACK), new Knight(PieceColor.BLACK), new Bishop(PieceColor.BLACK),
      new Queen(PieceColor.BLACK), new King(PieceColor.BLACK),
      new Bishop(PieceColor.BLACK), new Knight(PieceColor.BLACK), new Rook(PieceColor.BLACK)
    ];
    board[6] = Array(8).fill(new Pawn(PieceColor.BLACK));

    return board;
  }

  // Afficher l'échiquier
  public printBoard(): void {
    console.log(this.grid.map(row => row.map(piece => piece ? piece.type[0] : '.').join(' ')).join('\n'));
  }
}
