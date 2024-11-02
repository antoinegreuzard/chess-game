export class GamesAnalyzer {
  private gamePatterns: Map<
    string,
    { move: string; successRate: number; games: number }[]
  > = new Map();

  async loadGamesData() {
    const response = await fetch('/chess-game/games.json');
    const gamesData: { Moves: string[]; Result: string }[] =
      await response.json();
    this.loadGames(gamesData);
  }

  private loadGames(gamesData: { Moves: string[]; Result: string }[]) {
    gamesData.forEach((game) => {
      const moves = game.Moves;
      const result = game.Result;

      let currentPosition = ''; // Initial key for board state
      moves.forEach((move) => {
        if (!this.gamePatterns.has(currentPosition)) {
          this.gamePatterns.set(currentPosition, []);
        }

        const moveData = this.gamePatterns.get(currentPosition);
        const success = result === '1-0' ? 1 : result === '0-1' ? 0 : 0.5;
        const existingMove = moveData!.find((data) => data.move === move);

        if (existingMove) {
          existingMove.successRate =
            (existingMove.successRate * existingMove.games + success) /
            (existingMove.games + 1);
          existingMove.games += 1;
        } else {
          moveData!.push({ move, successRate: success, games: 1 });
        }

        // Update current position by appending the move
        currentPosition += move + ' ';
      });
    });
  }

  getBestMove(position: string): string | null {
    const movesData = this.gamePatterns.get(position);
    if (!movesData || movesData.length === 0) return null;

    movesData.sort((a, b) => b.successRate - a.successRate);
    return movesData[0].move;
  }
}
