// src/index.ts
import { Game } from './game';
import { CanvasRenderer } from './canvas-renderer';
import { Timer } from './timer';
import { PieceColor, PieceType } from './piece';
import { showMessage, updateCapturedPieces } from './utils';

const game = new Game();
const board = game.getBoard();
const moveHistoryElement = document.getElementById('moveHistory')!;
const currentTurnElement = document.getElementById('currentTurn')!;
const timerElement = document.getElementById('timer')!;
const passTurnButton = document.getElementById('passTurnButton')!;
const gameMessageElement = document.getElementById('gameMessage')!;
const replayButton = document.getElementById('replayButton')!;

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

// Initialiser le timer avec 60 secondes pour chaque joueur
let whiteTimer = new Timer(60, (timeLeft) =>
  updateTimerDisplay(timeLeft, PieceColor.WHITE),
);
let blackTimer = new Timer(60, (timeLeft) =>
  updateTimerDisplay(timeLeft, PieceColor.BLACK),
);

// Fonction pour mettre à jour l'affichage du timer
function updateTimerDisplay(timeLeft: number, color: PieceColor) {
  if (color === currentPlayer) {
    timerElement.textContent = `Temps restant: ${timeLeft}s`;
    if (timeLeft <= 0 && !isGameEnded) {
      endGame();
      showMessage(
        `${currentPlayer === PieceColor.WHITE ? 'Noir' : 'Blanc'} gagne par temps écoulé !`,
      );
    }
  }
}

// Démarrer le jeu et dessiner le plateau
const renderer = new CanvasRenderer(board, 'chessBoard', handleMove);
renderer.drawBoard();
whiteTimer.start();

// Fonction pour terminer la partie
export function endGame() {
  // Empêche l'appel multiple d'endGame
  if (isGameEnded) return;
  isGameEnded = true;

  // Stoppez les timers seulement si ce n'est pas déjà fait
  if (whiteTimer.isRunning) whiteTimer.stop();
  if (blackTimer.isRunning) blackTimer.stop();

  gameState = 'waiting';
  showMessage('La partie est terminée !');
  replayButton.style.display = 'block';
}

// Fonction pour effacer le message d'erreur
function clearMessage() {
  gameMessageElement.textContent = '';
  gameMessageElement.style.display = 'none';
}

// Fonction pour mettre à jour le tour et l'affichage
function updateTurn() {
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

  // Vérifie les conditions de nullité
  if (board.isStalemate(currentPlayer)) {
    endGame();
    showMessage('Pat ! La partie est nulle.');
  }

  if (board.isInsufficientMaterial()) {
    endGame();
    showMessage('Matériel insuffisant pour continuer, partie nulle !');
  }

  if (board.isFiftyMoveRule()) {
    endGame();
    showMessage('Règle des 50 coups, partie nulle !');
  }

  // Seul "playing" permet de jouer
  if (gameState === 'playing') {
    gameState = 'playing';
  }

  // Crée un nouveau tour dans l'historique des mouvements
  moveHistory.push([]);

  // Si c'est au tour de l'IA, faire jouer l'IA automatiquement
  if (currentPlayer === PieceColor.BLACK) {
    game.makeAIMove();
    renderer.drawBoard();
    updateTurn(); // Change de tour après que l'IA a joué
  }
}

// Ajouter un mouvement à l'historique
function addMoveToHistory(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  pieceType: PieceType,
) {
  const moveText = `${pieceType} de (${fromX}, ${fromY}) à (${toX}, ${toY})`;
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
  if (gameState === 'waiting' || hasMoved) {
    showMessage('Veuillez attendre le prochain tour !');
    return false;
  }

  const piece = board.getPiece(fromX, fromY);
  const targetPiece = board.getPiece(toX, toY);

  // Vérifie que c'est bien le tour du joueur qui joue
  if (!piece || piece.color !== currentPlayer) {
    showMessage(
      `C'est le tour de ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
    );
    return false;
  }

  // Vérifie si le mouvement est valide pour la pièce et respecte les règles des échecs
  if (piece.isValidMove(fromX, fromY, toX, toY, board)) {
    // Si une pièce normale est capturée, l'ajouter aux pièces capturées
    if (board.movePiece(fromX, fromY, toX, toY)) {
      if (targetPiece) {
        updateCapturedPieces(targetPiece.type, targetPiece.color);
      }

      // Ajoute le mouvement à l'historique
      addMoveToHistory(fromX, fromY, toX, toY, piece.type);

      // Utilise l'animation pour le déplacement
      renderer.animateMove(fromX, fromY, toX, toY, piece);

      // Vérifie si cela met le roi adverse en échec
      const opponentColor =
        currentPlayer === PieceColor.WHITE
          ? PieceColor.BLACK
          : PieceColor.WHITE;
      if (board.isKingInCheck(opponentColor)) {
        if (board.isCheckmate(opponentColor)) {
          endGame();
          showMessage(
            `Échec et Mat ! ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'} gagne !`,
          );
        } else {
          showMessage(
            `Échec au ${opponentColor === PieceColor.WHITE ? 'Blanc' : 'Noir'} !`,
          );
        }
      }

      // Change de tour après un mouvement valide
      updateTurn();

      return true;
    }

    // Si le mouvement est invalide, retourne faux
    showMessage('Mouvement invalide !');
    return false;
  }

  // Ajoute un return false par défaut si aucune condition n'est remplie
  return false;
}

// Gérer le clic sur "Passer son tour"
if (passTurnButton) {
  passTurnButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (gameState === 'playing' && currentPlayer === PieceColor.WHITE) {
      showMessage(
        `Tour passé pour ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
      );
      updateTurn();
    }
  });
}

// Gérer le clic sur "Rejouer"
if (replayButton) {
  replayButton.addEventListener('click', () => {
    location.reload();
  });
}
