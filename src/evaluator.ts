// src/evaluator.ts
import { Board } from './board';
import { PieceColor, PieceType } from './piece';

// Valeurs des pièces (évaluation de base)
const pieceValues: { [key in PieceType]: number } = {
  [PieceType.PAWN]: 1,
  [PieceType.KNIGHT]: 3,
  [PieceType.BISHOP]: 3.25,
  [PieceType.ROOK]: 5,
  [PieceType.QUEEN]: 9,
  [PieceType.KING]: 0, // Le roi est infiniment précieux, sa perte signifie la fin de la partie
};

// Bonus pour le contrôle du centre du plateau (cases centrales plus précieuses)
const centerControlBonus: { [key: string]: number } = {
  '3,3': 0.5, '3,4': 0.5, '4,3': 0.5, '4,4': 0.5, // Cases centrales
  '2,3': 0.25, '2,4': 0.25, '3,2': 0.25, '4,2': 0.25, '4,5': 0.25, '3,5': 0.25, '5,3': 0.25, '5,4': 0.25, // Cases autour
};

// Bonus pour la sécurité du roi (roi en sécurité dans un coin)
const kingSafetyBonus: { [key in PieceColor]: { [key: string]: number } } = {
  [PieceColor.WHITE]: {
    '0,6': 0.5, '0,7': 0.5, // Roi blanc roqué sur l'aile roi
    '0,1': 0.5, '0,0': 0.5, // Roi blanc roqué sur l'aile dame
  },
  [PieceColor.BLACK]: {
    '7,6': 0.5, '7,7': 0.5, // Roi noir roqué sur l'aile roi
    '7,1': 0.5, '7,0': 0.5, // Roi noir roqué sur l'aile dame
  },
};

// Fonction d'évaluation principale
export function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (piece) {
        // Calcul de la valeur de la pièce
        let pieceScore = pieceValues[piece.type];

        // Contrôle du centre
        const positionKey = `${x},${y}`;
        if (centerControlBonus[positionKey]) {
          pieceScore += centerControlBonus[positionKey];
        }

        // Bonus pour la sécurité du roi
        if (piece.type === PieceType.KING && kingSafetyBonus[piece.color][positionKey]) {
          pieceScore += kingSafetyBonus[piece.color][positionKey];
        }

        // Ajoute la valeur de la pièce au score total, en tenant compte de la couleur
        score += piece.color === color ? pieceScore : -pieceScore;
      }
    }
  }

  return score;
}
