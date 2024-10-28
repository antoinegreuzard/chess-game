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

  public start(): void {
    console.log('Nouvelle partie d\'échecs démarrée !');
  }

  public getBoard(): Board {
    return this.board;
  }

  // Réinitialise le jeu
  public reset(): void {
    this.board = new Board(); // Crée un nouveau plateau
    this.board.setupInitialPosition(); // Réinitialise les positions initiales des pièces
    console.log('Partie réinitialisée !');
  }

  // Méthode pour faire jouer l'IA
  public makeAIMove(): void {
    console.log(this);
    if (this.ai) {
      const move = this.ai.makeMove(this.board);

      console.log(move);
      if (move) {
        this.board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
      } else {
        console.log('Aucun mouvement valide pour l\'IA.');
      }
    }
  }
}
