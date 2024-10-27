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
const drawButton = document.getElementById('drawButton')!;
const undoButton = document.getElementById('undoButton')!;
const acceptDrawButton = document.getElementById('acceptDrawButton')!;

let currentPlayer: PieceColor = PieceColor.WHITE; // Les blancs commencent toujours
let gameState: 'playing' | 'waiting' | 'drawProposed' = 'playing'; // Ajout de l'état pour la proposition de nullité
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
      showMessage(
        `${currentPlayer === PieceColor.WHITE ? 'Noir' : 'Blanc'} gagne par temps écoulé !`,
      );
      endGame();
    }
  }
}

// Démarrer le jeu et dessiner le plateau
const renderer = new CanvasRenderer(board, 'chessBoard', handleMove);
renderer.drawBoard();
whiteTimer.start();

// Fonction pour terminer la partie

function endGame() {
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
    showMessage('Pat ! La partie est nulle.');
    endGame();
  }

  if (board.isInsufficientMaterial()) {
    showMessage('Matériel insuffisant pour continuer, partie nulle !');
    endGame();
  }

  if (board.isFiftyMoveRule()) {
    showMessage('Règle des 50 coups, partie nulle !');
    endGame();
  }

  // Gestion de la proposition de nullité
  if (gameState === 'drawProposed') {
    acceptDrawButton.style.display = 'block';
  } else {
    acceptDrawButton.style.display = 'none';
  }

  // Seul "playing" permet de jouer
  if (gameState === 'playing') {
    gameState = 'playing';
  }

  // Crée un nouveau tour dans l'historique des mouvements
  moveHistory.push([]);
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
      `Ce n'est pas le tour de ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
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
          showMessage(
            `Échec et Mat ! ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'} gagne !`,
          );
          endGame();
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
}

// Gérer le clic sur "Passer son tour"
passTurnButton.addEventListener('click', (event) => {
  event.preventDefault();
  if (gameState === 'playing') {
    showMessage(
      `Tour passé pour ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
    );
    updateTurn();
  }
});

// Gérer le clic sur "Rejouer"
replayButton.addEventListener('click', () => {
  location.reload();
});

// Gérer le clic sur "Proposer une Nulle"
drawButton.addEventListener('click', () => {
  if (gameState === 'playing') {
    showMessage(
      "Proposition de nullité faite. Attente de la réponse de l'adversaire.",
    );
    gameState = 'drawProposed';
    updateTurn(); // Change de tour pour que l'adversaire décide
  }
});

// Gérer le clic sur "Accepter la Nulle"
acceptDrawButton.addEventListener('click', () => {
  if (gameState === 'drawProposed') {
    showMessage('Partie Nulle par Accord Mutuel !');
    gameState = 'waiting'; // Change l'état du jeu à "waiting"
    endGame();
  }
});

// Gérer le clic sur "Annuler le dernier coup"
undoButton.addEventListener('click', () => {
  if (gameState === 'playing' && moveHistory.length > 0) {
    const currentTurnMoves = moveHistory[moveHistory.length - 1];

    // Annule uniquement si c'est encore le tour actuel
    if (currentTurnMoves.length > 0) {
      const lastMove = currentTurnMoves.pop();
      if (lastMove) {
        board.movePiece(
          lastMove.toX,
          lastMove.toY,
          lastMove.fromX,
          lastMove.fromY,
        );
        showMessage('Dernier coup annulé !');
        renderer.drawBoard();
      }
    }

    // Si le tour n'a plus de mouvements, supprime le tour vide
    if (currentTurnMoves.length === 0 && moveHistory.length > 1) {
      moveHistory.pop();
    }
  }
});
