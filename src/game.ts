// game.ts
import { Board } from './board';
import { updateCapturedPieces } from './utils/utils';
import { PieceColor, PieceType } from './piece';
import * as fs from 'fs';
import * as path from 'path';

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
  private moveHistory: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    pieceType: PieceType;
  }[][];

  constructor(
    playerColor: PieceColor,
    moveHistory: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      pieceType: PieceType;
    }[][],
  ) {
    this.board = new Board();
    this.aiWorker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
      type: 'module',
    });
    this.aiColor =
      playerColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    this.moveHistory = moveHistory;
  }

  public async getBoard(): Promise<Board> {
    await this.board.init();
    return this.board;
  }

  public makeAIMove(): Promise<void> {
    return new Promise((resolve) => {
      this.aiWorker.onmessage = (event) => {
        const { bestMove, captureData, promotionRequired } = event.data;

        if (promotionRequired) {
          // Affiche la boîte de dialogue pour sélectionner la promotion
          const promotionDialog = document.getElementById(
            'promotionDialog',
          ) as HTMLDivElement;
          promotionDialog.style.display = 'block';

          window.promote = (pieceType: string) => {
            promotionDialog.style.display = 'none';
            // Envoie la promotion choisie au worker si besoin
            this.aiWorker.postMessage({ promotionType: pieceType });
          };
        }

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

  public saveGameToFile() {
    const gameData = {
      moves: this.moveHistory,
      winner: this.board.getWinner(),
    };

    const fileName = `game_${Date.now()}.json`;
    const filePath = path.join(__dirname, '../public', fileName);

    fs.writeFile(filePath, JSON.stringify(gameData, null, 2), (err) => {
      if (err) {
        console.error('Erreur de sauvegarde de la partie:', err);
      } else {
        console.log('Partie sauvegardée avec succès dans', fileName);
      }
    });
  }
}
