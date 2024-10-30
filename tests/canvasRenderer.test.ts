// tests/canvasRenderer.test.ts
import { Board } from '../src/board';
import { CanvasRenderer } from '../src/canvas-renderer';
import { PieceColor, PieceType } from '../src/piece';
import { createPiece } from '../src/utils/pieceFactory';

jest.mock('../src/utils/pieceFactory', () => ({
  createPiece: jest.fn((type, color) => ({
    type,
    color,
    isValidMove: jest.fn(() => true), // Ajoute la méthode isValidMove simulée
  })),
}));

describe('CanvasRenderer Tests', () => {
  let canvas: HTMLCanvasElement;
  let renderer: CanvasRenderer;
  let board: Board;

  beforeEach(async () => {
    document.body.innerHTML = '<canvas id="testCanvas" width="400" height="400"></canvas>';
    canvas = document.getElementById('testCanvas') as HTMLCanvasElement;
    board = new Board();
    await board.init(); // Initialise correctement board.grid avec une structure 8x8
    renderer = new CanvasRenderer(board, 'testCanvas', jest.fn());

    jest.spyOn(renderer, 'drawBoard');
    jest.spyOn(renderer, 'highlightValidMoves');
  });

  test('Initializes with correct canvas settings', () => {
    expect(canvas).not.toBeNull();
    expect(renderer['tileSize']).toBe(50); // Assuming a tile size of 50 for 400x400 canvas
  });

  test('Highlights valid moves on piece selection', async () => {
    const mockPiece = await createPiece(PieceType.PAWN, PieceColor.WHITE);
    board.setPiece(4, 4, mockPiece);

    // Simule un clic pour sélectionner une pièce et vérifier les mouvements valides
    const clickEvent = new MouseEvent('mousedown', { clientX: 225, clientY: 225 });
    canvas.dispatchEvent(clickEvent);

    expect(renderer.highlightValidMoves).toHaveBeenCalled();
    expect(renderer['highlightedMoves'].length).toBeGreaterThan(0);
  });

  test('Moves piece on drag and drop', async () => {
    const mockPiece = await createPiece(PieceType.PAWN, PieceColor.WHITE);
    board.setPiece(4, 4, mockPiece);

    // Simule le clic initial sur la pièce
    const mouseDownEvent = new MouseEvent('mousedown', { clientX: 225, clientY: 225 });
    canvas.dispatchEvent(mouseDownEvent);

    // Simule le déplacement de la pièce
    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 275, clientY: 275 });
    canvas.dispatchEvent(mouseMoveEvent);

    // Simule le relâchement de la souris pour lâcher la pièce
    const mouseUpEvent = new MouseEvent('mouseup', { clientX: 275, clientY: 275 });
    canvas.dispatchEvent(mouseUpEvent);

    expect(renderer.drawBoard).toHaveBeenCalledTimes(3); // Initial, drag, drop
    expect(renderer['highlightedMoves']).toEqual([]);
  });

  test('Displays king in check with red highlight', async () => {
    const whiteKing = await createPiece(PieceType.KING, PieceColor.WHITE);
    const blackRook = await createPiece(PieceType.ROOK, PieceColor.BLACK);
    board.setPiece(4, 0, blackRook); // Roi blanc en échec
    board.setPiece(4, 7, whiteKing);

    renderer.drawBoard();

    // Vérifie que drawTiles a été appelé pour mettre en évidence l'échec du roi
    const kingPosition = renderer['getCoordinates'](4, 7);
    expect(renderer['kingInCheckPosition']).toEqual(kingPosition);
  });
});
