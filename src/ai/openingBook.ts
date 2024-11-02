export class OpeningBook {
  private static openings: {
    [key: string]: { fromX: number; fromY: number; toX: number; toY: number }[];
  } = {
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w': [
      { fromX: 1, fromY: 7, toX: 3, toY: 7 }, // King's pawn opening (1. e4)
      { fromX: 6, fromY: 7, toX: 5, toY: 5 }, // Queen's pawn opening (1. d4)
    ],
    'rnbqkbnr/pppppppp/8/8/8/8/PPP1PPPP/RNBQKBNR w': [
      { fromX: 2, fromY: 7, toX: 4, toY: 7 }, // English opening (1. c4)
      { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // Queen's gambit (1. d4 d5 2. c4)
    ],
    'rnbqkbnr/pppppp1p/8/8/8/8/PPPP1PPP/RNBQKBNR w': [
      { fromX: 4, fromY: 7, toX: 4, toY: 5 }, // Sicilian defense (1. e4 c5)
    ],
    'rnbqkbnr/ppp1pppp/8/8/8/8/PPP1PPPP/RNBQKBNR w': [
      { fromX: 5, fromY: 6, toX: 4, toY: 4 }, // French defense (1. e4 e6)
    ],
    'rnbqkbnr/pppppppp/8/8/8/8/PP1PPPPP/RNBQKBNR w': [
      { fromX: 4, fromY: 7, toX: 4, toY: 5 }, // Alekhine's defense (1. e4 Nf6)
    ],
    'rnbqkbnr/pppppppp/8/8/8/8/PPPP1PPP/RNBQKBNR w': [
      { fromX: 6, fromY: 6, toX: 6, toY: 4 }, // Modern defense (1. e4 g6)
    ],
  };

  static getOpeningMove(
    positionKey: string,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const moves = this.openings[positionKey];
    if (moves && moves.length > 0) {
      // Select a random move from the list for variety
      return moves[Math.floor(Math.random() * moves.length)];
    }
    return null;
  }
}
