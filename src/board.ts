// src/board.ts
import { Piece, PieceColor, PieceType } from './piece';
import { Rook } from './pieces/rook';
import { Knight } from './pieces/knight';
import { Bishop } from './pieces/bishop';
import { Queen } from './pieces/queen';
import { King } from './pieces/king';
import { Pawn } from './pieces/pawn';

type BoardSquare = Piece | null;

export class Board {
  private readonly grid: BoardSquare[][];
  private enPassantTarget: { x: number; y: number } | null = null;
  private halfMoveCount: number = 0; // Compteur pour la règle des 50 coups

  constructor() {
    this.grid = this.initializeBoard();
  }

  private initializeBoard(): BoardSquare[][] {
    const board: BoardSquare[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Ajouter les pièces blanches
    board[0] = [
      new Rook(PieceColor.WHITE),
      new Knight(PieceColor.WHITE),
      new Bishop(PieceColor.WHITE),
      new Queen(PieceColor.WHITE),
      new King(PieceColor.WHITE),
      new Bishop(PieceColor.WHITE),
      new Knight(PieceColor.WHITE),
      new Rook(PieceColor.WHITE),
    ];
    board[1] = Array(8)
      .fill(null)
      .map(() => new Pawn(PieceColor.WHITE));

    // Ajouter les pièces noires
    board[7] = [
      new Rook(PieceColor.BLACK),
      new Knight(PieceColor.BLACK),
      new Bishop(PieceColor.BLACK),
      new Queen(PieceColor.BLACK),
      new King(PieceColor.BLACK),
      new Bishop(PieceColor.BLACK),
      new Knight(PieceColor.BLACK),
      new Rook(PieceColor.BLACK),
    ];
    board[6] = Array(8)
      .fill(null)
      .map(() => new Pawn(PieceColor.BLACK));

    return board;
  }

  public getPiece(x: number, y: number): BoardSquare {
    return this.grid[y][x];
  }

  public getValidMoves(x: number, y: number): { x: number, y: number }[] {
    const piece = this.getPiece(x, y);
    if (!piece) return [];

    const validMoves: { x: number, y: number }[] = [];

    for (let toY = 0; toY < 8; toY++) {
      for (let toX = 0; toX < 8; toX++) {
        if (piece.isValidMove(x, y, toX, toY, this)) {
          validMoves.push({ x: toX, y: toY });
        }
      }
    }

    return validMoves;
  }

  public movePiece(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    if (
      toY < 0 ||
      toY >= this.grid.length ||
      ['__proto__', 'constructor', 'prototype'].includes(toY.toString())
    ) {
      return false; // Invalid move if toY is out of bounds or a special property name
    }
    const piece = this.getPiece(fromX, fromY);

    if (piece && piece.isValidMove(fromX, fromY, toX, toY, this)) {
      const targetPiece = this.getPiece(toX, toY);
      if (targetPiece && targetPiece.type === PieceType.KING) {
        return false; // Mouvement invalide si la cible est un roi
      }

      // Sauvegarder l'état actuel pour vérifier l'échec
      const originalPiece = this.getPiece(toX, toY);
      this.grid[toY][toX] = piece;
      this.grid[fromY][fromX] = null;

      // Vérification de l'échec après le mouvement
      if (this.isKingInCheck(piece.color)) {
        // Annuler le mouvement
        this.grid[fromY][fromX] = piece;
        this.grid[toY][toX] = originalPiece;
        return false;
      }

      // Vérifie si c'est un mouvement de roque pour le roi
      if (piece instanceof King && Math.abs(toX - fromX) === 2) {
        if (!this.isCastlingValid(piece, fromX, fromY, toX)) {
          return false; // Roque invalide
        }
        this.handleCastling(toX, toY);
      }

      // Gérer la prise en passant
      this.handleEnPassant(fromX, fromY, toX, toY);

      // Compte les mouvements pour la règle des 50 coups
      if (piece.type === PieceType.PAWN || targetPiece) {
        this.halfMoveCount = 0; // Réinitialise le compteur si un pion bouge ou si une capture a lieu
      } else {
        this.halfMoveCount++;
      }

      // Déplace la pièce
      this.grid[toY][toX] = piece;
      this.grid[fromY][fromX] = null;

      // Met à jour l'état du roi et des tours pour le roque
      if (piece instanceof King) {
        piece.hasMoved = true;
      } else if (piece instanceof Rook) {
        piece.hasMoved = true;
      }

      // Gérer la cible pour la prise en passant
      this.updateEnPassantTarget(fromX, fromY, toX, toY, piece);

      return true;
    }
    return false;
  }

  private isCastlingValid(
    king: King,
    fromX: number,
    fromY: number,
    toX: number,
  ): boolean {
    const direction = toX > fromX ? 1 : -1;
    const rookX = toX > fromX ? 7 : 0;
    const rook = this.getPiece(rookX, fromY);

    if (!(rook instanceof Rook) || rook.hasMoved || king.hasMoved) {
      return false;
    }

    // Vérifie que les cases entre le roi et la tour sont libres
    for (let x = fromX + direction; x !== rookX; x += direction) {
      if (this.getPiece(x, fromY)) {
        return false;
      }
    }

    // Assure que le roi ne passe pas par une case attaquée
    for (let x = fromX; x !== toX + direction; x += direction) {
      if (this.isSquareUnderAttack(x, fromY, king.color)) {
        return false;
      }
    }

    return true;
  }

  private handleCastling(kingX: number, kingY: number): void {
    if (kingX === 6) {
      const rook = this.getPiece(7, kingY);
      if (rook instanceof Rook) {
        this.grid[5][kingY] = rook;
        this.grid[7][kingY] = null;
      }
    } else if (kingX === 2) {
      const rook = this.getPiece(0, kingY);
      if (rook instanceof Rook) {
        this.grid[3][kingY] = rook;
        this.grid[0][kingY] = null;
      }
    }
  }

  private handleEnPassant(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): void {
    if (this.isEnPassantMove(fromX, fromY, toX, toY)) {
      const direction =
        this.getPiece(fromX, fromY)?.color === PieceColor.WHITE ? -1 : 1;
      this.grid[toY - direction][toX] = null; // Capture du pion en passant
    }
  }

  public updateEnPassantTarget(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    piece: Piece,
  ): void {
    if (piece instanceof Pawn && Math.abs(toY - fromY) === 2 && fromX === toX) {
      this.enPassantTarget = { x: toX, y: (fromY + toY) / 2 };
    } else {
      this.enPassantTarget = null;
    }
  }

  public captureEnPassant(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): void {
    const piece = this.getPiece(fromX, fromY);

    // Vérifie que le mouvement est une prise en passant valide
    if (this.isEnPassantMove(fromX, fromY, toX, toY) && piece instanceof Pawn) {
      // Détermine la direction pour la capture en passant
      const direction = piece.color === PieceColor.WHITE ? -1 : 1;
      this.grid[toY - direction][toX] = null; // Enlève le pion capturé
    }
  }

  public isEnPassantMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    if (!this.enPassantTarget) return false;
    return (
      toX === this.enPassantTarget.x &&
      toY === this.enPassantTarget.y &&
      this.getPiece(fromX, fromY) instanceof Pawn
    );
  }

  public promotePawn(x: number, y: number, pieceType: string): void {
    const color = this.getPiece(x, y)?.color;

    if (!color) return;

    switch (pieceType) {
      case 'queen':
        this.grid[y][x] = new Queen(color);
        break;
      case 'rook':
        this.grid[y][x] = new Rook(color);
        break;
      case 'bishop':
        this.grid[y][x] = new Bishop(color);
        break;
      case 'knight':
        this.grid[y][x] = new Knight(color);
        break;
    }
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

  public isCheckmate(color: PieceColor): boolean {
    if (!this.isKingInCheck(color)) {
      return false;
    }

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color === color) {
          for (let toY = 0; toY < 8; toY++) {
            for (let toX = 0; toX < 8; toX++) {
              if (piece.isValidMove(x, y, toX, toY, this)) {
                const originalPiece = this.getPiece(toX, toY);
                this.grid[toY][toX] = piece;
                this.grid[y][x] = null;

                const kingSafe = !this.isKingInCheck(color);

                this.grid[y][x] = piece;
                this.grid[toY][toX] = originalPiece;

                if (kingSafe) {
                  return false;
                }
              }
            }
          }
        }
      }
    }

    return true;
  }

  public isStalemate(color: PieceColor): boolean {
    if (this.isKingInCheck(color)) {
      return false;
    }

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color === color) {
          for (let toY = 0; toY < 8; toY++) {
            for (let toX = 0; toX < 8; toX++) {
              if (piece.isValidMove(x, y, toX, toY, this)) {
                const originalPiece = this.getPiece(toX, toY);
                this.grid[toY][toX] = piece;
                this.grid[y][x] = null;

                const kingSafe = !this.isKingInCheck(color);

                this.grid[y][x] = piece;
                this.grid[toY][toX] = originalPiece;

                if (kingSafe) {
                  return false;
                }
              }
            }
          }
        }
      }
    }

    return true;
  }

  private findKing(color: PieceColor): { x: number; y: number } | null {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece instanceof King && piece.color === color) {
          return { x, y };
        }
      }
    }
    return null;
  }

  public isSquareUnderAttack(x: number, y: number, color: PieceColor): boolean {
    for (let fromY = 0; fromY < 8; fromY++) {
      for (let fromX = 0; fromX < 8; fromX++) {
        const piece = this.getPiece(fromX, fromY);
        if (piece && piece.color !== color) {
          if (piece.isValidMove(fromX, fromY, x, y, this)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Vérifie le matériel insuffisant pour un échec et mat
  public isInsufficientMaterial(): boolean {
    const pieces = this.grid.flat().filter((piece) => piece !== null);

    // Cas les plus courants de matériel insuffisant
    if (pieces.length <= 2) return true; // Seulement les rois sur le plateau
    if (
      pieces.length === 3 &&
      pieces.some(
        (piece) =>
          piece?.type === PieceType.BISHOP || piece?.type === PieceType.KNIGHT,
      )
    )
      return true;

    return false;
  }

  // Vérifie si la règle des 50 coups est remplie
  public isFiftyMoveRule(): boolean {
    return this.halfMoveCount >= 50;
  }
}
