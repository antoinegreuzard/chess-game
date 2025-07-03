import { Move } from './openingBook';

interface Endgame {
  moves: Move[];
}

export class EndgameTablebase {
  private static endgames: Record<string, Endgame> = {
    kqkEndgame: {
      moves: [
        { fromX: 7, fromY: 1, toX: 6, toY: 1 },
        { fromX: 6, fromY: 1, toX: 5, toY: 1 },
        { fromX: 5, fromY: 1, toX: 4, toY: 2 },
        { fromX: 4, fromY: 2, toX: 3, toY: 2 },
        { fromX: 3, fromY: 2, toX: 2, toY: 3 },
        { fromX: 2, fromY: 3, toX: 1, toY: 3 },
        { fromX: 1, fromY: 3, toX: 0, toY: 4 }, // Roi noir forcé dans le coin
      ],
    },
    krkEndgame: {
      moves: [
        { fromX: 7, fromY: 0, toX: 5, toY: 0 },
        { fromX: 5, fromY: 0, toX: 4, toY: 0 },
        { fromX: 4, fromY: 0, toX: 4, toY: 1 },
        { fromX: 4, fromY: 1, toX: 4, toY: 2 },
        { fromX: 4, fromY: 2, toX: 3, toY: 2 },
        { fromX: 3, fromY: 2, toX: 2, toY: 3 },
      ],
    },
    kpEndgame: {
      moves: [
        { fromX: 6, fromY: 5, toX: 6, toY: 6 },
        { fromX: 6, fromY: 6, toX: 6, toY: 7 },
        // Promotion
      ],
    },
    krkpEndgame: {
      moves: [
        { fromX: 6, fromY: 0, toX: 6, toY: 1 },
        { fromX: 6, fromY: 1, toX: 6, toY: 2 },
        { fromX: 6, fromY: 2, toX: 6, toY: 3 },
      ],
    },
    kqkrEndgame: {
      moves: [
        { fromX: 7, fromY: 2, toX: 6, toY: 2 },
        { fromX: 6, fromY: 2, toX: 5, toY: 2 },
        { fromX: 5, fromY: 2, toX: 4, toY: 3 },
        { fromX: 4, fromY: 3, toX: 3, toY: 4 },
      ],
    },
    kbkpEndgame: {
      moves: [
        { fromX: 3, fromY: 3, toX: 4, toY: 2 },
        { fromX: 4, fromY: 2, toX: 5, toY: 1 },
        { fromX: 5, fromY: 1, toX: 6, toY: 0 },
      ],
    },
    krrkEndgame: {
      moves: [
        { fromX: 7, fromY: 4, toX: 5, toY: 4 },
        { fromX: 5, fromY: 4, toX: 4, toY: 4 },
        { fromX: 4, fromY: 4, toX: 3, toY: 4 },
        { fromX: 3, fromY: 4, toX: 2, toY: 4 },
      ],
    },
    kbbkEndgame: {
      moves: [
        { fromX: 5, fromY: 3, toX: 3, toY: 1 },
        { fromX: 3, fromY: 1, toX: 2, toY: 0 },
        { fromX: 2, fromY: 0, toX: 1, toY: 1 },
        { fromX: 1, fromY: 1, toX: 0, toY: 0 },
      ],
    },
  };

  static getEndgameMoves(positionKey: string): Move[] | null {
    return this.endgames[positionKey]?.moves || null;
  }

  static isEndgame(positionKey: string): boolean {
    return !!this.endgames[positionKey];
  }

  static suggestNextMove(positionKey: string, moveIndex = 0): Move | null {
    const moves = this.getEndgameMoves(positionKey);
    return moves && moveIndex < moves.length ? moves[moveIndex] : null;
  }

  static validateEndgame(
    positionKey: string,
    piecesOnBoard: string[],
  ): boolean {
    switch (positionKey) {
      case 'kqkEndgame':
        return piecesOnBoard.sort().join('') === 'KkQ';
      case 'krkEndgame':
        return piecesOnBoard.sort().join('') === 'KkR';
      case 'kpEndgame':
        return piecesOnBoard.sort().join('') === 'KkP';
      case 'krkpEndgame':
        return piecesOnBoard.sort().join('') === 'KkPR';
      case 'kqkrEndgame':
        return piecesOnBoard.sort().join('') === 'KkQR';
      case 'kbkpEndgame':
        return piecesOnBoard.sort().join('') === 'KkBP';
      case 'krrkEndgame':
        return piecesOnBoard.sort().join('') === 'KkRR';
      case 'kbbkEndgame':
        return piecesOnBoard.sort().join('') === 'KkBB';
      default:
        return false;
    }
  }
}
