// game.ts
import { Board } from './board';
import { updateCapturedPieces } from './utils';
import { PieceColor } from './piece';

export class Game {
  private readonly board: Board;
  private aiWorker: Worker;

  constructor() {
    this.board = new Board();
    this.aiWorker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
      type: 'module',
    });

    this.aiWorker.onmessage = (event) => {
      const { bestMove, captureData } = event.data;

      if (bestMove) {
        const wasMoved = this.board.movePiece(
          bestMove.fromX,
          bestMove.fromY,
          bestMove.toX,
          bestMove.toY,
        );

        if (wasMoved && captureData) {
          captureData.capturedWhite.forEach((piece) =>
            updateCapturedPieces(piece, PieceColor.WHITE),
          );
          captureData.capturedBlack.forEach((piece) =>
            updateCapturedPieces(piece, PieceColor.BLACK),
          );
        }
      }
    };
  }

  public getBoard(): Board {
    return this.board;
  }

  public makeAIMove(): void {
    const boardData = this.board.toData();
    this.aiWorker.postMessage({ boardData });
  }
}
