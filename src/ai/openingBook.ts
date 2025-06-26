export interface Move {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  weight?: number;
}

export class OpeningBook {
  private static openings: Record<string, Move[]> = {
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w': [
      { fromX: 1, fromY: 7, toX: 3, toY: 7, weight: 0.6 }, // King's pawn (e4)
      { fromX: 6, fromY: 7, toX: 5, toY: 5, weight: 0.4 }, // Queen's pawn (d4)
    ],
    'rnbqkbnr/pppppppp/8/8/8/8/PPP1PPPP/RNBQKBNR w': [
      { fromX: 2, fromY: 7, toX: 4, toY: 7, weight: 0.5 }, // English (c4)
      { fromX: 4, fromY: 6, toX: 4, toY: 4, weight: 0.5 }, // Queen's gambit
    ],
    'rnbqkbnr/pppppp1p/8/8/8/8/PPPP1PPP/RNBQKBNR w': [
      { fromX: 4, fromY: 7, toX: 4, toY: 5, weight: 1 }, // Sicilian defense
    ],
    'rnbqkbnr/pppppppp/8/8/8/8/PP1PPPPP/RNBQKBNR w': [
      { fromX: 4, fromY: 7, toX: 4, toY: 5 }, // e4
    ],
  };

  static getOpeningMove(positionKey: string): Move | null {
    const moves = this.openings[positionKey];
    if (moves && moves.length > 0) {
      const totalWeight = moves.reduce((acc, move) => acc + (move.weight ?? 1), 0);
      let randomValue = Math.random() * totalWeight;
      for (const move of moves) {
        randomValue -= move.weight ?? 1;
        if (randomValue <= 0) {
          return move;
        }
      }
    }
    return null;
  }

  static addOpeningMove(positionKey: string, move: Move): void {
    if (!this.openings[positionKey]) {
      this.openings[positionKey] = [];
    }
    this.openings[positionKey].push(move);
  }
}
