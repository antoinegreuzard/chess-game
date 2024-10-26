// src/index.ts
import {Game} from './game';
import {CanvasRenderer} from './canvas-renderer';

// Initialise le jeu et le plateau
const game = new Game();
const board = game.getBoard();

// Initialise le rendu sur le canevas
const renderer = new CanvasRenderer(board, 'chessBoard');
renderer.drawBoard();
