// utils.test.ts
import { PieceColor, PieceType } from '../src/piece';
import {
  showMessage,
  updateCapturedPieces,
  capturedWhite,
  capturedBlack,
  updateCapturedPiecesDOM,
} from '../src/utils/utils';

describe('utils', () => {
  beforeEach(() => {
    // Réinitialiser les pièces capturées
    capturedWhite.length = 0;
    capturedBlack.length = 0;

    // Mock de l'élément DOM pour les messages de jeu et les captures
    document.body.innerHTML = `
      <div id="gameMessage"></div>
      <div id="capturedWhite"></div>
      <div id="capturedBlack"></div>
    `;
  });

  it('should display a message in the game message element', () => {
    const message = 'Test message';
    showMessage(message);

    const gameMessageElement = document.getElementById('gameMessage')!;
    expect(gameMessageElement.textContent).toBe(message);
    expect(gameMessageElement.style.display).toBe('block');
  });

  it('should update captured pieces for white and black', () => {
    updateCapturedPieces(PieceType.PAWN, PieceColor.WHITE);
    updateCapturedPieces(PieceType.QUEEN, PieceColor.BLACK);

    expect(capturedWhite).toEqual(['♙']);
    expect(capturedBlack).toEqual(['♛']);
  });

  it('should update the captured pieces in the DOM', () => {
    updateCapturedPieces(PieceType.KNIGHT, PieceColor.WHITE);
    updateCapturedPieces(PieceType.ROOK, PieceColor.BLACK);
    updateCapturedPiecesDOM();

    const capturedWhiteElement = document.getElementById('capturedWhite')!;
    const capturedBlackElement = document.getElementById('capturedBlack')!;

    expect(capturedWhiteElement.textContent).toBe('♘');
    expect(capturedBlackElement.textContent).toBe('♜');
  });

  it('should handle multiple captured pieces correctly', () => {
    updateCapturedPieces(PieceType.BISHOP, PieceColor.WHITE);
    updateCapturedPieces(PieceType.ROOK, PieceColor.BLACK);
    updateCapturedPieces(PieceType.PAWN, PieceColor.WHITE);
    updateCapturedPieces(PieceType.KNIGHT, PieceColor.BLACK);
    updateCapturedPiecesDOM();

    const capturedWhiteElement = document.getElementById('capturedWhite')!;
    const capturedBlackElement = document.getElementById('capturedBlack')!;

    expect(capturedWhiteElement.textContent).toBe('♗ ♙');
    expect(capturedBlackElement.textContent).toBe('♜ ♞');
  });

  it('should not display captured pieces if none are captured', () => {
    updateCapturedPiecesDOM();

    const capturedWhiteElement = document.getElementById('capturedWhite')!;
    const capturedBlackElement = document.getElementById('capturedBlack')!;

    expect(capturedWhiteElement.textContent).toBe('');
    expect(capturedBlackElement.textContent).toBe('');
  });

  it('should clear captured pieces when reset', () => {
    updateCapturedPieces(PieceType.QUEEN, PieceColor.WHITE);
    updateCapturedPieces(PieceType.ROOK, PieceColor.BLACK);

    // Réinitialiser
    capturedWhite.length = 0;
    capturedBlack.length = 0;
    updateCapturedPiecesDOM();

    const capturedWhiteElement = document.getElementById('capturedWhite')!;
    const capturedBlackElement = document.getElementById('capturedBlack')!;

    expect(capturedWhiteElement.textContent).toBe('');
    expect(capturedBlackElement.textContent).toBe('');
  });

  it('should only show the game message element when there is a message', () => {
    const gameMessageElement = document.getElementById('gameMessage')!;

    showMessage('New game started');
    expect(gameMessageElement.style.display).toBe('block');
  });
});
