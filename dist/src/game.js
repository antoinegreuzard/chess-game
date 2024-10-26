// src/game.ts
import { Board } from './board';
export class Game {
    constructor() {
        this.board = new Board();
    }
    // Commencer une nouvelle partie (initialisation de la logique du jeu)
    start() {
        console.log("Nouvelle partie d'échecs démarrée !");
    }
    // Retourner l'état actuel de l'échiquier
    getBoard() {
        return this.board;
    }
}
