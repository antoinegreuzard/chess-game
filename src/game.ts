// game.ts
import { Board } from './board';
import { updateCapturedPieces } from './utils/utils';
import { PieceColor, PieceType } from './piece';

export class Game {
  private readonly board: Board;
  private aiWorker: Worker;

  constructor() {
    this.board = new Board();
    this.aiWorker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
      type: 'module',
    });
  }

  public async getBoard(): Promise<Board> {
    await this.board.init();
    return this.board;
  }

  public makeAIMove(): Promise<void> {
    return new Promise((resolve) => {
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
            captureData.capturedWhite.forEach((piece: PieceType) =>
              updateCapturedPieces(piece, PieceColor.WHITE),
            );
            captureData.capturedBlack.forEach((piece: PieceType) =>
              updateCapturedPieces(piece, PieceColor.BLACK),
            );
          }
        }
        resolve(); // Résout la promesse une fois le coup de l’IA joué
      };

      const boardData = this.board.toData();
      this.aiWorker.postMessage({ boardData });
    });
  }
}
