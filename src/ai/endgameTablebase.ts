// ai/endgameTablebase.ts

export class EndgameTablebase {
  private static endgames: {
    [key: string]: { fromX: number; fromY: number; toX: number; toY: number };
  } = {
    kqkEndgame: { fromX: 7, fromY: 1, toX: 6, toY: 1 }, // Roi + Dame contre Roi
    krkEndgame: { fromX: 7, fromY: 0, toX: 5, toY: 0 }, // Roi + Tour contre Roi
    kbbkEndgame: { fromX: 5, fromY: 3, toX: 3, toY: 1 }, // Roi + 2 Fous contre Roi
    kbnkEndgame: { fromX: 2, fromY: 6, toX: 4, toY: 4 }, // Roi + Fou + Cavalier contre Roi
    kpEndgame: { fromX: 6, fromY: 5, toX: 6, toY: 6 }, // Roi + Pion contre Roi
    kppkEndgame: { fromX: 5, fromY: 2, toX: 5, toY: 3 }, // Roi + 2 Pions contre Roi
    krkpEndgame: { fromX: 6, fromY: 0, toX: 6, toY: 1 }, // Roi + Tour contre Roi + Pion
    kqkrEndgame: { fromX: 7, fromY: 2, toX: 6, toY: 2 }, // Roi + Dame contre Roi + Tour
    kbkpEndgame: { fromX: 3, fromY: 3, toX: 4, toY: 2 }, // Roi + Fou contre Roi + Pion
    krrkEndgame: { fromX: 7, fromY: 4, toX: 5, toY: 4 }, // Roi + 2 Tours contre Roi
  };

  static getEndgameMove(
    positionKey: string,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    return this.endgames[positionKey] || null;
  }
}
