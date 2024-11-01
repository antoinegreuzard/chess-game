// tests/endgameTablebase.test.ts
import { Board } from '../src/board';
import { PieceColor, PieceType } from '../src/piece';
import { getEndgameMove } from '../src/ai/endgameTablebase';
import { createPiece } from '../src/utils/pieceFactory';

// Fonction d'aide pour placer une pièce à une position donnée
async function placePiece(board: Board, type: PieceType, color: PieceColor, x: number, y: number): Promise<void> {
  const piece = await createPiece(type, color);
  board.setPiece(x, y, piece);
}

describe('Endgame Move Generation Tests', () => {
  let board: Board;

  beforeEach(async () => {
    board = new Board();
    await board.init(); // Initialise un échiquier vide pour chaque test
    board['grid'] = Array(8).fill(null).map(() => Array(8).fill(null));
  });

  test('King + Rook vs King endgame move', async () => {
    await placePiece(board, PieceType.KING, PieceColor.WHITE, 0, 0);
    await placePiece(board, PieceType.ROOK, PieceColor.WHITE, 1, 0);
    await placePiece(board, PieceType.KING, PieceColor.BLACK, 7, 7);

    const move = getEndgameMove(board, PieceColor.WHITE);
    expect(move).not.toBeNull();
    expect(move?.fromX).toBe(1);
    expect(move?.fromY).toBe(0);
  });

  test('King + Bishop + Knight vs King endgame move', async () => {
    await placePiece(board, PieceType.KING, PieceColor.WHITE, 0, 0);
    await placePiece(board, PieceType.BISHOP, PieceColor.WHITE, 2, 2);
    await placePiece(board, PieceType.KNIGHT, PieceColor.WHITE, 3, 3);
    await placePiece(board, PieceType.KING, PieceColor.BLACK, 7, 7);

    const move = getEndgameMove(board, PieceColor.WHITE);
    expect(move).not.toBeNull();
    expect(move?.fromX).toBe(2); // Cavalier se déplace pour pousser le roi adverse
  });

  test('King + Two Bishops vs King endgame move', async () => {
    await placePiece(board, PieceType.KING, PieceColor.WHITE, 0, 0);
    await placePiece(board, PieceType.BISHOP, PieceColor.WHITE, 2, 2);
    await placePiece(board, PieceType.BISHOP, PieceColor.WHITE, 3, 3);
    await placePiece(board, PieceType.KING, PieceColor.BLACK, 7, 7);

    const move = getEndgameMove(board, PieceColor.WHITE);
    expect(move).not.toBeNull();
    expect(move?.fromX).toBe(2); // Fou se déplace pour forcer le roi adverse vers un coin
  });

  test('King + Pawn vs King endgame move', async () => {
    await placePiece(board, PieceType.KING, PieceColor.WHITE, 4, 4);
    await placePiece(board, PieceType.PAWN, PieceColor.WHITE, 5, 5);
    await placePiece(board, PieceType.KING, PieceColor.BLACK, 7, 7);

    const move = getEndgameMove(board, PieceColor.WHITE);
    expect(move).not.toBeNull();
    expect(move?.fromX).toBe(5);
    expect(move?.fromY).toBe(5);
    expect(move?.toY).toBe(6); // Pion avance pour promotion
  });
});
