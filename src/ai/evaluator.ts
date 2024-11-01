// src/evaluator.ts
import { Board } from '../board';
import { PieceColor, PieceType } from '../piece';

// Valeurs des pièces (évaluation de base)
export const pieceValues: { [key in PieceType]: number } = {
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

export function evaluateKingSafety(board: Board, color: PieceColor): number {
  const kingPosition = board.findKing(color);
  return kingPosition &&
    board.isSquareUnderAttack(kingPosition.x, kingPosition.y, color)
    ? -0.5
    : 0;
}

function getPieceSquareValue(
  type: PieceType,
  x: number,
  y: number,
  flipBoard: boolean,
): number {
  const table = pieceSquareTables[type];
  if (!table) return 0;

  // Inversion de la table pour les pièces noires si flipBoard est activé
  return flipBoard ? table[7 - y][7 - x] : table[y][x];
}

// Fonction d'évaluation principale
export function evaluateBoard(
  board: Board,
  color: PieceColor,
  flipBoard: boolean = false,
): number {
  let score = 0;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (!piece) continue;

      // Applique la valeur de base et la table de position
      let pieceScore = pieceValues[piece.type];
      pieceScore += getPieceSquareValue(piece.type, x, y, flipBoard);

      // Ajoute le bonus pour le contrôle du centre
      const positionKey = `${x},${y}`;
      if (centerControlBonus[positionKey]) {
        pieceScore += centerControlBonus[positionKey];
      }

      // Évalue les pions pour la structure et les chaînes protégées
      if (piece.type === PieceType.PAWN) {
        pieceScore += evaluatePawnStructure(board, x, y, piece.color);
        pieceScore += evaluatePawnChains(board, x, y, piece.color); // Bonus pour chaînes de pions
      }

      // Pénalise les rois exposés
      if (
        piece.type === PieceType.KING &&
        isKingExposed(board, x, y, piece.color)
      ) {
        pieceScore -= 0.5;
      }

      score += piece.color === color ? pieceScore : -pieceScore;
    }
  }

  return parseFloat(score.toFixed(2));
}

// Fonction pour évaluer les chaînes de pions
function evaluatePawnChains(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  const direction = color === PieceColor.WHITE ? -1 : 1;
  let score = 0;

  // Vérifie les pions sur les diagonales avant (chaînes protégées)
  const leftDiagonal = board.getPiece(x - 1, y + direction);
  const rightDiagonal = board.getPiece(x + 1, y + direction);

  if (
    (leftDiagonal &&
      leftDiagonal.color === color &&
      leftDiagonal.type === PieceType.PAWN) ||
    (rightDiagonal &&
      rightDiagonal.color === color &&
      rightDiagonal.type === PieceType.PAWN)
  ) {
    score += 0.5; // Bonus pour les pions protégés dans une chaîne
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

  // Pénalise les pions doublés
  score -= checkDoubledPawns(board, x, y, color) * 1.5;

  // Pénalise les pions isolés
  score -= checkIsolatedPawns(board, x, y, color) * 1.5;

  // Bonus pour les pions passés
  if (isPassedPawn(board, x, y, color)) {
    score += 1.0;
  }

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

// Gère les cases hors limites pour éviter des expositions de roi mal calculées
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

      if (!board.isWithinBounds(newX, newY)) return false; // Case hors limites
      const adjPiece = board.getPiece(newX, newY);
      return (
        !adjPiece || // Case vide
        adjPiece.color !== color || // Pièce ennemie
        adjPiece.type !== PieceType.PAWN // Pas de pion pour protéger
      );
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
