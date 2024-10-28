// tests/utils.test.ts

import {
  showMessage,
  updateCapturedPieces,
  capturedWhite,
  capturedBlack,
} from '../src/utils';
import { PieceColor, PieceType } from '../src/piece';

describe('showMessage', () => {
  let gameMessageElement: HTMLElement;

  beforeAll(() => {
    gameMessageElement = document.createElement('div');
    gameMessageElement.id = 'gameMessage';
    document.body.appendChild(gameMessageElement);
  });

  afterAll(() => {
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
    capturedWhiteElement = document.createElement('div');
    capturedWhiteElement.id = 'capturedWhite';
    document.body.appendChild(capturedWhiteElement);

    capturedBlackElement = document.createElement('div');
    capturedBlackElement.id = 'capturedBlack';
    document.body.appendChild(capturedBlackElement);
  });

  afterAll(() => {
    document.body.removeChild(capturedWhiteElement);
    document.body.removeChild(capturedBlackElement);
  });

  beforeEach(() => {
    // Réinitialise les captures pour chaque test
    capturedWhite.length = 0;
    capturedBlack.length = 0;
    capturedWhiteElement.textContent = '';
    capturedBlackElement.textContent = '';
  });

  test('should update captured white pieces cumulatively', () => {
    updateCapturedPieces(PieceType.ROOK, PieceColor.WHITE);
    expect(capturedWhiteElement.textContent).toBe('♖');

    updateCapturedPieces(PieceType.PAWN, PieceColor.WHITE);
    expect(capturedWhiteElement.textContent).toBe('♖ ♙');
  });

  test('should update captured black pieces cumulatively', () => {
    updateCapturedPieces(PieceType.KNIGHT, PieceColor.BLACK);
    expect(capturedBlackElement.textContent).toBe('♞');

    updateCapturedPieces(PieceType.BISHOP, PieceColor.BLACK);
    expect(capturedBlackElement.textContent).toBe('♞ ♝');
  });

  test('should handle multiple captures of the same type', () => {
    updateCapturedPieces(PieceType.PAWN, PieceColor.WHITE);
    updateCapturedPieces(PieceType.PAWN, PieceColor.WHITE);
    expect(capturedWhiteElement.textContent).toBe('♙ ♙');

    updateCapturedPieces(PieceType.PAWN, PieceColor.BLACK);
    updateCapturedPieces(PieceType.PAWN, PieceColor.BLACK);
    expect(capturedBlackElement.textContent).toBe('♟ ♟');
  });
});
