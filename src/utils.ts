// src/utils.ts

import { PieceColor, PieceType } from './piece';

export let capturedWhite: string[] = []; // Exportation pour les tests
export let capturedBlack: string[] = [];

export function showMessage(message: string) {
  const gameMessageElement = document.getElementById('gameMessage')!;
  gameMessageElement.textContent = message;
  gameMessageElement.style.display = 'block'; // Afficher le message
}

function getPieceSymbol(piece: PieceType, color: PieceColor): string {
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
  const capturedWhiteElement = document.getElementById('capturedWhite')!;
  const capturedBlackElement = document.getElementById('capturedBlack')!;

  const pieceSymbol = getPieceSymbol(piece, color);
  if (color === PieceColor.WHITE) {
    capturedWhite.push(pieceSymbol);
    capturedWhiteElement.textContent = capturedWhite.join(' ');
  } else {
    capturedBlack.push(pieceSymbol);
    capturedBlackElement.textContent = capturedBlack.join(' ');
  }
}
