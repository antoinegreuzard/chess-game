// game.ts
import { Board } from './board';
import { updateCapturedPieces } from './utils/utils';
import { PieceColor, PieceType } from './piece';

export class Game {
  private readonly board: Board;
  private aiWorker: Worker;
  private readonly aiColor: PieceColor;
  private lastAIMove: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null = null;

  constructor(playerColor: PieceColor) {
    this.board = new Board();
    this.aiWorker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
      type: 'module',
    });
    this.aiColor =
      playerColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
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
          this.lastAIMove = bestMove;

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
      this.aiWorker.postMessage({ boardData, aiColor: this.aiColor }); // Envoie la couleur de l'IA au worker
    });
  }

  public getLastAIMove() {
    return this.lastAIMove;
  }
}
