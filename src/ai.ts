// src/ai.ts
import { Board } from './board';
import { Piece, PieceColor, PieceType } from './piece';
import {
  centerControlBonus,
  evaluateBoard,
  evaluateKingSafety,
  pieceValues,
} from './ai/evaluator';
import { getEndgameMove } from './ai/endgameTablebase';
import { flipMove, getNextOpeningMove, openingBook } from './ai/openingBook';

// Classe AI utilisant l'algorithme Minimax avec Alpha-Beta Pruning et Transposition Table
export class AI {
  private readonly openingMoves: {
    [key: string]: { fromX: number; fromY: number; toX: number; toY: number }[];
  } = openingBook;
  private readonly transpositionTable: Map<string, number>; // Table de transposition
  private readonly maxTime: number; // Temps maximum de réflexion en millisecondes
  private startTime: number; // Temps de début pour gestion du temps
  private readonly killerMoves: Map<
    number,
    {
      move: { fromX: number; fromY: number; toX: number; toY: number };
      score: number;
    }[]
  >; // Heuristic des coups efficaces
  private moveHistory: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }[] = [];
  private readonly historicalMoveScores: Map<string, number> = new Map(); // Stockage des scores historiques des mouvements

  constructor(
    private readonly color: PieceColor,
    maxTime: number = 5000,
  ) {
    this.transpositionTable = new Map();
    this.maxTime = maxTime;
    this.killerMoves = new Map();
    this.startTime = 0;
  }

  // Méthode principale pour faire un mouvement
  public makeMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    // Vérifie si un mouvement d'ouverture est disponible
    const openingMove = this.getOpeningMove(board);
    if (openingMove) {
      this.moveHistory.push(openingMove); // Ajoute à l'historique des coups
      return openingMove;
    }

    // Vérifie si un mouvement d'ouverture basé sur les coups passés est disponible
    const chosenMove = this.chooseMove(board);
    if (chosenMove) {
      this.moveHistory.push(chosenMove);
      return chosenMove;
    }
    const endgameMove = this.useEndgameTablebase(board);
    if (endgameMove) {
      this.moveHistory.push(endgameMove); // Ajoute à l'historique des coups
      return endgameMove;
    }

    // Utilise MCTS pour les positions complexes ou de fin de partie
    if (this.shouldUseMCTS(board)) {
      const mctsMove = this.mcts(board);
      if (mctsMove) {
        this.moveHistory.push(mctsMove); // Ajoute à l'historique des coups
      }
      return mctsMove;
    }

    // Utilise Minimax avec Alpha-Beta Pruning si aucun autre mouvement n'est trouvé
    let bestMove = null;
    let bestValue = -Infinity;
    const maxDepth = 10; // Profondeur maximale de recherche pour Minimax
    this.startTime = Date.now();

    for (let depth = 1; depth <= maxDepth; depth++) {
      let moves = this.getAllValidMoves(board);

      // Trie les mouvements pour optimiser la recherche
      moves = this.sortMoves(moves, board, depth);

      for (const move of moves) {
        const piece = board.getPiece(move.fromX, move.fromY);
        if (!piece) continue;
        const originalPiece = board.getPiece(move.toX, move.toY);
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);

        const isCritical =
          board.isKingInCheck(this.color) ||
          this.isCriticalMove(piece, move, board);
        const adjustedDepth = isCritical ? depth + 1 : depth;

        // Appelle la recherche Minimax avec Alpha-Beta Pruning
        const boardValue = this.minimax(
          board,
          adjustedDepth - 1,
          -Infinity,
          Infinity,
          false,
        );

        board.setPiece(move.fromX, move.fromY, piece);
        board.setPiece(move.toX, move.toY, originalPiece);

        if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }

        // Vérifie le temps de réflexion et arrête si le maximum est atteint
        if (Date.now() - this.startTime > this.maxTime) {
          break;
        }
      }

      // Vérifie encore une fois le temps de réflexion à la fin de chaque profondeur
      if (Date.now() - this.startTime > this.maxTime) {
        break;
      }
    }

    // Ajoute le meilleur mouvement trouvé à l'historique des coups si existant
    if (bestMove) {
      this.moveHistory.push(bestMove);
      this.updateHistoricalScore(bestMove);
    }

    return bestMove;
  }

  // Fonction pour augmenter le score historique d'un mouvement après son utilisation
  private updateHistoricalScore(move: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }) {
    const moveKey = `${move.fromX},${move.fromY},${move.toX},${move.toY}`;
    const currentScore = this.historicalMoveScores.get(moveKey) || 0;
    this.historicalMoveScores.set(moveKey, currentScore + 1);
  }

  // Fonction Minimax avec Alpha-Beta Pruning et table de transposition
  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
  ): number {
    const boardKey = board.toString();

    // Vérifie le temps limite
    if (Date.now() - this.startTime > this.maxTime) {
      return this.evaluatePositionWithKingSafety(board, this.color);
    }

    // Vérifie si le résultat est déjà dans la table de transposition
    if (this.transpositionTable.has(boardKey)) {
      return this.transpositionTable.get(boardKey)!;
    }

    // Null Move Pruning : Effectue un coup nul pour voir si une menace est évidente
    if (depth > 1 && !board.isKingInCheck(this.color)) {
      const nullMoveEval = -this.minimax(
        board,
        depth - 2,
        -beta,
        -alpha,
        !isMaximizing,
      );
      if (nullMoveEval >= beta) {
        return beta; // Coupe si le coup nul montre une menace
      }
    }

    // Condition de fin de récursion
    if (
      depth === 0 ||
      board.isCheckmate(this.color) ||
      board.isCheckmate(this.getOpponentColor()) ||
      Date.now() - this.startTime > this.maxTime
    ) {
      const evaluation = this.quiescenceSearch(board, alpha, beta);
      this.transpositionTable.set(boardKey, evaluation);
      return evaluation;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);

      for (const move of moves) {
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const evaluation = this.minimax(board, depth - 1, alpha, beta, false);
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          this.addKillerMove(depth, move);
          break;
        }
      }

      this.transpositionTable.set(boardKey, maxEval);
      return maxEval;
    } else {
      let minEval = Infinity;
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);

      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);

        // Late Move Reduction : Réduit la profondeur pour les coups tardifs
        const shouldReduce = i > 3 && depth > 2;
        const newDepth = shouldReduce ? depth - 1 : depth;

        // Extension : Allonge la profondeur pour les échecs et poussées de pions
        const isCheck = board.isKingInCheck(this.getOpponentColor());
        const isPawnPush =
          fromPiece &&
          fromPiece.type === PieceType.PAWN &&
          (move.toY === 0 || move.toY === 7);
        const extendedDepth = isCheck || isPawnPush ? newDepth + 1 : newDepth;

        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const evaluation = this.minimax(
          board,
          extendedDepth - 1,
          alpha,
          beta,
          true,
        );
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          this.addKillerMove(depth, move);
          break;
        }
      }

      this.transpositionTable.set(boardKey, minEval);
      return minEval;
    }
  }

  private chooseMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const key = this.moveHistory
      .map((move) => `${move.fromX}${move.fromY}${move.toX}${move.toY}`)
      .join(' ');

    console.log(key);
    const openingMove = getNextOpeningMove(key, this.openingMoves);

    if (openingMove) {
      const flippedMove = flipMove(
        openingMove,
        this.color === PieceColor.BLACK,
      );

      // Évaluation de la position pour ajuster le choix de l'ouverture
      board.movePiece(
        flippedMove.fromX,
        flippedMove.fromY,
        flippedMove.toX,
        flippedMove.toY,
      );
      const evaluation = evaluateBoard(board, this.color);
      board.setPiece(
        flippedMove.fromX,
        flippedMove.fromY,
        board.getPiece(flippedMove.toX, flippedMove.toY),
      );
      board.setPiece(flippedMove.toX, flippedMove.toY, null);

      const threshold = 0.3;
      if (evaluation >= threshold) {
        return flippedMove;
      }
    }

    return null;
  }

  // Ajout des killer moves avec meilleure gestion de cache
  private addKillerMove(
    depth: number,
    move: { fromX: number; fromY: number; toX: number; toY: number },
  ) {
    // Récupère les killer moves actuels pour la profondeur spécifiée ou initialise un tableau vide
    const killers = this.killerMoves.get(depth) ?? [];

    // Vérifie si le mouvement est déjà présent et augmente son score, sinon l'ajoute
    const existingMove = killers.find(
      (k) => k.move.fromX === move.fromX && k.move.fromY === move.fromY,
    );

    if (existingMove) {
      existingMove.score += 1;
    } else {
      killers.push({ move, score: 1 });
    }

    // Trie et limite le tableau des killer moves aux deux meilleurs par profondeur
    this.killerMoves.set(
      depth,
      killers
        .sort((a, b) => b.score - a.score) // Trie les moves par score décroissant
        .slice(0, 2), // Garde uniquement les deux meilleurs
    );
  }

  // Recherche de quiescence pour améliorer l'évaluation des positions
  private quiescenceSearch(
    board: Board,
    alpha: number,
    beta: number,
    depth: number = 0,
  ): number {
    const maxQuiescenceDepth = this.getAdaptiveQuiescenceDepth(board);

    if (depth >= maxQuiescenceDepth) {
      return evaluateBoard(board, this.color);
    }

    const standPat = evaluateBoard(board, this.color);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const captureMoves = this.getAllValidMoves(board).filter((move) =>
      board.isCapture(move.fromX, move.fromY, move.toX, move.toY),
    );

    // Non-capture moves : Inclut quelques mouvements non capturants comme les poussées de pions
    const nonCaptureMoves = this.getAllValidMoves(board).filter((move) => {
      const piece = board.getPiece(move.fromX, move.fromY);
      return (
        !board.isCapture(move.fromX, move.fromY, move.toX, move.toY) &&
        piece &&
        (piece.type === PieceType.PAWN || piece.type === PieceType.KNIGHT)
      );
    });

    const moves = [...captureMoves, ...nonCaptureMoves];

    for (const move of moves) {
      const fromPiece = board.getPiece(move.fromX, move.fromY);
      const toPiece = board.getPiece(move.toX, move.toY);

      board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
      const kingSafe = !board.isKingInCheck(this.color);
      let score = standPat;

      if (kingSafe) {
        score = -this.quiescenceSearch(board, -beta, -alpha, depth + 1);
      }

      board.setPiece(move.fromX, move.fromY, fromPiece);
      board.setPiece(move.toX, move.toY, toPiece);

      // Met à jour alpha si un meilleur score est trouvé
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
  ): { fromX: number; fromY: number; toX: number; toY: number }[] {
    return moves.sort((a, b) => {
      // 1. Priorité aux mouvements capturant des pièces de valeur plus élevée
      const pieceA = board.getPiece(a.toX, a.toY);
      const pieceB = board.getPiece(b.toX, b.toY);

      const valueA = pieceA ? pieceValues[pieceA.type] : 0;
      const valueB = pieceB ? pieceValues[pieceB.type] : 0;

      if (valueA !== valueB) {
        return valueB - valueA; // Tri décroissant par valeur de capture
      }

      // 2. Bonus pour le contrôle des cases centrales
      const centerControlA = centerControlBonus[`${a.toX},${a.toY}`] || 0;
      const centerControlB = centerControlBonus[`${b.toX},${b.toY}`] || 0;

      if (centerControlA !== centerControlB) {
        return centerControlB - centerControlA; // Tri par contrôle du centre
      }

      // 3. Priorité aux mouvements dans les killer moves pour cette profondeur
      const killerMovesAtDepth = this.killerMoves.get(depth);
      if (
        killerMovesAtDepth &&
        killerMovesAtDepth.some(
          (move) =>
            move.move.fromX === a.fromX &&
            move.move.fromY === a.fromY &&
            move.move.toX === a.toX &&
            move.move.toY === a.toY,
        )
      ) {
        return -1;
      }

      // 4. Score historique pour le mouvement, favorise les coups réussis dans le passé
      const scoreA =
        this.historicalMoveScores.get(
          `${a.fromX},${a.fromY},${a.toX},${a.toY}`,
        ) || 0;
      const scoreB =
        this.historicalMoveScores.get(
          `${b.fromX},${b.fromY},${b.toX},${b.toY}`,
        ) || 0;

      return scoreB - scoreA; // Tri par score historique décroissant
    });
  }

  // Algorithme MCTS pour évaluer des positions complexes ou de fin de partie
  private mcts(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const iterations = 1000; // Nombre de simulations
    const moveScores: Map<string, number> = new Map();

    // Filtre les mouvements valides pour la simulation
    const validMoves = this.getAllValidMoves(board).filter(
      (move) =>
        move.fromX !== undefined &&
        move.fromY !== undefined &&
        move.toX !== undefined &&
        move.toY !== undefined,
    );

    if (validMoves.length === 0) return null;

    for (let i = 0; i < iterations; i++) {
      const move = validMoves[Math.floor(Math.random() * validMoves.length)];

      // Vérifie que toutes les propriétés de move sont bien définies
      if (
        !move ||
        move.fromX === undefined ||
        move.fromY === undefined ||
        move.toX === undefined ||
        move.toY === undefined
      ) {
        continue;
      }

      const simulationResult = this.simulateRandomGame(board, move);

      const moveKey = `${move.fromX},${move.fromY},${move.toX},${move.toY}`;
      moveScores.set(
        moveKey,
        (moveScores.get(moveKey) ?? 0) + simulationResult,
      );

      // Vérifie le temps de réflexion pour arrêter les itérations si nécessaire
      if (Date.now() - this.startTime > this.maxTime) {
        break;
      }
    }

    // Trouve le mouvement avec la meilleure note moyenne
    const bestMoveKey = Array.from(moveScores.entries()).reduce(
      (best, current) => (current[1] > best[1] ? current : best),
    )[0];

    const [fromX, fromY, toX, toY] = bestMoveKey.split(',').map(Number);
    return { fromX, fromY, toX, toY };
  }

  // Adaptation de la profondeur de quiescence en fonction de la situation
  private getAdaptiveQuiescenceDepth(board: Board): number {
    const pieceCount = board.getPieceCount();
    if (pieceCount <= 6) return 7; // Profondeur plus élevée en fin de partie
    if (pieceCount <= 12) return 5; // Moyenne en milieu de partie
    return 3; // Réduit en début de partie
  }

  private evaluatePositionWithKingSafety(
    board: Board,
    color: PieceColor,
  ): number {
    let score = evaluateBoard(board, color); // Évaluation générale de la position
    const kingSafety = evaluateKingSafety(board, color); // Évaluation de la sécurité du roi
    score += kingSafety; // Ajuste le score en fonction de la sécurité du roi
    return score;
  }

  // Simule une partie aléatoire pour obtenir une estimation du résultat
  private simulateRandomGame(
    board: Board,
    move: { fromX: number; fromY: number; toX: number; toY: number },
  ): number {
    // Vérifie que toutes les propriétés de move sont définies
    if (
      !move ||
      move.fromX === undefined ||
      move.fromY === undefined ||
      move.toX === undefined ||
      move.toY === undefined
    ) {
      console.error('Invalid move:', move);
      return 0; // Retourne 0 ou une autre valeur par défaut si le mouvement est invalide
    }

    const tempBoard = board.clone();
    tempBoard.movePiece(move.fromX, move.fromY, move.toX, move.toY);
    let currentPlayer = this.color;
    let moves = this.getAllValidMoves(tempBoard);

    while (!tempBoard.isGameOver() && moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];

      // Vérifie que le mouvement aléatoire est valide
      if (
        !randomMove ||
        randomMove.fromX === undefined ||
        randomMove.fromY === undefined ||
        randomMove.toX === undefined ||
        randomMove.toY === undefined
      ) {
        console.error('Invalid random move:', randomMove);
        break;
      }

      tempBoard.movePiece(
        randomMove.fromX,
        randomMove.fromY,
        randomMove.toX,
        randomMove.toY,
      );
      currentPlayer =
        currentPlayer === PieceColor.WHITE
          ? PieceColor.BLACK
          : PieceColor.WHITE;
      moves = this.getAllValidMoves(tempBoard);
    }

    // Retourne un score basé sur le résultat de la partie simulée
    return tempBoard.getWinner() === this.color
      ? 1
      : tempBoard.getWinner() === null
        ? 0.5
        : 0;
  }

  // Détermine quand utiliser MCTS
  private shouldUseMCTS(board: Board): boolean {
    return board.getPieceCount() <= 10; // Par exemple, utilise MCTS pour la fin de partie
  }

  // Fonction de détection et d'application des tables de fin de partie
  private useEndgameTablebase(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    if (board.getPieceCount() <= 4) {
      // Condition pour appliquer les tables de fin de partie
      return getEndgameMove(board, this.color); // Utilise une table de fin de partie externe
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

  // Méthode pour trouver le mouvement d'ouverture

  private getOpeningMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const boardHash = this.getBoardHash(board);

    if (this.openingMoves[boardHash]) {
      // Sélectionne le premier coup suggéré par défaut
      const move = this.openingMoves[boardHash][0];
      const flippedMove = flipMove(move, this.color === PieceColor.BLACK);

      // Évalue la position après le coup d'ouverture
      board.movePiece(
        flippedMove.fromX,
        flippedMove.fromY,
        flippedMove.toX,
        flippedMove.toY,
      );
      const evaluation = evaluateBoard(board, this.color);
      board.setPiece(
        flippedMove.fromX,
        flippedMove.fromY,
        board.getPiece(flippedMove.toX, flippedMove.toY),
      );
      board.setPiece(flippedMove.toX, flippedMove.toY, null);

      // Seuil pour sortir du livre d'ouvertures si la position est défavorable
      const exitThreshold = -0.5;
      if (evaluation > exitThreshold) {
        return flippedMove; // Choisit le coup d'ouverture par défaut si l'évaluation est favorable
      }
    }

    return null; // Sort du livre si aucune ouverture valide n'est trouvée ou si l'évaluation est inférieure au seuil
  }

  // Génération d'un identifiant de position simplifié pour le dictionnaire d'ouverture
  private getBoardHash(board: Board): string {
    let hash = '';
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);
        if (piece) {
          const pieceCode =
            piece.color === PieceColor.WHITE
              ? piece.type
              : piece.type.toLowerCase();
          hash += pieceCode + x + y + ' ';
        }
      }
    }
    return hash.trim();
  }
}
