import { showMessage, updateCapturedPieces } from '../src/utils';
import { PieceColor, PieceType } from '../src/piece';

describe('showMessage', () => {
  let gameMessageElement: HTMLElement;

  beforeAll(() => {
    // Ajoute un élément DOM pour les tests
    gameMessageElement = document.createElement('div');
    gameMessageElement.id = 'gameMessage';
    document.body.appendChild(gameMessageElement);
  });

  afterAll(() => {
    // Nettoie le DOM après les tests
    document.body.removeChild(gameMessageElement);
  });

  test('should display the provided message', () => {
    showMessage('Test Message');
    expect(gameMessageElement.textContent).toBe('Test Message');
    expect(gameMessageElement.style.display).toBe('block');
  });

  test('should handle empty message', () => {
    showMessage('');
    expect(gameMessageElement.textContent).toBe('');
    expect(gameMessageElement.style.display).toBe('block');
  });
});

describe('updateCapturedPieces', () => {
  let capturedWhiteElement: HTMLElement;
  let capturedBlackElement: HTMLElement;

  beforeAll(() => {
    // Ajoute des éléments DOM pour les pièces capturées
    capturedWhiteElement = document.createElement('div');
    capturedWhiteElement.id = 'capturedWhite';
    document.body.appendChild(capturedWhiteElement);

    capturedBlackElement = document.createElement('div');
    capturedBlackElement.id = 'capturedBlack';
    document.body.appendChild(capturedBlackElement);
  });

  afterAll(() => {
    // Nettoie le DOM après les tests
    document.body.removeChild(capturedWhiteElement);
    document.body.removeChild(capturedBlackElement);
  });

  test('should update captured white pieces', () => {
    updateCapturedPieces(PieceType.PAWN, PieceColor.BLACK);
    expect(capturedBlackElement.textContent).toBe('♟');
  });

  test('should update captured black pieces', () => {
    updateCapturedPieces(PieceType.ROOK, PieceColor.WHITE);
    expect(capturedWhiteElement.textContent).toBe('♖');
  });
});
