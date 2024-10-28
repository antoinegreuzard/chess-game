import { Board } from './board';
import { AI } from './ai';
import { PieceColor } from './piece';
import { showMessage, updateCapturedPieces } from './utils';
import { endGame } from '.';

export class Game {
  private readonly board: Board;
  private readonly ai: AI | null;

  constructor() {
    this.board = new Board();
    // Initialise l'IA pour jouer avec les Noirs par exemple
    this.ai = new AI(PieceColor.BLACK);
  }

  public getBoard(): Board {
    return this.board;
  }

  // Méthode pour faire jouer l'IA
  public makeAIMove(): void {
    if (this.ai) {
      const move = this.ai.makeMove(this.board);

      if (move) {
        const targetPiece = this.board.getPiece(move.toX, move.toY);

        // Si l'IA capture une pièce
        if (targetPiece) {
          // Mettre à jour la liste des pièces capturées
          updateCapturedPieces(targetPiece.type, targetPiece.color);
        }

        // Effectuer le mouvement de l'IA sur le plateau
        this.board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
      } else {
        if (this.board.isKingInCheck(PieceColor.BLACK)) {
          if (this.board.isCheckmate(PieceColor.BLACK)) {
            endGame();
            showMessage(`Échec et Mat ! Blanc gagne !`);
          } else {
            showMessage(`Échec au Noir !`);
          }
        } else {
          endGame();
        }
      }
    }
  }
}
