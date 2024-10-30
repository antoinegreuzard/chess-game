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

// Fonction asynchrone pour initialiser le jeu
async function initializeGame() {
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
  ) as HTMLDivElement;

  let currentPlayer: PieceColor = PieceColor.WHITE;
  let gameState: 'playing' | 'waiting' = 'playing';
  let hasMoved = false;
  let moveHistory: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    pieceType: PieceType;
  }[][] = [[]];
  let isGameEnded = false;
  let isAITurn = false;

  let whiteTimer = new Timer(60, (timeLeft) =>
    updateTimerDisplay(timeLeft, PieceColor.WHITE),
  );
  let blackTimer = new Timer(60, (timeLeft) =>
    updateTimerDisplay(timeLeft, PieceColor.BLACK),
  );

  function updateTimerDisplay(timeLeft: number, color: PieceColor) {
    if (color === currentPlayer) {
      timerElement.textContent = `Temps restant: ${timeLeft}s`;
      if (timeLeft <= 0 && !isGameEnded) {
        endGame(
          `${currentPlayer === PieceColor.WHITE ? 'Noir' : 'Blanc'} gagne par temps écoulé !`,
        );
      }
    }
  }

  const renderer = new CanvasRenderer(
    board,
    'chessBoard',
    (fromX, fromY, toX, toY) => {
      // Appeler `handleMove` sans attendre, pour gérer l'asynchronisme
      handleMove(fromX, fromY, toX, toY).then((result) => {
        // Si nécessaire, utilisez `result` pour déclencher d'autres actions après coup
        if (!result) {
          showMessage('Mouvement non autorisé.');
        }
      });

      // Retourne une valeur par défaut immédiatement pour satisfaire `CanvasRenderer`
      return true;
    },
  );
  renderer.drawBoard();
  whiteTimer.start();

  function endGame(message: string) {
    showMessage(message);
    isGameEnded = true;
    replayButton.style.display = 'block';
    if (whiteTimer.isRunning) whiteTimer.stop();
    if (blackTimer.isRunning) blackTimer.stop();
  }

  function clearMessage() {
    gameMessageElement.textContent = '';
    gameMessageElement.style.display = 'none';
  }

  async function updateTurn() {
    clearMessage();
    currentPlayer =
      currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    currentTurnElement.textContent = `Tour actuel: ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`;
    hasMoved = false;

    passTurnButton.disabled = currentPlayer === PieceColor.BLACK;

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

    if (board.isStalemate(currentPlayer)) {
      endGame('Pat ! La partie est nulle.');
    }

    if (board.isInsufficientMaterial()) {
      endGame('Matériel insuffisant pour continuer, partie nulle !');
    }

    if (board.isFiftyMoveRule()) {
      endGame('Règle des 50 coups, partie nulle !');
    }

    if (gameState === 'playing') {
      gameState = 'playing';
    }

    moveHistory.push([]);

    if (currentPlayer === PieceColor.BLACK) {
      await triggerAIMove();
    }
  }

  async function triggerAIMove() {
    isAITurn = true;
    await game.makeAIMove();
    renderer.drawBoard();
    isAITurn = false;
    await updateTurn();
  }

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

    moveHistory[moveHistory.length - 1].push({
      fromX,
      fromY,
      toX,
      toY,
      pieceType,
    });
  }

  async function handleMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): Promise<boolean> {
    if (gameState === 'waiting' || hasMoved || isGameEnded) {
      showMessage('Veuillez attendre le prochain tour !');
      return false;
    }

    const piece = board.getPiece(fromX, fromY);
    const targetPiece = board.getPiece(toX, toY);

    if (!piece || piece.color !== currentPlayer) {
      if (!isAITurn) {
        showMessage(
          `C'est le tour de ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
        );
      }
      return false;
    }

    if (piece.isValidMove(fromX, fromY, toX, toY, board)) {
      if (board.movePiece(fromX, fromY, toX, toY)) {
        hasMoved = true;

        if (targetPiece) {
          updateCapturedPieces(targetPiece.type, targetPiece.color);
        }

        addMoveToHistory(fromX, fromY, toX, toY, piece.type);
        renderer.animateMove(fromX, fromY, toX, toY, piece);
        await updateTurn();
        return true;
      }
      showMessage('Mouvement invalide !');
    }
    return false;
  }

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

  if (replayButton) {
    replayButton.addEventListener('click', () => {
      location.reload();
    });
  }
}

// Appeler la fonction pour démarrer le jeu
initializeGame().then();
