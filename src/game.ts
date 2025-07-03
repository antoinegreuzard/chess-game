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

    this.board.setFlipBoard(playerColor === PieceColor.BLACK);
  }

  public async getBoard(): Promise<Board> {
    await this.board.init();
    return this.board;
  }

  public makeAIMove(): Promise<void> {
    return new Promise((resolve) => {
      this.aiWorker.onmessage = async (event) => {
        let { bestMove, captureData, promotionRequired } = event.data;

        let isMoveLegal = await this.isAIMoveLegal(bestMove);
        let attempts = 0;

        while (!isMoveLegal && attempts < 50) {
          this.aiWorker.postMessage({ invalidMove: bestMove });

          const newEvent = await new Promise((res) => {
            this.aiWorker.onmessage = res;
          });

          bestMove = newEvent.data.bestMove;
          captureData = newEvent.data.captureData;
          promotionRequired = newEvent.data.promotionRequired;

          isMoveLegal = await this.isAIMoveLegal(bestMove);
          attempts++;
        }

        if (isMoveLegal && bestMove) {
          this.lastAIMove = bestMove;
          this.board.movePiece(bestMove.fromX, bestMove.fromY, bestMove.toX, bestMove.toY, false);

          if (captureData) {
            captureData.capturedWhite.forEach((piece: PieceType) =>
              updateCapturedPieces(piece, PieceColor.WHITE),
            );
            captureData.capturedBlack.forEach((piece: PieceType) =>
              updateCapturedPieces(piece, PieceColor.BLACK),
            );
          }
        } else {
          console.warn("Aucun coup valide n'a été trouvé par l'IA après plusieurs tentatives.");
        }

        resolve();
      };

      const boardData = this.board.toData();
      this.aiWorker.postMessage({ boardData, aiColor: this.aiColor });
    });
  }

  private async isAIMoveLegal(bestMove: { fromX: number, fromY: number, toX: number, toY: number }): Promise<boolean> {
    const testBoard = await Board.fromData(this.board.toData());

    // Simuler le coup sur un plateau temporaire
    const piece = testBoard.getPiece(bestMove.fromX, bestMove.fromY);
    const targetPiece = testBoard.getPiece(bestMove.toX, bestMove.toY);

    testBoard.setPiece(bestMove.toX, bestMove.toY, piece);
    testBoard.setPiece(bestMove.fromX, bestMove.fromY, null);

    const isStillInCheck = testBoard.isKingInCheck(this.aiColor);

    // Restaurer les positions (inutile si plateau temporaire est jetable)
    testBoard.setPiece(bestMove.fromX, bestMove.fromY, piece);
    testBoard.setPiece(bestMove.toX, bestMove.toY, targetPiece);

    return !isStillInCheck;
  }

  public getLastAIMove() {
    return this.lastAIMove;
  }
}
