// src/board.ts
import {Piece, PieceColor} from './piece';
import {King} from './king';
import {Rook} from './rook';
import {Knight} from './knight';
import {Bishop} from './bishop';
import {Queen} from './queen';
import {Pawn} from "./pawn";

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

  // Déplacer une pièce sur l'échiquier (capture incluse)
  public movePiece(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const piece = this.getPiece(fromX, fromY);
    const targetPiece = this.getPiece(toX, toY);

    if (piece && piece.isValidMove(fromX, fromY, toX, toY, this)) {
      // Capturer la pièce adverse si présente
      if (targetPiece && targetPiece.color !== piece.color) {
        this.grid[toY][toX] = null; // Capture de la pièce
      }

      // Déplace la pièce
      this.grid[toY][toX] = piece;
      this.grid[fromY][fromX] = null;

      // Met à jour l'état du roi et des tours pour le roque
      if (piece instanceof King) {
        piece.hasMoved = true;
        // Roque
        if (Math.abs(toX - fromX) === 2) {
          this.handleCastling(toX, toY);
        }
      } else if (piece instanceof Rook) {
        piece.hasMoved = true;
      }

      return true;
    }
    return false;
  }

  // Gérer le roque (déplacement de la tour)
  private handleCastling(kingX: number, kingY: number): void {
    // Si le roi se déplace de 2 cases (roque), déplace la tour correspondante
    if (kingX === 6) { // Roque du côté roi
      const rook = this.getPiece(7, kingY);
      if (rook instanceof Rook) {
        this.grid[5][kingY] = rook;
        this.grid[7][kingY] = null;
      }
    } else if (kingX === 2) { // Roque du côté dame
      const rook = this.getPiece(0, kingY);
      if (rook instanceof Rook) {
        this.grid[3][kingY] = rook;
        this.grid[0][kingY] = null;
      }
    }
  }

  // Vérifie si le Roi de la couleur donnée est en échec
  public isKingInCheck(color: PieceColor): boolean {
    const kingPosition = this.findKing(color);
    if (!kingPosition) return false;

    // Parcourt toutes les pièces adverses pour voir si elles peuvent atteindre le Roi
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

  // Trouve la position du roi d'une couleur spécifique
  private findKing(color: PieceColor): { x: number; y: number } | null {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece instanceof King && piece.color === color) {
          return {x, y};
        }
      }
    }
    return null;
  }
}
