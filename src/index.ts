// src/index.ts
import { Game } from './game';
import { CanvasRenderer } from './canvas-renderer';
import { Timer } from './timer';
import { BoardInterface, PieceColor, PieceType } from './piece';
import {
  getPieceSymbol,
  showMessage,
  updateCapturedPieces,
} from './utils/utils';

// Fonction asynchrone pour initialiser le jeu
export async function initializeGame(playerColor: PieceColor) {
  let moveHistory: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    pieceType: PieceType;
  }[][] = [[]];
  const game = new Game(playerColor);
  const board = await game.getBoard();

  board.flipBoard = playerColor === PieceColor.BLACK;

  const whiteMovesElement = document.getElementById(
    'whiteMoves',
  ) as HTMLUListElement;
  const blackMovesElement = document.getElementById(
    'blackMoves',
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

  board.flipBoard = playerColor === PieceColor.BLACK;

  const renderer = new CanvasRenderer(
    board,
    'chessBoard',
    async (fromX, fromY, toX, toY) => await handleMove(fromX, fromY, toX, toY),
    playerColor
  );
  renderer.drawBoard();

  // Ajuste le début de la partie selon la couleur sélectionnée par le joueur
  if (playerColor === PieceColor.WHITE) {
    whiteTimer.start();
  } else {
    blackTimer.start();
    await triggerAIMove(); // L'IA commence si le joueur choisit Noir
  }

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

  function showPromotionDialog(x: number, y: number, board: BoardInterface) {
    const promotionDialog = document.getElementById('promotionDialog');
    if (promotionDialog) {
      promotionDialog.style.display = 'block';

      // Définir le callback de promotion pour gérer la sélection de pièce
      window.promote = (pieceType: string) => {
        board.promotePawn(x, y, pieceType); // Promouvoir le pion
        promotionDialog.style.display = 'none'; // Masquer la boîte de dialogue

        // Met à jour l'affichage de l'historique et du plateau après la promotion
        addMoveToHistory(
          x,
          y,
          x,
          y,
          PieceType[pieceType.toUpperCase() as keyof typeof PieceType],
        );
        renderer.drawBoard();
        updateTurn();
      };
    }
  }

  async function updateTurn() {
    clearMessage();
    currentPlayer =
      currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    currentTurnElement.textContent = `Tour actuel: ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`;
    hasMoved = false;

    passTurnButton.disabled = currentPlayer !== playerColor;

    if (currentPlayer === PieceColor.WHITE) {
      if (blackTimer.isRunning) blackTimer.stop();
      whiteTimer.reset(60);
    } else {
      if (whiteTimer.isRunning) whiteTimer.stop();
      blackTimer.reset(60);
    }

    // Vérification de l'état de la partie avant de passer le tour
    if (board.isKingInCheck(currentPlayer)) {
      if (board.isCheckmate(currentPlayer)) {
        endGame(
          `${currentPlayer === PieceColor.WHITE ? 'Noir' : 'Blanc'} gagne par échec et mat !`,
        );
        return;
      }
    } else if (board.isStalemate(currentPlayer)) {
      endGame('Pat ! La partie est nulle.');
      return;
    } else if (board.isInsufficientMaterial()) {
      endGame('Matériel insuffisant pour continuer, partie nulle !');
      return;
    } else if (board.isFiftyMoveRule()) {
      endGame('Règle des 50 coups, partie nulle !');
      return;
    }

    moveHistory.push([]);

    if (currentPlayer !== playerColor) {
      await triggerAIMove();
    }
  }

  async function triggerAIMove() {
    isAITurn = true;
    await game.makeAIMove();

    // Obtenez le dernier mouvement effectué par l'IA à partir du plateau
    const lastMove = game.getLastAIMove(); // Assurez-vous d'avoir une méthode pour récupérer ce mouvement

    if (lastMove) {
      // Ajoute le mouvement de l'IA dans l'historique
      addMoveToHistory(
        lastMove.fromX,
        lastMove.fromY,
        lastMove.toX,
        lastMove.toY,
        board.getPiece(lastMove.toX, lastMove.toY)?.type || PieceType.PAWN,
      );
    }

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
    const letters = 'abcdefgh';
    const moveText = `${getPieceSymbol(pieceType, currentPlayer)} de (${letters[fromX]}${8 - fromY}) à (${letters[toX]}${8 - toY})`;
    const listItem = document.createElement('li');
    listItem.textContent = moveText;

    // Ajoute le mouvement dans la liste appropriée selon la couleur
    if (currentPlayer === PieceColor.WHITE && whiteMovesElement) {
      whiteMovesElement.appendChild(listItem);
    } else if (currentPlayer === PieceColor.BLACK && blackMovesElement) {
      blackMovesElement.appendChild(listItem);
    }

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
    const realFromX = board.flipBoard ? 7 - fromX : fromX;
    const realFromY = board.flipBoard ? 7 - fromY : fromY;
    const realToX = board.flipBoard ? 7 - toX : toX;
    const realToY = board.flipBoard ? 7 - toY : toY;

    if (gameState === 'waiting' || hasMoved || isGameEnded) {
      showMessage('Veuillez attendre le prochain tour !');
      return false;
    }

    const piece = board.getPiece(realFromX, realFromY);

    if (!piece) {
      return false;
    }

    if (piece.color !== playerColor) {
      return false; // tu n'as pas cliqué sur une de tes pièces
    }

    if (currentPlayer !== playerColor) {
      if (!isAITurn) {
        showMessage(
          `C'est le tour de ${currentPlayer === PieceColor.WHITE ? 'Blanc' : 'Noir'}`,
        );
      }
      return false;
    }    

    const isValid = piece.isValidMove(realFromX, realFromY, realToX, realToY, board);
    if (!isValid) {
      showMessage('Mouvement invalide !');
      return false;
    }

    const moved = board.movePiece(realFromX, realFromY, realToX, realToY, false);
    if (!moved) {
      showMessage('Mouvement impossible !');
      return false;
    }

    hasMoved = true;
    piece.hasMoved = true;

    const targetPiece = board.getPiece(realToX, realToY);
    if (targetPiece && targetPiece !== piece) {
      updateCapturedPieces(targetPiece.type, targetPiece.color);
    }

    if (piece.type === PieceType.PAWN && (realToY === 0 || realToY === 7)) {
      showPromotionDialog(realToX, realToY, board);
      await updateTurn();
    } else {
      addMoveToHistory(realFromX, realFromY, realToX, realToY, piece.type);
      renderer.animateMove(realFromX, realFromY, realToX, realToY, piece);
      await updateTurn();
    }

    return true;
  }

  if (passTurnButton) {
    passTurnButton.addEventListener('click', async (event) => {
      event.preventDefault();
      if (
        gameState === 'playing' &&
        currentPlayer === playerColor &&
        !board.isKingInCheck(playerColor)
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

// Export pour permettre à index.html d'appeler initializeGame avec la couleur choisie
(window as any).startGame = (playerColor: PieceColor) =>
  initializeGame(playerColor);
