// src/index.ts
import {Game} from './game';
import {CanvasRenderer} from './canvas-renderer';
import {Timer} from './timer';

const game = new Game();
const board = game.getBoard();
const renderer = new CanvasRenderer(board, 'chessBoard');
const moveHistoryElement = document.getElementById('moveHistory')!;
const currentTurnElement = document.getElementById('currentTurn')!;
const timerElement = document.getElementById('timer')!;

let currentPlayer: 'white' | 'black' = 'white';

// Initialiser le timer avec 60 secondes
const timer = new Timer(60, (timeLeft) => {
  timerElement.textContent = `Temps restant: ${timeLeft}s`;
  if (timeLeft <= 0) {
    alert(`Temps écoulé ! ${currentPlayer === 'white' ? 'Noir' : 'Blanc'} gagne !`);
  }
});

// Démarrer le jeu et dessiner le plateau
renderer.drawBoard();
timer.start();

// Fonction pour mettre à jour le tour et l'affichage
function updateTurn() {
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
  currentTurnElement.textContent = `Tour actuel: ${currentPlayer === 'white' ? 'Blanc' : 'Noir'}`;
  timer.reset(60);
}

// Ajouter un mouvement à l'historique
function addMoveToHistory(move: string) {
  const listItem = document.createElement('li');
  listItem.textContent = move;
  moveHistoryElement.appendChild(listItem);
}
