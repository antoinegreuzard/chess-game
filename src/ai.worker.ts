// ai.worker.ts
import { Board } from './board';
import { AI } from './ai';
import { PieceColor, PieceType } from './piece';
import { Pawn } from './pieces/pawn';

let ai: AI;

self.onmessage = async (event) => {
  const { boardData, aiColor } = event.data;

  ai = new AI(aiColor);

  const board = await Board.fromData(boardData);
  const bestMove = ai.makeMove(board);

  // Définit explicitement le type de captureData
  let captureData: {
    capturedWhite: PieceType[];
    capturedBlack: PieceType[];
  } | null = null;

  // Vérifie si une capture est effectuée
  if (
    bestMove &&
    board.isCapture(bestMove.fromX, bestMove.fromY, bestMove.toX, bestMove.toY)
  ) {
    const targetPiece = board.getPiece(bestMove.toX, bestMove.toY);
    if (targetPiece) {
      captureData = {
        capturedWhite: [],
        capturedBlack: [],
      };
      if (targetPiece.color === PieceColor.WHITE) {
        captureData.capturedWhite.push(targetPiece.type);
      } else {
        captureData.capturedBlack.push(targetPiece.type);
      }
    }
  }

  // Vérifie si une promotion est nécessaire pour un pion
  let promotionRequired = false;
  if (
    bestMove &&
    board.getPiece(bestMove.fromX, bestMove.fromY)?.type === PieceType.PAWN
  ) {
    const piece = board.getPiece(bestMove.fromX, bestMove.fromY);
    if (piece instanceof Pawn) {
      const promotionRow = aiColor === PieceColor.WHITE ? 7 : 0;
      // Vérifie si la pièce est un pion
      if (bestMove.toY === promotionRow) {
        promotionRequired = piece.handlePromotion(
          bestMove.toX,
          bestMove.toY,
          board,
        );
      }
    }
  }

  self.postMessage({ bestMove, captureData, promotionRequired });
};
