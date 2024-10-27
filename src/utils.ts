// src/utils.ts

import { PieceColor, PieceType } from './piece';

export function showMessage(message: string) {
  const gameMessageElement = document.getElementById('gameMessage')!;
  gameMessageElement.textContent = message;
  gameMessageElement.style.display = 'block'; // Afficher le message
}

// Fonction pour obtenir le symbole de la pièce capturée
function getPieceSymbol(piece: PieceType, color: PieceColor): string {
  switch (piece) {
    case 'pawn':
      return color === PieceColor.WHITE ? '♙' : '♟';
    case 'rook':
      return color === PieceColor.WHITE ? '♖' : '♜';
    case 'knight':
      return color === PieceColor.WHITE ? '♘' : '♞';
    case 'bishop':
      return color === PieceColor.WHITE ? '♗' : '♝';
    case 'queen':
      return color === PieceColor.WHITE ? '♕' : '♛';
    case 'king':
      return color === PieceColor.WHITE ? '♔' : '♚';
    default:
      return '';
  }
}

export function updateCapturedPieces(piece: PieceType, color: PieceColor) {
  const capturedWhiteElement = document.getElementById('capturedWhite')!;
  const capturedBlackElement = document.getElementById('capturedBlack')!;

  let capturedWhite: string[] = []; // Liste des pièces capturées par les Blancs
  let capturedBlack: string[] = []; // Liste des pièces capturées par les Noirs
  
  const pieceSymbol = getPieceSymbol(piece, color);
  if (color === PieceColor.WHITE) {
    capturedWhite.push(pieceSymbol);
    capturedWhiteElement.textContent = capturedWhite.join(' ');
  } else {
    capturedBlack.push(pieceSymbol);
    capturedBlackElement.textContent = capturedBlack.join(' ');
  }
}