// src/utils/utils.ts

import { PieceColor, PieceType } from '../piece';
import { Board } from '../board';
import { Move } from '../ai/openingBook';

export let capturedWhite: string[] = [];
export let capturedBlack: string[] = [];

export function showMessage(message: string) {
  const gameMessageElement = document.getElementById(
    'gameMessage',
  ) as HTMLDivElement;
  if (gameMessageElement) {
    gameMessageElement.textContent = message;
    gameMessageElement.style.display = 'block'; // Afficher le message
  }
}

export function getPieceSymbol(piece: PieceType, color: PieceColor): string {
  switch (piece) {
    case PieceType.PAWN:
      return color === PieceColor.WHITE ? '♙' : '♟';
    case PieceType.ROOK:
      return color === PieceColor.WHITE ? '♖' : '♜';
    case PieceType.KNIGHT:
      return color === PieceColor.WHITE ? '♘' : '♞';
    case PieceType.BISHOP:
      return color === PieceColor.WHITE ? '♗' : '♝';
    case PieceType.QUEEN:
      return color === PieceColor.WHITE ? '♕' : '♛';
    case PieceType.KING:
      return color === PieceColor.WHITE ? '♔' : '♚';
    default:
      return '';
  }
}

export function updateCapturedPieces(piece: PieceType, color: PieceColor) {
  const pieceSymbol = getPieceSymbol(piece, color);

  if (color === PieceColor.WHITE) {
    capturedWhite.push(pieceSymbol);
  } else {
    capturedBlack.push(pieceSymbol);
  }

  updateCapturedPiecesDOM();
}

export function updateCapturedPiecesDOM(): void {
  const capturedWhiteElement = document.getElementById(
    'capturedWhite',
  ) as HTMLDivElement;
  const capturedBlackElement = document.getElementById(
    'capturedBlack',
  ) as HTMLDivElement;

  if (capturedWhiteElement) {
    capturedWhiteElement.textContent = capturedWhite.join(' ');
  }
  if (capturedBlackElement) {
    capturedBlackElement.textContent = capturedBlack.join(' ');
  }
}

export function describeMove(board: Board, move: Move): string {
  const piece = board.getPiece(move.fromX, move.fromY);
  if (!piece) {
    return `❗ Erreur : aucune pièce à (${move.fromX}, ${move.fromY})`;
  }

  const symbols = {
    [PieceType.PAWN]: '♟',
    [PieceType.KNIGHT]: '♞',
    [PieceType.BISHOP]: '♝',
    [PieceType.ROOK]: '♜',
    [PieceType.QUEEN]: '♛',
    [PieceType.KING]: '♚',
  };

  const from = `${String.fromCharCode(97 + move.fromX)}${8 - move.fromY}`;
  const to = `${String.fromCharCode(97 + move.toX)}${8 - move.toY}`;

  return `${piece.color === PieceColor.WHITE ? 'Blanc' : 'Noir'} joue ${symbols[piece.type]} de ${from} à ${to}`;
}
