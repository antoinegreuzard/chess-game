// src/evaluator.ts
import { Board } from '../board';
import { PieceColor, PieceType } from '../piece';

// Valeurs des pièces (évaluation de base)
export const pieceValues: Record<PieceType, number> = {
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
  board: Board,
  color: PieceColor,
): number {
  const table = pieceSquareTables[type];
  if (!table) return 0;

  // Empêcher les pions isolés de recevoir un bonus de position
  if (type === PieceType.PAWN) {
    const isIsolated = checkIsolatedPawns(board, x, y, color) > 0;
    return isIsolated ? 0 : flipBoard ? table[7 - y][7 - x] : table[y][x];
  }

  // Retourne la valeur de position pour les autres pièces
  return flipBoard ? table[7 - y][7 - x] : table[y][x];
}

// Fonction d'évaluation principale
export function evaluateBoard(
  board: Board,
  color: PieceColor,
  flipBoard = false,
): number {
  let score = 0;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (!piece) continue;

      let pieceScore = pieceValues[piece.type];
      pieceScore += getPieceSquareValue(
        piece.type,
        x,
        y,
        flipBoard,
        board,
        piece.color,
      );

      if (piece.type === PieceType.PAWN) {
        pieceScore += evaluatePawnStructure(board, x, y, piece.color);
        pieceScore += evaluatePawnChains(board, x, y, piece.color);
        pieceScore += evaluateAdvancedPawnStructure(board, x, y, piece.color);

        const centerBonus = centerControlBonus[`${x},${y}`];
        if (centerBonus && checkIsolatedPawns(board, x, y, piece.color) === 0) {
          pieceScore += centerBonus;
        }
      }

      pieceScore += evaluateKeySquareControl(board, x, y, piece.color);

      if (piece.type === PieceType.KING) {
        pieceScore += evaluateKingSafetyAdvanced(board, x, y, piece.color);
      }

      score += piece.color === color ? pieceScore : -pieceScore;
    }
  }

  return parseFloat(score.toFixed(2));
}

function evaluateKeySquareControl(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  const opponentKing = board.findKing(
    color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE,
  );
  if (!opponentKing) return 0;

  const dx = Math.abs(opponentKing.x - x);
  const dy = Math.abs(opponentKing.y - y);

  let score = (dx <= 1 && dy <= 1) || (dx === 0 && dy <= 2) ? 0.5 : 0;

  const piece = board.getPiece(x, y);
  if (
    piece &&
    pieceValues[piece.type] > 3 &&
    (x === 3 || x === 4 || y === 3 || y === 4)
  ) {
    score += 0.25;
  }

  return score;
}

function evaluateKingSafetyAdvanced(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
  ];

  let score = 0;

  for (const [dx, dy] of directions) {
    const nx = x + dx,
      ny = y + dy;
    if (!board.isWithinBounds(nx, ny)) continue;

    const adjPiece = board.getPiece(nx, ny);
    if (
      adjPiece &&
      adjPiece.color !== color &&
      (adjPiece.type === PieceType.ROOK || adjPiece.type === PieceType.QUEEN)
    ) {
      const dist = Math.abs(nx - x) + Math.abs(ny - y);
      score -= 0.5 / dist;
    }
  }

  return score;
}

function evaluateAdvancedPawnStructure(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  const leftPawn = x > 0 && board.getPiece(x - 1, y);
  const rightPawn = x < 7 && board.getPiece(x + 1, y);

  return (leftPawn &&
    leftPawn.color === color &&
    leftPawn.type === PieceType.PAWN) ||
    (rightPawn &&
      rightPawn.color === color &&
      rightPawn.type === PieceType.PAWN)
    ? 0.3
    : 0;
}

// Fonction pour évaluer les chaînes de pions
function evaluatePawnChains(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  const direction = color === PieceColor.WHITE ? -1 : 1;
  const leftDiag = board.getPiece(x - 1, y + direction);
  const rightDiag = board.getPiece(x + 1, y + direction);

  return (leftDiag &&
    leftDiag.color === color &&
    leftDiag.type === PieceType.PAWN) ||
    (rightDiag &&
      rightDiag.color === color &&
      rightDiag.type === PieceType.PAWN)
    ? 0.5
    : 0;
}

function evaluatePawnStructure(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): number {
  const passed = isPassedPawn(board, x, y, color) ? 4.5 : 0;
  const doubled = checkDoubledPawns(board, x, y, color) * 0.25;
  const isolated = checkIsolatedPawns(board, x, y, color) * 4;

  return passed - doubled - isolated;
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

  const hasAdjacentSameColorPawns =
    (leftColumn &&
      leftColumn.type === PieceType.PAWN &&
      leftColumn.color === color) ||
    (rightColumn &&
      rightColumn.type === PieceType.PAWN &&
      rightColumn.color === color);

  return hasAdjacentSameColorPawns ? 0 : 1.5; // Retourne une pénalité si le pion est isolé
}

function isPassedPawn(
  board: Board,
  x: number,
  y: number,
  color: PieceColor,
): boolean {
  const direction = color === PieceColor.WHITE ? 1 : -1;

  // Vérifie s'il y a des pions adverses devant le pion sur la même colonne
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

  // Vérifie les colonnes adjacentes pour s'assurer qu'il n'y a pas de pions adverses bloquant
  const adjacentColumns = [x - 1, x + 1];
  for (const col of adjacentColumns) {
    if (col >= 0 && col < 8) {
      for (let i = y + direction; i >= 0 && i < 8; i += direction) {
        const adjacentPiece = board.getPiece(col, i);
        if (
          adjacentPiece &&
          adjacentPiece.type === PieceType.PAWN &&
          adjacentPiece.color !== color
        ) {
          return false;
        }
      }
    }
  }

  return true;
}
