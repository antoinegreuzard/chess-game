// src/utils/utils.ts

import { PieceColor, PieceType } from '../piece';

export let capturedWhite: string[] = [];
export let capturedBlack: string[] = [];

export function showMessage(message: string) {
  const gameMessageElement = document.getElementById(
    'gameMessage',
  ) as HTMLCanvasElement;
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
  const pieceSymbol = getPieceSymbol(piece, color);

  if (color === PieceColor.WHITE) {
    capturedWhite.push(pieceSymbol);
  } else {
    capturedBlack.push(pieceSymbol);
  }

  updateCapturedPiecesDOM();
}

export function updateCapturedPiecesDOM() {
  const capturedWhiteElement = document.getElementById(
    'capturedWhite',
  ) as HTMLCanvasElement;
  const capturedBlackElement = document.getElementById(
    'capturedBlack',
  ) as HTMLCanvasElement;

  if (capturedWhiteElement) {
    capturedWhiteElement.textContent = capturedWhite.join(' ');
  }
  if (capturedBlackElement) {
    capturedBlackElement.textContent = capturedBlack.join(' ');
  }
}
