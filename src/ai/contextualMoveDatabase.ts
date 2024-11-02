// src/ai/contextualMoveDatabase.ts
export class ContextualMoveDatabase {
  private moveData: Map<
    string,
    {
      move: { fromX: number; fromY: number; toX: number; toY: number };
      count: number;
    }[]
  > = new Map();

  // Ajoute un mouvement dans la base de données pour la clé de position
  public recordMove(
    positionKey: string,
    move: { fromX: number; fromY: number; toX: number; toY: number },
  ): void {
    const moves = this.moveData.get(positionKey) || [];
    const existingMove = moves.find(
      (m) =>
        m.move.fromX === move.fromX &&
        m.move.fromY === move.fromY &&
        m.move.toX === move.toX &&
        m.move.toY === move.toY,
    );

    if (existingMove) {
      existingMove.count++;
    } else {
      moves.push({ move, count: 1 });
    }

    this.moveData.set(positionKey, moves);
  }

  // Récupère les mouvements triés par fréquence pour une clé de position donnée
  public getMovesByFrequency(
    positionKey: string,
  ): {
    move: { fromX: number; fromY: number; toX: number; toY: number };
    count: number;
  }[] {
    return (this.moveData.get(positionKey) || []).sort(
      (a, b) => b.count - a.count,
    );
  }
}
