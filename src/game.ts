// src/game.ts
import { Board } from './board';

export class Game {
  private readonly board: Board;

  constructor() {
    this.board = new Board();
  }

  // Commencer une nouvelle partie (initialisation de la logique du jeu)
  public start(): void {
    console.log("Nouvelle partie d'échecs démarrée !");
  }

  // Retourner l'état actuel de l'échiquier
  public getBoard(): Board {
    return this.board;
  }
}
