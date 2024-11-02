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
    game.Moves.forEach((move, index) => {
      const key = `${move}-${index}`;
      this.moveScores[key] = (this.moveScores[key] || 0) + 1;
    });
  }

  public getBestMove(position: string): string | null {
    const moves = Object.keys(this.moveScores)
      .filter((key) => key.startsWith(position))
      .sort((a, b) => this.moveScores[b] - this.moveScores[a]);

    return moves.length > 0 ? moves[0].split('-')[0] : null;
  }
}
