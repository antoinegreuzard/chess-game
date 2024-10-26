// src/index.ts
import { Game } from './game';
import { CanvasRenderer } from './canvas-renderer';
import { Timer } from './timer';
import { PieceColor, PieceType } from './piece';

const game = new Game();
const board = game.getBoard();
const moveHistoryElement = document.getElementById('moveHistory')!;
const currentTurnElement = document.getElementById('currentTurn')!;
const timerElement = document.getElementById('timer')!;
const capturedWhiteElement = document.getElementById('capturedWhite')!;
const capturedBlackElement = document.getElementById('capturedBlack')!;
const passTurnButton = document.getElementById('passTurnButton')!;
const gameMessageElement = document.getElementById('gameMessage')!;
const replayButton = document.getElementById('replayButton')!;

let currentPlayer: PieceColor = PieceColor.WHITE; // Les blancs commencent toujours
let gameState: 'playing' | 'waiting' = 'playing'; // Contrôle du statut de jeu
let hasMoved: boolean = false; // Indique si un mouvement a déjà été effectué dans ce tour
let capturedWhite: string[] = []; // Liste des pièces capturées par les Blancs
let capturedBlack: string[] = []; // Liste des pièces capturées par les Noirs

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
    if (timeLeft <= 0) {
      showMessage(
        `${currentPlayer === PieceColor.WHITE ? 'Noir' : 'Blanc'} gagne par temps écoulé !`,
      );
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
  showMessage('La partie est terminée !');

  // Afficher le bouton "Rejouer"
  replayButton.style.display = 'block';
}

// Fonction pour afficher un message dans l'élément gameMessage
function showMessage(message: string) {
  gameMessageElement.textContent = message;
  gameMessageElement.style.display = 'block'; // Afficher le message
}

// Fonction pour effacer le message d'erreur
function clearMessage() {
  gameMessageElement.textContent = '';
  gameMessageElement.style.display = 'none'; // Masquer le message
}

// Fonction pour mettre à jour le tour et l'affichage
function updateTurn() {
  clearMessage(); // Efface le message d'erreur au début de chaque tour
  currentPlayer =
    currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
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
}

// Fonction pour mettre à jour l'affichage des pièces capturées
function updateCapturedPieces(piece: PieceType, color: PieceColor) {
  const pieceSymbol = getPieceSymbol(piece, color);
  if (color === PieceColor.WHITE) {
    capturedWhite.push(pieceSymbol);
    capturedWhiteElement.textContent = capturedWhite.join(' ');
  } else {
    capturedBlack.push(pieceSymbol);
    capturedBlackElement.textContent = capturedBlack.join(' ');
  }
}

// Fonction pour obtenir le symbole de la pièce capturée
function getPieceSymbol(piece: PieceType, color: PieceColor): string {
  switch (piece) {
    case 'pawn':
      return color === PieceColor.WHITE ? '♙' : '♟';
    case 'rook':
      return color === PieceColor.WHITE ? '♖' : '♜';
    case 'knight':
      return color === PieceColor.WHITE ? '♘' : '♞';
    case 'bishop':
      return color === PieceColor.WHITE ? '♗' : '♝';
    case 'queen':
      return color === PieceColor.WHITE ? '♕' : '♛';
    case 'king':
      return color === PieceColor.WHITE ? '♔' : '♚';
    default:
      return '';
  }
}

// Fonction pour gérer un mouvement sur le plateau
export function handleMove(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): void {
  if (gameState === 'waiting' || hasMoved) {
    showMessage('Veuillez attendre le prochain tour !');
    return;
  }

  const piece = board.getPiece(fromX, fromY);
  const targetPiece = board.getPiece(toX, toY);

  // Vérifie que c'est bien le tour du joueur qui joue
  if (!piece || piece.color !== currentPlayer) {
    showMessage(
      `Ce n'est pas le tour de ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
    );
    return;
  }

  // Vérifie si le mouvement est valide pour la pièce et respecte les règles des échecs
  if (piece.isValidMove(fromX, fromY, toX, toY, board)) {
    // Effectue le mouvement uniquement si valide
    if (board.movePiece(fromX, fromY, toX, toY)) {
      // Marquer que le joueur a effectué son coup
      hasMoved = true;

      // Si une pièce est capturée, l'ajouter aux pièces capturées
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
      gameState = 'waiting'; // Bloque les mouvements jusqu'à ce que le tour change
      updateTurn();
    } else {
      showMessage('Mouvement invalide !');
    }
  } else {
    showMessage('Mouvement invalide !');
  }
}

// Gérer le clic sur "Passer son tour"
passTurnButton.addEventListener('click', (event) => {
  event.preventDefault(); // Empêche tout comportement par défaut
  if (gameState === 'playing') {
    showMessage(
      `Tour passé pour ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
    );
    updateTurn();
  }
});

// Gérer le clic sur "Rejouer"
replayButton.addEventListener('click', () => {
  location.reload(); // Recharge la page pour redémarrer la partie
});
