// src/endgameTablebase.ts
import { Board } from '../board';
import { PieceColor, PieceType } from '../piece';

type Move = { fromX: number; fromY: number; toX: number; toY: number };

function flipMove(move: Move, flipBoard: boolean): Move {
  if (!flipBoard) return move;

  return {
    fromX: 7 - move.fromX,
    fromY: 7 - move.fromY,
    toX: 7 - move.toX,
    toY: 7 - move.toY,
  };
}

// Retourne un mouvement optimal pour une fin de partie classique si disponible
export function getEndgameMove(
  board: Board,
  color: PieceColor,
  flipBoard: boolean = false,
): Move | null {
  const pieces = board.getPieces();
  let move: Move | null = null;

  // Roi + Tour contre Roi
  if (
    pieces.length === 3 &&
    hasPiece(pieces, PieceType.KING, color) &&
    hasPiece(pieces, PieceType.ROOK, color) &&
    hasPiece(pieces, PieceType.KING, getOpponentColor(color))
  ) {
    move = getKingRookVsKingMove(board, color);
  }

  // Roi + Fou + Cavalier contre Roi
  else if (
    pieces.length === 4 &&
    hasPiece(pieces, PieceType.KING, color) &&
    hasPiece(pieces, PieceType.BISHOP, color) &&
    hasPiece(pieces, PieceType.KNIGHT, color) &&
    hasPiece(pieces, PieceType.KING, getOpponentColor(color))
  ) {
    move = getKingBishopKnightVsKingMove(board, color);
  }

  // Roi + deux Fous contre Roi
  else if (
    pieces.length === 4 &&
    hasPiece(pieces, PieceType.KING, color) &&
    hasPiece(pieces, PieceType.BISHOP, color) &&
    pieces.filter(
      (piece) => piece.type === PieceType.BISHOP && piece.color === color,
    ).length === 2 &&
    hasPiece(pieces, PieceType.KING, getOpponentColor(color))
  ) {
    move = getKingTwoBishopsVsKingMove(board, color);
  }

  // Roi + Pion contre Roi (pour promotion)
  else if (
    pieces.length === 3 &&
    hasPiece(pieces, PieceType.KING, color) &&
    hasPiece(pieces, PieceType.PAWN, color) &&
    hasPiece(pieces, PieceType.KING, getOpponentColor(color))
  ) {
    move = getKingPawnVsKingMove(board, color);
  }

  // Ajuste le mouvement pour `flipBoard`
  return move ? flipMove(move, color === PieceColor.BLACK || flipBoard) : null;
}

// Fonction utilitaire pour vérifier la présence d'une pièce spécifique
function hasPiece(pieces: any[], type: PieceType, color: PieceColor): boolean {
  return pieces.some((piece) => piece.type === type && piece.color === color);
}

// Renvoie l'autre couleur
function getOpponentColor(color: PieceColor): PieceColor {
  return color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
}

// Génère un mouvement optimal pour Roi + Tour contre Roi
function getKingRookVsKingMove(board: Board, color: PieceColor): Move | null {
  const opponentKingPos = findPiecePosition(
    board,
    PieceType.KING,
    getOpponentColor(color),
  );
  const rookPos = findPiecePosition(board, PieceType.ROOK, color);

  if (!opponentKingPos || !rookPos) return null;

  // Exemple : pousse la tour pour bloquer le roi adverse dans un coin
  if (opponentKingPos.x < 4) {
    return {
      fromX: rookPos.x,
      fromY: rookPos.y,
      toX: opponentKingPos.x + 1,
      toY: opponentKingPos.y,
    };
  } else {
    return {
      fromX: rookPos.x,
      fromY: rookPos.y,
      toX: opponentKingPos.x - 1,
      toY: opponentKingPos.y,
    };
  }
}

// Génère un mouvement optimal pour Roi + Fou + Cavalier contre Roi
function getKingBishopKnightVsKingMove(
  board: Board,
  color: PieceColor,
): Move | null {
  const opponentKingPos = findPiecePosition(
    board,
    PieceType.KING,
    getOpponentColor(color),
  );
  const knightPos = findPiecePosition(board, PieceType.KNIGHT, color);
  const bishopPos = findPiecePosition(board, PieceType.BISHOP, color);

  if (!opponentKingPos || !knightPos || !bishopPos) return null;

  // Exemple : pousse le cavalier et le fou pour rapprocher le roi adverse vers un coin
  if (opponentKingPos.x < 4) {
    return {
      fromX: knightPos.x,
      fromY: knightPos.y,
      toX: opponentKingPos.x + 1,
      toY: opponentKingPos.y,
    };
  } else {
    return {
      fromX: bishopPos.x,
      fromY: bishopPos.y,
      toX: opponentKingPos.x - 1,
      toY: opponentKingPos.y,
    };
  }
}

// Génère un mouvement optimal pour Roi + deux Fous contre Roi
function getKingTwoBishopsVsKingMove(
  board: Board,
  color: PieceColor,
): Move | null {
  const opponentKingPos = findPiecePosition(
    board,
    PieceType.KING,
    getOpponentColor(color),
  );
  const bishops = findAllPiecesPositions(board, PieceType.BISHOP, color);

  if (!opponentKingPos || bishops.length < 2) return null;

  // Les deux fous coordonnent pour forcer le roi adverse vers un coin
  return {
    fromX: bishops[0].x,
    fromY: bishops[0].y,
    toX: opponentKingPos.x,
    toY: opponentKingPos.y > 4 ? opponentKingPos.y - 1 : opponentKingPos.y + 1,
  };
}

// Génère un mouvement optimal pour Roi + Pion contre Roi (promotion)
function getKingPawnVsKingMove(board: Board, color: PieceColor): Move | null {
  const opponentKingPos = findPiecePosition(
    board,
    PieceType.KING,
    getOpponentColor(color),
  );
  const pawnPos = findPiecePosition(board, PieceType.PAWN, color);

  if (!opponentKingPos || !pawnPos) return null;

  // Pousse le pion vers la promotion (vers la 8ème rangée pour les Blancs, 1ère pour les Noirs)
  const direction = color === PieceColor.WHITE ? 1 : -1;
  return {
    fromX: pawnPos.x,
    fromY: pawnPos.y,
    toX: pawnPos.x,
    toY: pawnPos.y + direction,
  };
}

// Fonction utilitaire pour trouver la position d'une pièce spécifique
function findPiecePosition(
  board: Board,
  pieceType: PieceType,
  color: PieceColor,
): { x: number; y: number } | null {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (piece && piece.type === pieceType && piece.color === color) {
        return { x, y };
      }
    }
  }
  return null;
}

// Fonction utilitaire pour trouver toutes les positions d'un type de pièce
function findAllPiecesPositions(
  board: Board,
  pieceType: PieceType,
  color: PieceColor,
): { x: number; y: number }[] {
  const positions = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (piece && piece.type === pieceType && piece.color === color) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}
