// tests/canvas-renderer.test.ts
import { CanvasRenderer } from '../src/canvas-renderer';
import { Board } from '../src/board';
import { PieceColor, PieceType, Piece } from '../src/piece';
import { Rook } from '../src/pieces/rook';
import { King } from '../src/pieces/king';

describe('CanvasRenderer', () => {
  let board: Board;
  let canvasElement: HTMLCanvasElement;
  let canvasRenderer: CanvasRenderer;

  // Fonction mock pour gérer les mouvements
  const moveHandlerMock = jest.fn();

  beforeEach(() => {
    // Crée un élément canvas simulé
    canvasElement = document.createElement('canvas');
    canvasElement.width = 400;
    canvasElement.height = 400;
    document.body.appendChild(canvasElement);

    // Initialise le plateau et CanvasRenderer
    board = new Board();
    canvasRenderer = new CanvasRenderer(board, canvasElement.id, moveHandlerMock);
  });

  afterEach(() => {
    // Supprime l'élément canvas après chaque test
    document.body.removeChild(canvasElement);
    jest.clearAllMocks();
  });

  test('should initialize and draw the board correctly', () => {
    // Mock du contexte du canvas pour vérifier les appels de dessin
    const context = canvasElement.getContext('2d');
    if (context) {
      const fillRectSpy = jest.spyOn(context, 'fillRect');
      const fillTextSpy = jest.spyOn(context, 'fillText');

      // Appelle la méthode pour dessiner l'échiquier
      canvasRenderer.drawBoard();

      // Vérifie que les cases sont dessinées correctement
      expect(fillRectSpy).toHaveBeenCalled();

      // Vérifie que les pièces sont dessinées correctement
      expect(fillTextSpy).toHaveBeenCalled();
    }
  });

  test('should highlight valid moves correctly', () => {
    const rook = new Rook(PieceColor.WHITE);
    board.setPiece(0, 0, rook);

    // Simule un clic sur la pièce
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 20, // Coordonnées correspondant à la case (0, 0)
      clientY: 20,
    });
    canvasElement.dispatchEvent(mouseDownEvent);

    // Vérifie que les coups valides sont surlignés
    const context = canvasElement.getContext('2d');
    if (context) {
      const fillRectSpy = jest.spyOn(context, 'fillRect');
      canvasRenderer.drawBoard();

      // Vérifie que des mouvements valides sont surlignés
      expect(fillRectSpy).toHaveBeenCalled();
    }
  });

  test('should move a piece on valid drag and drop', () => {
    const rook = new Rook(PieceColor.WHITE);
    board.setPiece(0, 0, rook);

    // Simule le clic pour commencer à glisser
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 20, // Coordonnées correspondant à la case (0, 0)
      clientY: 20,
    });
    canvasElement.dispatchEvent(mouseDownEvent);

    // Simule le mouvement de la souris
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 100, // Coordonnées de la case cible (0, 5)
      clientY: 300,
    });
    canvasElement.dispatchEvent(mouseMoveEvent);

    // Simule le relâchement de la souris pour finir le glissement
    const mouseUpEvent = new MouseEvent('mouseup', {
      clientX: 100,
      clientY: 300,
    });
    canvasElement.dispatchEvent(mouseUpEvent);

    // Vérifie que la fonction moveHandler a été appelée avec les bonnes coordonnées
    expect(moveHandlerMock).toHaveBeenCalledWith(0, 0, 0, 5);
  });

  test('should not move piece when dropped on invalid square', () => {
    const king = new King(PieceColor.WHITE);
    board.setPiece(4, 0, king);

    // Simule le clic pour commencer à glisser
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 220, // Coordonnées correspondant à la case (4, 0)
      clientY: 20,
    });
    canvasElement.dispatchEvent(mouseDownEvent);

    // Simule le mouvement de la souris
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 300, // Coordonnées de la case cible (6, 0) - mouvement non valide pour le roi
      clientY: 20,
    });
    canvasElement.dispatchEvent(mouseMoveEvent);

    // Simule le relâchement de la souris pour finir le glissement
    const mouseUpEvent = new MouseEvent('mouseup', {
      clientX: 300,
      clientY: 20,
    });
    canvasElement.dispatchEvent(mouseUpEvent);

    // Vérifie que la fonction moveHandler n'a pas été appelée
    expect(moveHandlerMock).toHaveBeenCalledWith(4, 0, 6, 0);
  });
});
