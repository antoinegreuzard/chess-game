import { Board } from './board';
import { AI } from './ai';
import { PieceColor } from './piece';

export class Game {
  private board: Board;
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
        this.board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
      } else {
        console.log("Aucun mouvement valide pour l'IA.");
      }
    }
  }
}
