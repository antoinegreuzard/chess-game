import { Move } from './openingBook';

export class ContextualMoveDatabase {
  private moveData = new Map<string, { move: Move; count: number; lastUsed: number }[]>();
  private maxMovesStored = 1000;

  recordMove(positionKey: string, move: Move): void {
    const key = this.normalizeKey(positionKey);
    const moves = this.moveData.get(key) || [];
    const existingMove = moves.find(m =>
      m.move.fromX === move.fromX &&
      m.move.fromY === move.fromY &&
      m.move.toX === move.toX &&
      m.move.toY === move.toY
    );

    if (existingMove) {
      existingMove.count++;
      existingMove.lastUsed = Date.now();
    } else {
      moves.push({ move, count: 1, lastUsed: Date.now() });
    }

    moves.sort((a, b) => b.count - a.count);
    if (moves.length > this.maxMovesStored) {
      moves.pop(); // enlève le coup le moins fréquent/récent
    }
    this.moveData.set(key, moves);
  }

  getMovesByFrequency(positionKey: string): { move: Move; count: number }[] {
    return this.moveData.get(this.normalizeKey(positionKey)) || [];
  }

  private normalizeKey(key: string): string {
    return key.replace(/\s+/g, '');
  }

  pruneOldMoves(expirationTimeMs: number): void {
    const now = Date.now();
    for (const [key, moves] of this.moveData.entries()) {
      const prunedMoves = moves.filter(m => now - m.lastUsed < expirationTimeMs);
      if (prunedMoves.length > 0) {
        this.moveData.set(key, prunedMoves);
      } else {
        this.moveData.delete(key);
      }
    }
  }
}
