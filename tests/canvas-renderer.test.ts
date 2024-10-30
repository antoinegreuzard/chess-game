// canvas-renderer.test.ts
import { CanvasRenderer } from '../src/canvas-renderer';
import { Board } from '../src/board';
import { PieceColor } from '../src/piece';
import { Rook } from '../src/pieces/rook';

describe('CanvasRenderer', () => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let board: Board;
  let renderer: CanvasRenderer;
  const mockMoveHandler = jest.fn();

  beforeEach(async () => {
    document.body.innerHTML = '<canvas id="chessCanvas" width="400" height="400"></canvas>';
    canvas = document.getElementById('chessCanvas') as HTMLCanvasElement;
    context = canvas.getContext('2d') as CanvasRenderingContext2D;

    jest.spyOn(context, 'fillRect').mockImplementation(() => {
    });
    jest.spyOn(context, 'fillText').mockImplementation(() => {
    });
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 10));

    board = new Board();
    await board.init();
    renderer = new CanvasRenderer(board, 'chessCanvas', mockMoveHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should call moveHandler on mouse up and reset dragging state', () => {
    const rook = new Rook(PieceColor.WHITE);
    board.setPiece(0, 0, rook);
    mockMoveHandler.mockReturnValue(true);

    const mouseDownEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
    const mouseUpEvent = new MouseEvent('mouseup', { clientX: 10, clientY: 110 });

    canvas.dispatchEvent(mouseDownEvent);
    expect(renderer['draggingPiece']).toBe(rook);

    canvas.dispatchEvent(mouseUpEvent);
    expect(mockMoveHandler).toHaveBeenCalledWith(0, 0, 0, 2);
    expect(renderer['draggingPiece']).toBeNull();
  });

  it('should update cursor when moving over a piece', () => {
    const rook = new Rook(PieceColor.WHITE);
    board.setPiece(0, 0, rook);

    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 10, clientY: 10 });
    canvas.dispatchEvent(mouseMoveEvent);
    expect(canvas.style.cursor).toBe('pointer');

    const emptyMoveEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
    canvas.dispatchEvent(emptyMoveEvent);
    expect(canvas.style.cursor).toBe('default');
  });
});
