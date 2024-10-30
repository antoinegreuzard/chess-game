// ai.worker.test.ts
import { Board } from '../src/board';
import { PieceColor } from '../src/types';
import { Rook } from '../src/pieces/rook';
import { WorkerMock } from './mocks/WorkerMock';

// Remplace le Worker global par WorkerMock pour les tests
global.Worker = WorkerMock as any;

describe('ai.worker', () => {
  let aiWorker: Worker;
  let board: Board;

  // Fonction pour vider le plateau
  function clearBoard() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        board.setPiece(x, y, null);
      }
    }
  }

  beforeEach(async () => {
    // Initialise un nouvel AI pour chaque test
    aiWorker = new Worker('./ai.worker.ts');
    board = new Board();
    await board.initializeBoard();
    clearBoard();
  });

  afterEach(() => {
    // Termine le worker après chaque test pour libérer les ressources
    aiWorker.terminate();
  });

  function postMessageToWorker(boardData: any): Promise<any> {
    return new Promise((resolve) => {
      aiWorker.onmessage = (event) => resolve(event.data);
      aiWorker.postMessage({ boardData });
    });
  }

  it('should calculate the best move without any captures', async () => {
    board.setPiece(0, 1, new Rook(PieceColor.BLACK));

    const boardData = board.toData();
    const result = await postMessageToWorker(boardData);

    expect(result.bestMove).toBeDefined();
    expect(result.captureData).toBeNull();
  });

  it('should handle cases with no available moves gracefully', async () => {
    const boardData = board.toData();
    const result = await postMessageToWorker(boardData);

    expect(result.bestMove).toBeNull();
    expect(result.captureData).toBeNull();
  });
});
