import { Move } from './openingBook';

interface Endgame {
  moves: Move[];
}

export class EndgameTablebase {
  private static endgames: Record<string, Endgame> = {
    'kqkEndgame': {
      moves: [
        { fromX: 7, fromY: 1, toX: 6, toY: 1 },
        { fromX: 6, fromY: 1, toX: 5, toY: 1 },
        // Ajoute une séquence complète optimale ici
      ],
    },
    'krkEndgame': {
      moves: [
        { fromX: 7, fromY: 0, toX: 5, toY: 0 },
        { fromX: 5, fromY: 0, toX: 4, toY: 0 },
        // Séquence optimale
      ],
    },
    // Ajoute d'autres finales si nécessaire
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

  static validateEndgame(positionKey: string, piecesOnBoard: string[]): boolean {
    switch (positionKey) {
      case 'kqkEndgame':
        return piecesOnBoard.sort().join('') === 'KkQ';
      case 'krkEndgame':
        return piecesOnBoard.sort().join('') === 'KkR';
      // Ajoute d'autres validations spécifiques si nécessaire
      default:
        return false;
    }
  }
}
