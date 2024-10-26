// src/board.ts
import { Piece, PieceColor, PieceType } from './piece';
import { King } from './king';
import { Rook } from './rook';
import { Knight } from './knight';
import { Bishop } from './bishop';
import { Queen } from './queen';
import { Pawn } from './pawn';
export class Board {
    grid;
    constructor() {
        this.grid = this.initializeBoard();
    }
    initializeBoard() {
        const board = Array(8)
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
    // Récupérer une pièce à une position spécifique
    getPiece(x, y) {
        return this.grid[y][x];
    }
    // Déplacer une pièce sur l'échiquier (capture incluse)
    movePiece(fromX, fromY, toX, toY) {
        const piece = this.getPiece(fromX, fromY);
        if (piece && piece.isValidMove(fromX, fromY, toX, toY, this)) {
            // Interdit de capturer le roi
            const targetPiece = this.getPiece(toX, toY);
            if (targetPiece && targetPiece.type === PieceType.KING) {
                return false; // Mouvement invalide si la cible est un roi
            }
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
            }
            else if (piece instanceof Rook) {
                piece.hasMoved = true;
            }
            return true;
        }
        return false;
    }
    // Gérer le roque (déplacement de la tour)
    handleCastling(kingX, kingY) {
        // Si le roi se déplace de 2 cases (roque), déplace la tour correspondante
        if (kingX === 6) {
            // Roque du côté roi
            const rook = this.getPiece(7, kingY);
            if (rook instanceof Rook) {
                this.grid[5][kingY] = rook;
                this.grid[7][kingY] = null;
            }
        }
        else if (kingX === 2) {
            // Roque du côté dame
            const rook = this.getPiece(0, kingY);
            if (rook instanceof Rook) {
                this.grid[3][kingY] = rook;
                this.grid[0][kingY] = null;
            }
        }
    }
    // Vérifie si le Roi de la couleur donnée est en échec
    isKingInCheck(color) {
        const kingPosition = this.findKing(color);
        if (!kingPosition)
            return false;
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
    // Vérifie si le Roi est en échec et mat
    isCheckmate(color) {
        if (!this.isKingInCheck(color)) {
            return false;
        }
        // Parcourt toutes les pièces du joueur
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.getPiece(x, y);
                if (piece && piece.color === color) {
                    // Essaye chaque mouvement possible pour voir si l'échec peut être évité
                    for (let toY = 0; toY < 8; toY++) {
                        for (let toX = 0; toX < 8; toX++) {
                            if (piece.isValidMove(x, y, toX, toY, this)) {
                                // Sauvegarde l'état actuel de l'échiquier
                                const originalPiece = this.getPiece(toX, toY);
                                this.grid[toY][toX] = piece;
                                this.grid[y][x] = null;
                                const kingSafe = !this.isKingInCheck(color);
                                // Restaure l'état initial de l'échiquier
                                this.grid[y][x] = piece;
                                this.grid[toY][toX] = originalPiece;
                                if (kingSafe) {
                                    return false; // Si un mouvement légal est trouvé, pas d'échec et mat
                                }
                            }
                        }
                    }
                }
            }
        }
        return true; // Si aucun mouvement légal n'est trouvé, c'est un échec et mat
    }
    // Trouve la position du roi d'une couleur spécifique
    findKing(color) {
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
}
