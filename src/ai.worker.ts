// ai.worker.ts
import { Board } from './board';
import { AI } from './ai';
import { PieceColor, PieceType } from './piece';

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
      // Remplissage du tableau de capture selon la couleur de la pièce capturée
      if (targetPiece.color === PieceColor.WHITE) {
        captureData.capturedWhite.push(targetPiece.type);
      } else {
        captureData.capturedBlack.push(targetPiece.type);
      }
    }
  }

  self.postMessage({ bestMove, captureData });
};
