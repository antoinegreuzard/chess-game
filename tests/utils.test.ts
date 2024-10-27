// tests/utils.test.ts
import { showMessage } from '../src/utils';

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
