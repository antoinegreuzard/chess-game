// tests/mocks/WorkerMock.ts
import { Board } from '../../src/board';
import { AI } from '../../src/ai';
import { PieceColor, PieceType } from '../../src/piece';

export class WorkerMock {
  onmessage: ((event: { data: any }) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  postMessage(data: any) {
    if (this.onmessage) {
      // Simule le calcul du meilleur mouvement et capture
      setTimeout(async () => {
        const board = await Board.fromData(data.boardData);
        const ai = new AI(PieceColor.BLACK);

        const bestMove = ai.makeMove(board);

        // Simule la capture de données si nécessaire
        let captureData: {
          capturedWhite: PieceType[];
          capturedBlack: PieceType[];
        } | null = null;

        if (
          bestMove &&
          board.isCapture(bestMove.fromX, bestMove.fromY, bestMove.toX, bestMove.toY)
        ) {
          const targetPiece = board.getPiece(bestMove.toX, bestMove.toY);
          captureData = {
            capturedWhite: targetPiece && targetPiece.color === PieceColor.WHITE ? [targetPiece.type] : [],
            capturedBlack: targetPiece && targetPiece.color === PieceColor.BLACK ? [targetPiece.type] : [],
          };
        }

        // Envoie les données simulées comme réponse
        this.onmessage!({ data: { bestMove, captureData } });
      }, 0);
    }
  }

  terminate() {
    // Terminer la simulation si nécessaire
  }
}
