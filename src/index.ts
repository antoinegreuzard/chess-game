// src/index.ts
import {Game} from './game';
import {CanvasRenderer} from './canvas-renderer';
import {Timer} from './timer';
import {PieceColor} from './piece'; // Ajoute cette ligne

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

// Ajoute la vérification d'échec après chaque mouvement
function handleMove(fromX: number, fromY: number, toX: number, toY: number): void {
  const piece = board.getPiece(fromX, fromY);
  if (piece && piece.isValidMove(fromX, fromY, toX, toY, board)) {
    board.movePiece(fromX, fromY, toX, toY);

    if (board.isKingInCheck(currentPlayer === 'white' ? PieceColor.WHITE : PieceColor.BLACK)) {
      alert(`Échec au ${currentPlayer === 'white' ? 'Blanc' : 'Noir'} !`);
    }

    updateTurn();
  } else {
    alert("Mouvement invalide !");
  }
}
