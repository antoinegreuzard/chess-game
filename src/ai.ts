// src/ai.ts
import { Board } from './board';
import { Piece, PieceColor, PieceType } from './piece';
import {
  centerControlBonus,
  evaluateBoard,
  evaluateKingSafety,
  pieceValues,
} from './ai/evaluator';
import { EndgameTablebase } from './ai/endgameTablebase';
import { OpeningBook } from './ai/openingBook';
import { GamesAnalyzer } from './ai/gamesAnalyzer';
import { ContextualMoveDatabase } from './ai/contextualMoveDatabase';

// Classe AI utilisant l'algorithme Minimax avec Alpha-Beta Pruning et Transposition Table
export class AI {
  private readonly transpositionTable: Map<
    string,
    { value: number; depth: number }
  >; // Table de transposition avec profondeur
  private readonly maxTime: number;
  private startTime: number;
  private readonly killerMoves: Map<
    number,
    {
      move: { fromX: number; fromY: number; toX: number; toY: number };
      score: number;
    }[]
  >;
  private moveHistory: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }[] = [];
  private readonly historicalMoveScores: Map<string, number> = new Map();
  private gamesAnalyzer: GamesAnalyzer;
  private gamesLoaded: boolean = false;
  private contextualMoveDatabase: ContextualMoveDatabase;

  constructor(
    private readonly color: PieceColor,
    maxTime: number = 60000,
  ) {
    this.transpositionTable = new Map();
    this.maxTime = maxTime;
    this.killerMoves = new Map();
    this.startTime = 0;
    this.gamesAnalyzer = new GamesAnalyzer();
    this.contextualMoveDatabase = new ContextualMoveDatabase();
  }

  async loadGamesData() {
    await this.gamesAnalyzer.loadGamesData();
    this.gamesLoaded = true;
  }

  private recordMoveInContextualDatabase(
    positionKey: string,
    move: { fromX: number; fromY: number; toX: number; toY: number },
  ): void {
    this.contextualMoveDatabase.recordMove(positionKey, move);
  }

  public makeMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    if (!this.gamesLoaded) {
      throw new Error('Games data not loaded. Call loadGamesData() first.');
    }

    this.startTime = Date.now();
    this.maxTime = Math.floor(Math.random() * (50000 - 5000 + 1)) + 5000;

    const openingMove = this.getOpeningMove(board);
    if (
      openingMove &&
      typeof openingMove === 'object' &&
      'fromX' in openingMove &&
      'fromY' in openingMove &&
      'toX' in openingMove &&
      'toY' in openingMove
    ) {
      this.moveHistory.push(openingMove);
      this.recordMoveInContextualDatabase(
        this.getPositionKey(board),
        openingMove,
      ); // Enregistrement du mouvement
      return openingMove;
    }

    const endgameMove = this.useEndgameTablebase(board);
    if (
      endgameMove &&
      typeof endgameMove === 'object' &&
      'fromX' in endgameMove &&
      'fromY' in endgameMove &&
      'toX' in endgameMove &&
      'toY' in endgameMove
    ) {
      this.moveHistory.push(endgameMove);
      this.recordMoveInContextualDatabase(
        this.getPositionKey(board),
        endgameMove,
      ); // Enregistrement du mouvement
      return endgameMove;
    }

    const positionKey = this.getPositionKey(board);
    const analyzedMove = this.getAnalyzedMove(positionKey);
    if (
      analyzedMove &&
      typeof analyzedMove === 'object' &&
      'fromX' in analyzedMove &&
      'fromY' in analyzedMove &&
      'toX' in analyzedMove &&
      'toY' in analyzedMove
    ) {
      this.moveHistory.push(analyzedMove);
      this.recordMoveInContextualDatabase(positionKey, analyzedMove); // Enregistrement du mouvement
      return analyzedMove;
    }

    const bestMove = this.getBestMoveUsingMinimax(board);
    if (
      bestMove &&
      typeof bestMove === 'object' &&
      'fromX' in bestMove &&
      'fromY' in bestMove &&
      'toX' in bestMove &&
      'toY' in bestMove
    ) {
      this.moveHistory.push(bestMove);
      this.recordMoveInContextualDatabase(positionKey, bestMove); // Enregistrement du mouvement
      return bestMove;
    }

    return null;
  }

  private getOpeningMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const boardHash = board.getCurrentMovesHash();
    const openingMove = OpeningBook.getOpeningMove(boardHash);

    return openingMove ? this.flipMoveIfBlack(openingMove) : null;
  }

  private flipMoveIfBlack(move: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }): { fromX: number; fromY: number; toX: number; toY: number } {
    if (this.color === PieceColor.BLACK) {
      return {
        fromX: 7 - move.fromX,
        fromY: 7 - move.fromY,
        toX: 7 - move.toX,
        toY: 7 - move.toY,
      };
    }
    return move;
  }

  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    multiCutThreshold: number = 2,
    multiCutDepth: number = 3,
    probCutFactor: number = 0.9,
    aspirationDelta: number = 25,
  ): number {
    const phase = this.determineGamePhase(board);
    const boardKey = `${board.toString()}|${depth}|${phase}`;

    if (Date.now() - this.startTime > this.maxTime) {
      return this.evaluatePositionWithKingSafety(board, this.color);
    }

    // Vérification de la table de transposition
    if (this.transpositionTable.has(boardKey)) {
      const { value, depth: storedDepth } =
        this.transpositionTable.get(boardKey)!;
      if (storedDepth >= depth) return value;
    }

    // Condition de fin de recherche
    if (
      depth === 0 ||
      board.isCheckmate(this.color) ||
      board.isCheckmate(this.getOpponentColor())
    ) {
      const evaluation = this.quiescenceSearch(board, alpha, beta, phase);
      this.transpositionTable.set(boardKey, { value: evaluation, depth });
      return evaluation;
    }

    // Aspiration Window
    let evalGuess = this.evaluatePositionWithKingSafety(board, this.color);
    let localAlpha = evalGuess - aspirationDelta;
    let localBeta = evalGuess + aspirationDelta;
    let result: number;

    while (true) {
      result = this.alphaBetaWithAspirationWindow(
        board,
        depth,
        localAlpha,
        localBeta,
        isMaximizing,
        multiCutThreshold,
        multiCutDepth,
        probCutFactor,
      );

      // Si le résultat est hors de la fenêtre, on l'élargit et on recommence
      if (result <= localAlpha) {
        localAlpha -= aspirationDelta; // Elargir en dessous
      } else if (result >= localBeta) {
        localBeta += aspirationDelta; // Elargir au-dessus
      } else {
        break; // Si le résultat est dans la fenêtre, on le garde
      }
    }

    this.transpositionTable.set(boardKey, { value: result, depth });
    return result;
  }

  private alphaBetaWithAspirationWindow(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    multiCutThreshold: number,
    multiCutDepth: number,
    probCutFactor: number,
  ): number {
    if (Date.now() - this.startTime > this.maxTime) return alpha;

    let bestEval = isMaximizing ? -Infinity : Infinity;
    let moves = this.getAllValidMoves(board);
    moves = this.sortMoves(moves, board, depth, this.determineGamePhase(board));

    let cutCount = 0;

    for (const move of moves) {
      const fromPiece = board.getPiece(move.fromX, move.fromY);
      const toPiece = board.getPiece(move.toX, move.toY);

      board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

      let evaluation: number;

      // Multi-Cut Pruning combiné avec ProbCut
      if (depth >= multiCutDepth && cutCount < multiCutThreshold) {
        evaluation = -this.minimax(
          board,
          depth - multiCutDepth,
          -beta,
          -alpha,
          !isMaximizing,
          multiCutThreshold,
          multiCutDepth,
          probCutFactor,
        );
        if (evaluation <= alpha) {
          cutCount++;
          board.setPiece(move.fromX, move.fromY, fromPiece);
          board.setPiece(move.toX, move.toY, toPiece);
          continue;
        }
      }

      evaluation = this.minimax(
        board,
        depth - 1,
        alpha,
        beta,
        !isMaximizing,
        multiCutThreshold,
        multiCutDepth,
        probCutFactor,
      );

      board.setPiece(move.fromX, move.fromY, fromPiece);
      board.setPiece(move.toX, move.toY, toPiece);

      if (isMaximizing) {
        if (evaluation > bestEval) {
          bestEval = evaluation;
          this.updateHistoricalMoveScore(move);
          this.addKillerMove(depth, move);
        }
        alpha = Math.max(alpha, evaluation);
      } else {
        if (evaluation < bestEval) {
          bestEval = evaluation;
          this.updateHistoricalMoveScore(move);
          this.addKillerMove(depth, move);
        }
        beta = Math.min(beta, evaluation);
      }

      if (beta <= alpha) break;
    }

    return bestEval;
  }

  private determineGamePhase(board: Board): 'opening' | 'midgame' | 'endgame' {
    const pieceCount = board.getPieceCount();
    if (pieceCount > 24) return 'opening';
    if (pieceCount > 12) return 'midgame';
    return 'endgame';
  }

  private addKillerMove(
    depth: number,
    move: { fromX: number; fromY: number; toX: number; toY: number },
  ) {
    const killers = this.killerMoves.get(depth) ?? [];
    const moveKey = `${move.fromX},${move.fromY},${move.toX},${move.toY}`;

    // Augmenter le score des killer moves pour ce mouvement
    let existingMove = killers.find(
      (k) =>
        `${k.move.fromX},${k.move.fromY},${k.move.toX},${k.move.toY}` ===
        moveKey,
    );
    if (existingMove) {
      existingMove.score += 10;
    } else {
      killers.push({ move, score: 10 });
    }

    // Trier par score et limiter le nombre de killer moves par profondeur
    this.killerMoves.set(
      depth,
      killers.sort((a, b) => b.score - a.score).slice(0, 2),
    );
  }

  private updateHistoricalMoveScore(move: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }) {
    const moveKey = `${move.fromX},${move.fromY},${move.toX},${move.toY}`;
    const currentScore = this.historicalMoveScores.get(moveKey) || 0;
    this.historicalMoveScores.set(moveKey, currentScore + 1);
  }

  private quiescenceSearch(
    board: Board,
    alpha: number,
    beta: number,
    phase: 'opening' | 'midgame' | 'endgame',
    depth: number = 0,
  ): number {
    const maxQuiescenceDepth = this.getAdaptiveQuiescenceDepth(board);
    if (depth >= maxQuiescenceDepth) {
      return evaluateBoard(board, this.color);
    }

    const standPat = evaluateBoard(board, this.color);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = this.getAllValidMoves(board).filter((move) =>
      board.isCapture(move.fromX, move.fromY, move.toX, move.toY),
    );

    for (const move of moves) {
      const fromPiece = board.getPiece(move.fromX, move.fromY);
      const toPiece = board.getPiece(move.toX, move.toY);

      board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
      let score = -this.quiescenceSearch(
        board,
        -beta,
        -alpha,
        phase,
        depth + 1,
      );

      // En fin de partie, accorder plus d'importance aux captures critiques
      if (phase === 'endgame' && this.isCriticalMove(fromPiece!, move, board)) {
        score += 20;
      }

      board.setPiece(move.fromX, move.fromY, fromPiece);
      board.setPiece(move.toX, move.toY, toPiece);

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  private getOpponentColor(): PieceColor {
    return this.color === PieceColor.WHITE
      ? PieceColor.BLACK
      : PieceColor.WHITE;
  }

  private getAllValidMoves(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const validMoves = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);
        if (piece && piece.color === this.color) {
          const moves = board.getValidMoves(x, y);
          for (const move of moves) {
            if (board.isMoveValid(x, y, move.x, move.y)) {
              const originalPiece = board.getPiece(move.x, move.y);
              board.setPiece(move.x, move.y, piece);
              board.setPiece(x, y, null);

              const kingSafe = !board.isKingInCheck(this.color);

              board.setPiece(x, y, piece);
              board.setPiece(move.x, move.y, originalPiece);

              if (kingSafe) {
                validMoves.push({
                  fromX: x,
                  fromY: y,
                  toX: move.x,
                  toY: move.y,
                });
              }
            }
          }
        }
      }
    }
    return validMoves;
  }

  private sortMoves(
    moves: { fromX: number; fromY: number; toX: number; toY: number }[],
    board: Board,
    depth: number,
    phase: 'opening' | 'midgame' | 'endgame',
  ): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const positionKey = this.getPositionKey(board);
    const contextualMoves =
      this.contextualMoveDatabase.getMovesByFrequency(positionKey);

    return moves.sort((a, b) => {
      const pieceA = board.getPiece(a.toX, a.toY);
      const pieceB = board.getPiece(b.toX, b.toY);

      const valueA = pieceA ? pieceValues[pieceA.type] : 0;
      const valueB = pieceB ? pieceValues[pieceB.type] : 0;

      // Prioriser les mouvements contextuels basés sur les données
      const moveAContextScore = contextualMoves.findIndex(
        (m) =>
          m.move.fromX === a.fromX &&
          m.move.fromY === a.fromY &&
          m.move.toX === a.toX &&
          m.move.toY === a.toY,
      );
      const moveBContextScore = contextualMoves.findIndex(
        (m) =>
          m.move.fromX === b.fromX &&
          m.move.fromY === b.fromY &&
          m.move.toX === b.toX &&
          m.move.toY === b.toY,
      );

      // Prioriser les mouvements qui apparaissent plus fréquemment
      if (moveAContextScore !== -1 || moveBContextScore !== -1) {
        return (
          (moveAContextScore !== -1 ? moveAContextScore : Infinity) -
          (moveBContextScore !== -1 ? moveBContextScore : Infinity)
        );
      }

      if (phase === 'opening') {
        const centerControlA = centerControlBonus[`${a.toX},${a.toY}`] || 0;
        const centerControlB = centerControlBonus[`${b.toX},${b.toY}`] || 0;
        if (centerControlA !== centerControlB)
          return centerControlB - centerControlA;
      } else if (phase === 'endgame') {
        if (pieceA && pieceA.type === PieceType.PAWN && a.toY === 7) return -1;
        if (pieceB && pieceB.type === PieceType.PAWN && b.toY === 7) return 1;
      }

      if (valueA !== valueB) return valueB - valueA;

      const killerMovesAtDepth = this.killerMoves.get(depth);
      if (
        killerMovesAtDepth &&
        killerMovesAtDepth.some(
          (km) =>
            km.move.fromX === a.fromX &&
            km.move.fromY === a.fromY &&
            km.move.toX === a.toX &&
            km.move.toY === a.toY,
        )
      ) {
        return -1;
      }

      const scoreA =
        this.historicalMoveScores.get(
          `${a.fromX},${a.fromY},${a.toX},${a.toY}`,
        ) || 0;
      const scoreB =
        this.historicalMoveScores.get(
          `${b.fromX},${b.fromY},${b.toX},${b.toY}`,
        ) || 0;

      return scoreB - scoreA;
    });
  }

  private getAdaptiveQuiescenceDepth(board: Board): number {
    const pieceCount = board.getPieceCount();
    if (pieceCount <= 6) return 7;
    if (pieceCount <= 12) return 5;
    return 3;
  }

  private evaluatePositionWithKingSafety(
    board: Board,
    color: PieceColor,
  ): number {
    let score = evaluateBoard(board, color);
    const kingSafety = evaluateKingSafety(board, color);
    score += kingSafety;
    return score;
  }

  private useEndgameTablebase(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    if (board.getPieceCount() <= 5) {
      const positionKey = board.getCurrentMovesHash();
      const endgameMove = EndgameTablebase.getEndgameMove(positionKey);
      return endgameMove ? this.flipMoveIfBlack(endgameMove) : null;
    }
    return null;
  }

  // Fonction pour identifier les mouvements critiques
  private isCriticalMove(
    piece: Piece,
    move: { fromX: number; fromY: number; toX: number; toY: number },
    board: Board,
  ): boolean {
    const targetPiece = board.getPiece(move.toX, move.toY);
    return <boolean>(
      (targetPiece &&
        targetPiece.color !== piece.color &&
        targetPiece.type !== PieceType.PAWN)
    );
  }

  private getPositionKey(board: Board): string {
    return board.getCurrentMovesHash();
  }

  private convertMoveToCoords(move: string): {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } {
    const [fromX, fromY, toX, toY] = move.match(/\d+/g)!.map(Number);
    return { fromX, fromY, toX, toY };
  }

  private getAnalyzedMove(
    position: string,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const bestMove = this.gamesAnalyzer.getBestMove(position);
    return bestMove ? this.convertMoveToCoords(bestMove) : null;
  }

  private getBestMoveUsingMinimax(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    let bestMove = null;
    let bestValue = -Infinity;
    const maxDepth = 16;
    const phase = this.determineGamePhase(board);
    const THRESHOLD_VALUE = 600;

    for (let depth = 1; depth <= maxDepth; depth++) {
      if (Date.now() - this.startTime > this.maxTime) break;

      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth, phase);

      for (const move of moves) {
        if (Date.now() - this.startTime > this.maxTime) return bestMove;

        const piece = board.getPiece(move.fromX, move.fromY);
        if (!piece) continue;
        const originalPiece = board.getPiece(move.toX, move.toY);

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        const isCritical =
          board.isKingInCheck(this.color) ||
          this.isCriticalMove(piece, move, board);
        const adjustedDepth = isCritical ? depth + 1 : depth;

        // Fenêtre nulle pour les mouvements de type "killer"
        const boardValue = this.minimax(
          board,
          adjustedDepth - 1,
          -bestValue,
          -Infinity,
          false,
        );

        board.setPiece(move.fromX, move.fromY, piece);
        board.setPiece(move.toX, move.toY, originalPiece);

        if (-boardValue > bestValue) {
          bestValue = -boardValue;
          bestMove = move;

          if (bestValue >= THRESHOLD_VALUE) return bestMove;
        }

        if (Date.now() - this.startTime > this.maxTime) {
          return bestMove;
        }
      }

      if (Date.now() - this.startTime > this.maxTime) {
        break;
      }
    }

    return bestMove;
  }
}
