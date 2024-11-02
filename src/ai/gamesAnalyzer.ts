interface GameData {
  Event: string;
  Site: string;
  Date: string;
  Round: string;
  White: string;
  Black: string;
  Result: string;
  Moves: string[];
}

interface MoveScore {
  [key: string]: number;
}

export class GamesAnalyzer {
  private moveScores: MoveScore = {};

  async loadGamesData() {
    const response = await fetch('/chess-game/games.json');
    const gamesData: GameData[] = await response.json();
    this.loadGames(gamesData);
  }

  private loadGames(games: GameData[]) {
    games.forEach((game) => this.analyzeGame(game));
  }

  private analyzeGame(game: GameData) {
    let cumulativePosition = '';

    game.Moves.forEach((move, index) => {
      cumulativePosition += move;
      const key = `${cumulativePosition}-${index}`;
      this.moveScores[key] = (this.moveScores[key] || 0) + 1;
    });
  }

  // Méthode pour trouver le meilleur mouvement en filtrant les clés `moveScores` pour les correspondances
  public getBestMove(position: string): string | null {
    // Filtre toutes les clés qui commencent par la position donnée
    const matchingMoves = Object.keys(this.moveScores)
      .filter((key) => key.startsWith(position))
      .map((key) => ({
        move: key.split('-')[0],
        score: this.moveScores[key],
      }))
      .sort((a, b) => b.score - a.score);

    // Retourner le mouvement le plus fréquent s'il existe
    return matchingMoves.length > 0 ? matchingMoves[0].move : null;
  }
}
