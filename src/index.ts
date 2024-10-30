// src/index.ts
import { Game } from './game';
import { CanvasRenderer } from './canvas-renderer';
import { Timer } from './timer';
import { PieceColor, PieceType } from './piece';
import {
  getPieceSymbol,
  showMessage,
  updateCapturedPieces,
} from './utils/utils';

const game = new Game();
const board = await game.getBoard();
const moveHistoryElement = document.getElementById(
  'moveHistory',
) as HTMLUListElement;
const currentTurnElement = document.getElementById(
  'currentTurn',
) as HTMLDivElement;
const timerElement = document.getElementById('timer') as HTMLDivElement;
const passTurnButton = document.getElementById(
  'passTurnButton',
) as HTMLButtonElement;
const gameMessageElement = document.getElementById(
  'gameMessage',
) as HTMLDivElement;
const replayButton = document.getElementById(
  'replayButton',
) as HTMLButtonElement;

let currentPlayer: PieceColor = PieceColor.WHITE; // Les blancs commencent toujours
let gameState: 'playing' | 'waiting' = 'playing'; // Ajout de l'état pour la proposition de nullité
let hasMoved: boolean = false; // Indique si un mouvement a déjà été effectué dans ce tour
let moveHistory: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  pieceType: PieceType;
}[][] = [[]]; // Historique des mouvements par tour
let isGameEnded = false;
let isAITurn = false;

// Initialiser le timer avec 60 secondes pour chaque joueur
let whiteTimer = new Timer(60, (timeLeft) =>
  updateTimerDisplay(timeLeft, PieceColor.WHITE),
);
let blackTimer = new Timer(60, (timeLeft) =>
  updateTimerDisplay(timeLeft, PieceColor.BLACK),
);

// Fonction pour mettre à jour l'affichage du timer
export function updateTimerDisplay(timeLeft: number, color: PieceColor) {
  if (color === currentPlayer) {
    timerElement.textContent = `Temps restant: ${timeLeft}s`;
    if (timeLeft <= 0 && !isGameEnded) {
      endGame(
        `${currentPlayer === PieceColor.WHITE ? 'Noir' : 'Blanc'} gagne par temps écoulé !`,
      );
    }
  }
}

// Démarrer le jeu et dessiner le plateau
const renderer = new CanvasRenderer(board, 'chessBoard', handleMove);
renderer.drawBoard();
whiteTimer.start();

export function endGame(message: string) {
  showMessage(message);
  isGameEnded = true;
  replayButton.style.display = 'block';
  if (whiteTimer.isRunning) whiteTimer.stop();
  if (blackTimer.isRunning) blackTimer.stop();
}

// Fonction pour effacer le message d'erreur
function clearMessage() {
  gameMessageElement.textContent = '';
  gameMessageElement.style.display = 'none';
}

// Fonction pour mettre à jour le tour et l'affichage
async function updateTurn() {
  clearMessage();
  currentPlayer =
    currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  currentTurnElement.textContent = `Tour actuel: ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`;
  hasMoved = false;

  // Gestion du bouton "Passer son tour"
  passTurnButton.disabled = currentPlayer === PieceColor.BLACK;

  // Gestion des timers
  if (currentPlayer === PieceColor.WHITE) {
    if (blackTimer.isRunning) blackTimer.stop();
    whiteTimer.reset(60);
  } else {
    if (whiteTimer.isRunning) whiteTimer.stop();
    blackTimer.reset(60);
  }

  if (
    board.isKingInCheck(PieceColor.BLACK) ||
    board.isKingInCheck(PieceColor.WHITE)
  ) {
    if (board.isCheckmate(PieceColor.BLACK)) {
      endGame('Échec et Mat ! Blanc gagne !');
    }

    if (board.isCheckmate(PieceColor.WHITE)) {
      endGame('Échec et Mat ! Noir gagne !');
    }
  }

  // Vérifie les conditions de nullité
  if (board.isStalemate(currentPlayer)) {
    endGame('Pat ! La partie est nulle.');
  }

  if (board.isInsufficientMaterial()) {
    endGame('Matériel insuffisant pour continuer, partie nulle !');
  }

  if (board.isFiftyMoveRule()) {
    endGame('Règle des 50 coups, partie nulle !');
  }

  // Seul "playing" permet de jouer
  if (gameState === 'playing') {
    gameState = 'playing';
  }

  // Crée un nouveau tour dans l'historique des mouvements
  moveHistory.push([]);

  // Si c'est au tour de l'IA, faire jouer l'IA automatiquement
  if (currentPlayer === PieceColor.BLACK) {
    await triggerAIMove();
  }
}

async function triggerAIMove() {
  isAITurn = true;
  await game.makeAIMove();
  renderer.drawBoard();
  isAITurn = false;
  await updateTurn(); // Revenir au tour du joueur après le coup de l'IA
}

// Ajouter un mouvement à l'historique
function addMoveToHistory(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  pieceType: PieceType,
) {
  const moveText = `${getPieceSymbol(pieceType, PieceColor.WHITE)} de (${fromX}, ${fromY}) à (${toX}, ${toY})`;
  const listItem = document.createElement('li');
  listItem.textContent = moveText;
  moveHistoryElement.appendChild(listItem);

  // Ajoutez le mouvement au tour actuel
  moveHistory[moveHistory.length - 1].push({
    fromX,
    fromY,
    toX,
    toY,
    pieceType,
  });
}

// Fonction pour gérer un mouvement sur le plateau
export function handleMove(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): boolean {
  if (gameState === 'waiting' || hasMoved || isGameEnded) {
    showMessage('Veuillez attendre le prochain tour !');
    return false;
  }

  const piece = board.getPiece(fromX, fromY);
  const targetPiece = board.getPiece(toX, toY); // Ajout pour vérifier la cible

  if (!piece || piece.color !== currentPlayer) {
    if (!isAITurn) {
      // Affiche le message uniquement si ce n'est pas le tour de l'IA
      showMessage(
        `C'est le tour de ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
      );
    }
    return false;
  }

  if (piece.isValidMove(fromX, fromY, toX, toY, board)) {
    if (board.movePiece(fromX, fromY, toX, toY)) {
      hasMoved = true; // Empêche les actions supplémentaires

      // Enregistrement de la capture si une pièce est prise
      if (targetPiece) {
        updateCapturedPieces(targetPiece.type, targetPiece.color);
      }

      addMoveToHistory(fromX, fromY, toX, toY, piece.type);
      renderer.animateMove(fromX, fromY, toX, toY, piece);
      updateTurn();
      return true;
    }
    showMessage('Mouvement invalide !');
  }
  return false;
}

// Gérer le clic sur "Passer son tour"
if (passTurnButton) {
  passTurnButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (
      gameState === 'playing' &&
      currentPlayer === PieceColor.WHITE &&
      !board.isKingInCheck(PieceColor.WHITE)
    ) {
      showMessage(
        `Tour passé pour ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
      );
      await updateTurn();
    }
  });
}

// Gérer le clic sur "Rejouer"
if (replayButton) {
  replayButton.addEventListener('click', () => {
    location.reload();
  });
}
export { Game };
