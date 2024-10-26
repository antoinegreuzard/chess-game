// src/game.ts
import {Board} from './board';

export class Game {
  private board: Board;

  constructor() {
    this.board = new Board();
  }

  // Démarrer le jeu
  public start(): void {
    console.log("Bienvenue dans le jeu d'échecs !");
    this.board.printBoard();
  }
}
