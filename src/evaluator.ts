// src/evaluator.ts
import { Board } from './board';
import { PieceColor, PieceType } from './types';

// Valeurs des pièces (évaluation de base)
const pieceValues: { [key in PieceType]: number } = {
  [PieceType.PAWN]: 1,
  [PieceType.KNIGHT]: 3,
  [PieceType.BISHOP]: 3.25,
  [PieceType.ROOK]: 5,
  [PieceType.QUEEN]: 9,
  [PieceType.KING]: 0,
};

// Tables de positions pour améliorer l'évaluation
const pieceSquareTables: { [key in PieceType]: number[][] } = {
  [PieceType.PAWN]: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    [0.1, 0.1, 0.2, 0.3, 0.3, 0.2, 0.1, 0.1],
    [0.05, 0.05, 0.1, 0.25, 0.25, 0.1, 0.05, 0.05],
    [0, 0, 0, 0.2, 0.2, 0, 0, 0],
    [0.05, -0.05, -0.1, 0, 0, -0.1, -0.05, 0.05],
    [0.05, 0.1, 0.1, -0.2, -0.2, 0.1, 0.1, 0.05],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  [PieceType.KNIGHT]: [
    [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5],
    [-0.4, -0.2, 0, 0, 0, 0, -0.2, -0.4],
    [-0.3, 0, 0.1, 0.15, 0.15, 0.1, 0, -0.3],
    [-0.3, 0.05, 0.15, 0.2, 0.2, 0.15, 0.05, -0.3],
    [-0.3, 0, 0.15, 0.2, 0.2, 0.15, 0, -0.3],
    [-0.3, 0.05, 0.1, 0.15, 0.15, 0.1, 0.05, -0.3],
    [-0.4, -0.2, 0, 0.05, 0.05, 0, -0.2, -0.4],
    [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5],
  ],
  [PieceType.BISHOP]: [
    [-0.2, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.2],
    [-0.1, 0, 0, 0, 0, 0, 0, -0.1],
    [-0.1, 0, 0.05, 0.1, 0.1, 0.05, 0, -0.1],
    [-0.1, 0.05, 0.05, 0.1, 0.1, 0.05, 0.05, -0.1],
    [-0.1, 0, 0.1, 0.1, 0.1, 0.1, 0, -0.1],
    [-0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, -0.1],
    [-0.1, 0.05, 0, 0, 0, 0, 0.05, -0.1],
    [-0.2, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.2],
  ],
  [PieceType.ROOK]: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.05, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [0, 0, 0, 0.05, 0.05, 0, 0, 0],
  ],
  [PieceType.QUEEN]: [
    [-0.2, -0.1, -0.1, -0.05, -0.05, -0.1, -0.1, -0.2],
    [-0.1, 0, 0, 0, 0, 0, 0, -0.1],
    [-0.1, 0, 0.05, 0.05, 0.05, 0.05, 0, -0.1],
    [-0.05, 0, 0.05, 0.05, 0.05, 0.05, 0, -0.05],
    [0, 0, 0.05, 0.05, 0.05, 0.05, 0, -0.05],
    [-0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0, -0.1],
    [-0.1, 0, 0.05, 0, 0, 0, 0, -0.1],
    [-0.2, -0.1, -0.1, -0.05, -0.05, -0.1, -0.1, -0.2],
  ],
  [PieceType.KING]: [
    [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
    [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
    [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
    [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
    [-0.2, -0.3, -0.3, -0.4, -0.4, -0.3, -0.3, -0.2],
    [-0.1, -0.2, -0.2, -0.2, -0.2, -0.2, -0.2, -0.1],
    [0.2, 0.2, 0, 0, 0, 0, 0.2, 0.2],
    [0.2, 0.3, 0, 0, 0, 0, 0.3, 0.2],
  ],
};

// Bonus pour le contrôle du centre du plateau (cases centrales plus précieuses)
export const centerControlBonus: { [key: string]: number } = {
  '3,3': 0.5,
  '3,4': 0.5,
  '4,3': 0.5,
  '4,4': 0.5, // Cases centrales
  '2,3': 0.25,
  '2,4': 0.25,
  '3,2': 0.25,
  '4,2': 0.25,
  '4,5': 0.25,
  '3,5': 0.25,
  '5,3': 0.25,
  '5,4': 0.25, // Cases autour
};

// Fonction d'évaluation principale
export function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (piece) {
        let pieceScore = pieceValues[piece.type];

        // Appliquer les tables de position selon le type de pièce
        const pieceTable = pieceSquareTables[piece.type];
        if (pieceTable) {
          pieceScore += pieceTable[y][x];
        }

        // Contrôle du centre du plateau
        const positionKey = `${x},${y}`;
        if (centerControlBonus[positionKey]) {
          pieceScore += centerControlBonus[positionKey];
        }

        // Structure des pions pour vérifier les pions passés
        if (piece.type === PieceType.PAWN) {
          pieceScore += evaluatePawnStructure(board, x, y, piece.color);
          if (isPassedPawn(board, x, y, piece.color)) {
            pieceScore += 1.0; // Bonus pour les pions passés
          }
        }

        // Vérifier si le roi est exposé
        if (
          piece.type === PieceType.KING &&
          isKingExposed(board, x, y, piece.color)
        ) {
          pieceScore -= 0.5; // Réduction pour les rois exposés
        }

        score += piece.color === color ? pieceScore : -pieceScore;
      }
    }
  }

  return score;
}

// Évaluer la structure des pions
function evaluatePawnStructure(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  let score = 0;

  // Vérifier les pions doublés et isolés avec une pénalité plus importante
  score -= checkDoubledPawns(board, x, y, color) * 1.5; // Pénalité augmentée pour les pions doublés
  score -= checkIsolatedPawns(board, x, y, color) * 1.5; // Pénalité augmentée pour les pions isolés

  return score;
}

function checkDoubledPawns(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  for (let i = 0; i < 8; i++) {
    if (
      i !== y &&
      board.getPiece(x, i)?.type === PieceType.PAWN &&
      board.getPiece(x, i)?.color === color
    ) {
      return 0.5;
    }
  }
  return 0;
}

function checkIsolatedPawns(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  const leftColumn = x - 1 >= 0 ? board.getPiece(x - 1, y) : null;
  const rightColumn = x + 1 < 8 ? board.getPiece(x + 1, y) : null;

  if (
    (!leftColumn ||
      leftColumn.type !== PieceType.PAWN ||
      leftColumn.color !== color) &&
    (!rightColumn ||
      rightColumn.type !== PieceType.PAWN ||
      rightColumn.color !== color)
  ) {
    return 1.5; // Augmentation de la pénalité pour les pions isolés
  }

  return 0;
}

function isKingExposed(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): boolean {
  const piece = board.getPiece(x, y);
  if (piece && piece.type === PieceType.KING) {
    const surroundingSquares = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: -1 },
    ];

    return surroundingSquares.some(({ dx, dy }) => {
      const newX = x + dx;
      const newY = y + dy;

      if (board.isWithinBounds(newX, newY)) {
        const adjPiece = board.getPiece(newX, newY);
        return (
          !adjPiece || // Case vide
          adjPiece.color !== color || // Pièce ennemie
          adjPiece.type !== PieceType.PAWN // Pas de pion pour protéger
        );
      }
      return true; // Case hors limites, expose le roi
    });
  }
  return false;
}

function isPassedPawn(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): boolean {
  const direction = color === PieceColor.WHITE ? -1 : 1;

  for (let i = y + direction; i >= 0 && i < 8; i += direction) {
    const pieceInFront = board.getPiece(x, i);
    if (
      pieceInFront &&
      pieceInFront.type === PieceType.PAWN &&
      pieceInFront.color !== color
    ) {
      return false;
    }
  }

  // Vérifier s'il y a des pions alliés sur les colonnes adjacentes
  const adjacentColumns = [x - 1, x + 1];
  return adjacentColumns.every((col) => {
    if (col < 0 || col >= 8) return true;
    for (let i = 0; i < 8; i++) {
      const adjacentPiece = board.getPiece(col, i);
      if (
        adjacentPiece &&
        adjacentPiece.type === PieceType.PAWN &&
        adjacentPiece.color === color
      ) {
        return false;
      }
    }
    return true;
  });
}
