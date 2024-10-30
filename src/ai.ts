// src/ai.ts
import { Board } from './board';
import { Piece } from './piece';
import { evaluateBoard, centerControlBonus } from './evaluator';
import { getEndgameMove } from './endgameTablebase';
import { openingBook } from './openingBook';
import { PieceColor, PieceType } from './types';

// Classe AI utilisant l'algorithme Minimax avec Alpha-Beta Pruning et Transposition Table
export class AI {
  private openingMoves: {
    [key: string]: { fromX: number; fromY: number; toX: number; toY: number }[];
  } = openingBook;
  private transpositionTable: Map<string, number>; // Table de transposition
  private readonly maxTime: number; // Temps maximum de réflexion en millisecondes
  private startTime: number; // Temps de début pour gestion du temps
  private readonly killerMoves: Map<
    number,
    {
      move: { fromX: number; fromY: number; toX: number; toY: number };
      score: number;
    }[]
  >; // Heuristic des coups efficaces

  constructor(
    private color: PieceColor,
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
    const openingMove = this.getOpeningMove(board);
    if (openingMove) {
      return openingMove;
    }

    // Vérifie si on peut utiliser une table de fin de partie
    const endgameMove = this.useEndgameTablebase(board);
    if (endgameMove) {
      return endgameMove;
    }

    // Détermine si MCTS est pertinent pour la position actuelle
    if (this.shouldUseMCTS(board)) {
      return this.mcts(board); // Utilise MCTS pour les positions complexes ou de fin de partie
    }

    // Si MCTS n'est pas utilisé, continue avec Minimax
    let bestMove = null;
    let bestValue = -Infinity;
    const maxDepth = 10; // Augmentation de la profondeur maximale de recherche
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

        // Limite le temps de réflexion
        if (Date.now() - this.startTime > this.maxTime) {
          break;
        }
      }

      // Limite le temps de réflexion
      if (Date.now() - this.startTime > this.maxTime) {
        break;
      }
    }

    return bestMove;
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
      return evaluateBoard(board, this.color);
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

      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);

        // Late Move Reduction : Réduit la profondeur pour les coups tardifs
        const shouldReduce = i > 3 && depth > 2;
        const newDepth = shouldReduce ? depth - 1 : depth;

        // Extension : Allonge la profondeur pour les échecs et poussées de pions
        const isCheck = board.isKingInCheck(this.color);
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
          false,
        );
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

  // Ajout d'un coup prometteur dans les killer moves
  private addKillerMove(
    depth: number,
    move: { fromX: number; fromY: number; toX: number; toY: number },
  ) {
    const killers = this.killerMoves.get(depth) || [];
    const existingMove = killers.find(
      (k) =>
        k.move.fromX === move.fromX &&
        k.move.fromY === move.fromY &&
        k.move.toX === move.toX &&
        k.move.toY === move.toY,
    );

    if (existingMove) {
      existingMove.score += 1;
    } else {
      killers.push({ move, score: 1 });
    }

    killers.sort((a, b) => b.score - a.score);
    this.killerMoves.set(depth, killers);
  }

  // Recherche de quiescence pour améliorer l'évaluation des positions
  private quiescenceSearch(
    board: Board,
    alpha: number,
    beta: number,
    depth: number = 0,
  ): number {
    const maxQuiescenceDepth = 10;

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
      const kingSafe = !board.isKingInCheck(this.color);

      if (kingSafe) {
        const score = -this.quiescenceSearch(board, -beta, -alpha, depth + 1);
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      } else {
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);
      }
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
      const killerMovesAtDepth = this.killerMoves.get(depth);

      if (
        killerMovesAtDepth &&
        killerMovesAtDepth.some(
          (move: {
            move: { fromX: number; fromY: number; toX: number; toY: number };
          }) => move.move.fromX === a.fromX && move.move.fromY === a.fromY,
        )
      ) {
        return -1;
      }

      const pieceA = board.getPiece(a.toX, a.toY);
      const pieceB = board.getPiece(b.toX, b.toY);

      if (pieceA && !pieceB) return -1;
      if (!pieceA && pieceB) return 1;

      const centerControlA = centerControlBonus[`${a.toX},${a.toY}`] || 0;
      const centerControlB = centerControlBonus[`${b.toX},${b.toY}`] || 0;

      return centerControlB - centerControlA;
    });
  }

  // Algorithme MCTS pour évaluer des positions complexes ou de fin de partie
  private mcts(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const iterations = 1000; // Nombre de simulations
    const moveScores: Map<string, number> = new Map();
    const validMoves = this.getAllValidMoves(board);

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
        (moveScores.get(moveKey) || 0) + simulationResult,
      );
    }

    // Vérifie si moveScores est vide avant d'utiliser reduce
    if (moveScores.size === 0) {
      return null; // Aucun mouvement valide trouvé
    }

    // Sélectionne le mouvement avec la meilleure note moyenne
    const bestMoveKey = Array.from(moveScores.entries()).reduce(
      (best, current) => {
        return current[1] > best[1] ? current : best;
      },
    )[0];

    const [fromX, fromY, toX, toY] = bestMoveKey.split(',').map(Number);
    return { fromX, fromY, toX, toY };
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
    move: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    },
    board: Board,
  ): boolean {
    // Considère les captures et les coups qui mettent en échec comme critiques
    const targetPiece = board.getPiece(move.toX, move.toY);
    return (
      (targetPiece && targetPiece.color !== piece.color) ||
      board.isKingInCheck(piece.color)
    );
  }

  // Méthode pour trouver le mouvement d'ouverture
  private getOpeningMove(
    board: Board,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const boardHash = this.getBoardHash(board);

    if (this.openingMoves[boardHash]) {
      return this.openingMoves[boardHash][0]; // Récupère le premier mouvement d'ouverture correspondant
    }

    return null; // Aucun mouvement d'ouverture trouvé
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
