// ai.worker.ts
import { Board } from './board';
import { AI } from './ai';
import { PieceColor, PieceType } from './piece';
import { Pawn } from './pieces/pawn';

let ai: AI;
let currentBoard: Board;

self.onmessage = async (event) => {
  const { boardData, aiColor, invalidMove } = event.data;

  if (boardData && aiColor) {
    ai = new AI(aiColor);
    await ai.loadGamesData();
    currentBoard = await Board.fromData(boardData);
  }

  if (invalidMove) {
    ai.addInvalidMove(invalidMove);
  }

  let bestMove = ai.makeMove(currentBoard);
  let attempts = 0;

  while (ai.isMoveInvalid(bestMove) && attempts < 50) {
    bestMove = ai.makeMove(currentBoard);
    attempts++;
  }

  let captureData: { capturedWhite: PieceType[]; capturedBlack: PieceType[] } | null = null;
  let promotionRequired = false;

  if (bestMove) {
    if (currentBoard.isCapture(bestMove.fromX, bestMove.fromY, bestMove.toX, bestMove.toY)) {
      const targetPiece = currentBoard.getPiece(bestMove.toX, bestMove.toY);
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

    const piece = currentBoard.getPiece(bestMove.fromX, bestMove.fromY);
    if (piece instanceof Pawn) {
      const promotionRow = aiColor === PieceColor.WHITE ? 7 : 0;
      if (bestMove.toY === promotionRow) {
        promotionRequired = piece.handlePromotion(
          bestMove.toX,
          bestMove.toY,
          currentBoard,
        );
      }
    }
  }

  self.postMessage({ bestMove, captureData, promotionRequired });
};
