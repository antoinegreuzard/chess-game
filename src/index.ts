// src/index.ts
import {Game} from './game';
import {CanvasRenderer} from './canvas-renderer';
import {Timer} from './timer';
import {PieceColor, PieceType} from './piece';

const game = new Game();
const board = game.getBoard();
const moveHistoryElement = document.getElementById('moveHistory')!;
const currentTurnElement = document.getElementById('currentTurn')!;
const timerElement = document.getElementById('timer')!;

let currentPlayer: PieceColor = PieceColor.WHITE; // Les blancs commencent toujours
let gameState: 'playing' | 'waiting' = 'playing'; // Contrôle du statut de jeu
let hasMoved: boolean = false; // Indique si un mouvement a déjà été effectué dans ce tour

// Initialiser le timer avec 60 secondes pour chaque joueur
let whiteTimer = new Timer(60, (timeLeft) => updateTimerDisplay(timeLeft, PieceColor.WHITE));
let blackTimer = new Timer(60, (timeLeft) => updateTimerDisplay(timeLeft, PieceColor.BLACK));

// Fonction pour mettre à jour l'affichage du timer
function updateTimerDisplay(timeLeft: number, color: PieceColor) {
  if (color === currentPlayer) {
    timerElement.textContent = `Temps restant: ${timeLeft}s`;
    if (timeLeft <= 0) {
      alert(`Temps écoulé ! ${currentPlayer === PieceColor.WHITE ? 'Noir' : 'Blanc'} gagne !`);
      endGame();
    }
  }
}

// Démarrer le jeu et dessiner le plateau
const renderer = new CanvasRenderer(board, 'chessBoard', handleMove); // Passe handleMove comme callback
renderer.drawBoard();
whiteTimer.start(); // Démarre le timer pour les blancs au début

// Fonction pour terminer la partie
function endGame() {
  whiteTimer.stop();
  blackTimer.stop();
  gameState = 'waiting'; // Empêcher les mouvements après la fin du jeu
  alert("La partie est terminée.");
}

// Fonction pour mettre à jour le tour et l'affichage
function updateTurn() {
  currentPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  currentTurnElement.textContent = `Tour actuel: ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`;
  hasMoved = false; // Réinitialise l'état de mouvement pour le prochain tour

  // Gérer le changement de timer
  if (currentPlayer === PieceColor.WHITE) {
    blackTimer.stop();
    whiteTimer.reset(60);
    whiteTimer.start();
  } else {
    whiteTimer.stop();
    blackTimer.reset(60);
    blackTimer.start();
  }

  gameState = 'playing'; // Réactive les mouvements pour le prochain joueur
}

// Ajouter un mouvement à l'historique
function addMoveToHistory(fromX: number, fromY: number, toX: number, toY: number, pieceType: PieceType) {
  const moveText = `${pieceType} de (${fromX}, ${fromY}) à (${toX}, ${toY})`;
  const listItem = document.createElement('li');
  listItem.textContent = moveText;
  moveHistoryElement.appendChild(listItem);
}

// Fonction pour gérer un mouvement sur le plateau
export function handleMove(fromX: number, fromY: number, toX: number, toY: number): void {
  if (gameState === 'waiting' || hasMoved) {
    alert("Veuillez attendre le prochain tour !");
    return;
  }
  if (!Number.isInteger(toX) || !Number.isInteger(toY) || toX < 0 || toX > 7 || toY < 0 || toY > 7) {
    alert("Coordonnées invalides !");
    return;
  }

  const piece = board.getPiece(fromX, fromY);

  // Vérifie que c'est bien le tour du joueur qui joue
  if (!piece || piece.color !== currentPlayer) {
    alert(`Ce n'est pas le tour de ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`);
    return;
  }

  // Vérifie si le mouvement est valide pour la pièce et respecte les règles des échecs
  if (piece.isValidMove(fromX, fromY, toX, toY, board)) {
    // Effectue le mouvement uniquement si valide
    if (board.movePiece(fromX, fromY, toX, toY)) {
      // Marquer que le joueur a effectué son coup
      hasMoved = true;

      // Ajoute le mouvement à l'historique
      addMoveToHistory(fromX, fromY, toX, toY, piece.type);

      // Utilise l'animation pour le déplacement
      renderer.animateMove(fromX, fromY, toX, toY, piece);

      // Vérifie si cela met le roi adverse en échec
      if (board.isKingInCheck(currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE)) {
        alert(`Échec au ${currentPlayer === PieceColor.WHITE ? 'Noir' : 'Blanc'} !`);
      }

      // Change de tour après un mouvement valide
      gameState = 'waiting'; // Bloque les mouvements jusqu'à ce que le tour change
      updateTurn();
    } else {
      alert("Mouvement invalide !");
    }
  } else {
    alert("Mouvement invalide !");
  }
}
