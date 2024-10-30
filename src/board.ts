// src/board.ts
import { Piece } from './piece';
import { King } from './pieces/king';
import { updateCapturedPieces } from './utils/utils';
import { createPiece } from './utils/pieceFactory';
import { PieceColor, PieceType, BoardInterface } from './types';

type BoardSquare = Piece | null;

export class Board implements BoardInterface {
  private grid: BoardSquare[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  private enPassantTarget: { x: number; y: number } | null = null;
  private halfMoveCount: number = 0; // Compteur pour la règle des 50 coups

  constructor() {
    // Initialisation asynchrone de la grille avec les pièces
    this.populateBoard();
  }

  private async populateBoard() {
    this.grid = await this.initializeBoard();
  }

  public async initializeBoard(): Promise<BoardSquare[][]> {
    const board: BoardSquare[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Ajouter les pièces blanches
    board[0] = [
      await createPiece(PieceType.ROOK, PieceColor.WHITE),
      await createPiece(PieceType.KNIGHT, PieceColor.WHITE),
      await createPiece(PieceType.BISHOP, PieceColor.WHITE),
      await createPiece(PieceType.QUEEN, PieceColor.WHITE),
      await createPiece(PieceType.KING, PieceColor.WHITE),
      await createPiece(PieceType.BISHOP, PieceColor.WHITE),
      await createPiece(PieceType.KNIGHT, PieceColor.WHITE),
      await createPiece(PieceType.ROOK, PieceColor.WHITE),
    ];
    board[1] = await Promise.all(
      Array(8)
        .fill(null)
        .map(() => createPiece(PieceType.PAWN, PieceColor.WHITE)),
    );

    // Ajouter les pièces noires
    board[7] = [
      await createPiece(PieceType.ROOK, PieceColor.BLACK),
      await createPiece(PieceType.KNIGHT, PieceColor.BLACK),
      await createPiece(PieceType.BISHOP, PieceColor.BLACK),
      await createPiece(PieceType.QUEEN, PieceColor.BLACK),
      await createPiece(PieceType.KING, PieceColor.BLACK),
      await createPiece(PieceType.BISHOP, PieceColor.BLACK),
      await createPiece(PieceType.KNIGHT, PieceColor.BLACK),
      await createPiece(PieceType.ROOK, PieceColor.BLACK),
    ];
    board[6] = await Promise.all(
      Array(8)
        .fill(null)
        .map(() => createPiece(PieceType.PAWN, PieceColor.BLACK)),
    );

    return board;
  }

  // Méthode générale pour vérifier les limites
  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  public getPiece(x: number, y: number): BoardSquare {
    return this.grid[y][x];
  }

  public getValidMoves(x: number, y: number): { x: number; y: number }[] {
    let piece = null;
    if (this.isWithinBounds(x, y)) piece = this.getPiece(x, y);
    if (!piece) return [];

    const validMoves: { x: number; y: number }[] = [];

    for (let toY = 0; toY < 8; toY++) {
      for (let toX = 0; toX < 8; toX++) {
        if (piece.isValidMove(x, y, toX, toY, this)) {
          validMoves.push({ x: toX, y: toY });
        }
      }
    }

    return validMoves;
  }

  public getKingInCheck(): { x: number; y: number } | null {
    if (this.isKingInCheck(PieceColor.WHITE)) {
      return this.findKing(PieceColor.WHITE);
    } else if (this.isKingInCheck(PieceColor.BLACK)) {
      return this.findKing(PieceColor.BLACK);
    }
    return null;
  }

  public movePiece(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    if (
      !this.isWithinBounds(fromX, fromY) ||
      !this.isWithinBounds(toX, toY) ||
      ['__proto__', 'constructor', 'prototype'].includes(fromY.toString()) ||
      ['__proto__', 'constructor', 'prototype'].includes(toY.toString())
    ) {
      return false; // Mouvement invalide en dehors des limites ou clé interdite
    }

    const piece = this.getPiece(fromX, fromY);
    if (piece && piece.isValidMove(fromX, fromY, toX, toY, this)) {
      const targetPiece = this.getPiece(toX, toY);

      // Empêche de capturer le roi ennemi
      if (targetPiece && targetPiece.type === PieceType.KING) {
        return false;
      }

      // Gestion du roque
      if (Piece.isKing(piece) && Math.abs(toX - fromX) === 2) {
        if (this.isCastlingValid(piece, fromX, fromY, toX)) {
          this.handleCastling(toX, fromY);
          return true;
        } else {
          return false;
        }
      }

      // Gestion de la prise en passant
      if (
        piece?.type === PieceType.PAWN &&
        this.isEnPassantMove(fromX, fromY, toX, toY)
      ) {
        this.captureEnPassant(fromX, fromY, toX, toY); // Capture le pion en passant
      }

      // Sauvegarde l'état avant de simuler le mouvement
      this.grid[toY][toX] = piece;
      this.grid[fromY][fromX] = null;

      // Vérifie si le mouvement met le roi du joueur en échec
      if (this.isKingInCheck(piece.color)) {
        // Annule le mouvement si le roi est en échec
        this.grid[fromY][fromX] = piece;
        this.grid[toY][toX] = targetPiece;
        return false;
      }

      // Mise à jour de l'état après un mouvement valide
      if ('hasMoved' in piece) {
        (piece as any).hasMoved = true;
      }
      this.updateEnPassantTarget(fromX, fromY, toX, toY, piece);

      // Réinitialise le compteur pour la règle des 50 coups si un pion bouge ou une capture a lieu
      this.halfMoveCount =
        piece.type === PieceType.PAWN || targetPiece
          ? 0
          : this.halfMoveCount + 1;

      // Vérifie si le mouvement met l'adversaire en échec et mat
      const opponentColor =
        piece.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
      if (this.isCheckmate(opponentColor)) {
        return true; // Partie terminée
      }

      return true;
    }

    return false; // Mouvement invalide
  }

  private isCastlingValid(
    king: King,
    fromX: number,
    fromY: number,
    toX: number,
  ): boolean {
    const direction = toX > fromX ? 1 : -1;
    const rookX = toX > fromX ? 7 : 0;
    const rook = this.getPiece(rookX, fromY);

    if (!(rook?.type === PieceType.ROOK) || rook.hasMoved || king.hasMoved)
      return false;

    // Vérifie que les cases entre le roi et la tour sont libres
    for (let x = fromX + direction; x !== toX; x += direction) {
      if (
        this.getPiece(x, fromY) ||
        this.isSquareUnderAttack(x, fromY, king.color)
      ) {
        return false;
      }
    }

    return (
      !this.isSquareUnderAttack(fromX, fromY, king.color) &&
      !this.isSquareUnderAttack(toX, fromY, king.color)
    );
  }

  private handleCastling(kingX: number, kingY: number): void {
    // Déplacement pour le petit roque (roi se déplace vers la droite)
    if (kingX === 6) {
      const rook = this.getPiece(7, kingY);
      if (rook?.type === PieceType.ROOK) {
        this.movePiece(7, kingY, 5, kingY);
      }
    }
    // Déplacement pour le grand roque (roi se déplace vers la gauche)
    else if (kingX === 2) {
      const rook = this.getPiece(0, kingY);
      if (rook?.type === PieceType.ROOK) {
        this.movePiece(0, kingY, 3, kingY);
      }
    }
  }

  public updateEnPassantTarget(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    piece: Piece,
  ): void {
    if (
      piece?.type === PieceType.PAWN &&
      Math.abs(toY - fromY) === 2 &&
      fromX === toX
    ) {
      // Si le pion avance de deux cases, configure la cible pour la prise en passant
      this.enPassantTarget = { x: toX, y: (fromY + toY) / 2 };
    } else {
      this.enPassantTarget = null;
    }
  }

  public captureEnPassant(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): { capturedWhite: PieceType[]; capturedBlack: PieceType[] } | null {
    const piece = this.getPiece(fromX, fromY);

    if (
      this.isEnPassantMove(fromX, fromY, toX, toY) &&
      piece?.type === PieceType.PAWN
    ) {
      const direction = piece.color === PieceColor.WHITE ? -1 : 1;
      const capturedPawnY = toY + direction;
      const capturedPawn = this.getPiece(toX, capturedPawnY);

      if (capturedPawn && capturedPawn.type === PieceType.PAWN) {
        this.grid[capturedPawnY][toX] = null;

        // Déclare explicitement le type de captureData pour éviter l'erreur
        const captureData: {
          capturedWhite: PieceType[];
          capturedBlack: PieceType[];
        } = {
          capturedWhite: [],
          capturedBlack: [],
        };

        if (capturedPawn.color === PieceColor.WHITE) {
          captureData.capturedWhite.push(capturedPawn.type);
        } else {
          captureData.capturedBlack.push(capturedPawn.type);
        }

        // Appelle updateCapturedPieces pour mettre à jour le DOM
        updateCapturedPieces(capturedPawn.type, capturedPawn.color);

        return captureData;
      }
    }
    return null;
  }

  public isEnPassantMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    if (!this.enPassantTarget) return false;

    // Vérifie que le mouvement cible la bonne case pour la prise en passant
    const piece = this.getPiece(fromX, fromY);
    return (
      piece?.type === PieceType.PAWN &&
      toX === this.enPassantTarget.x &&
      toY === this.enPassantTarget.y &&
      Math.abs(fromX - toX) === 1 &&
      Math.abs(fromY - toY) === 1
    );
  }

  public async promotePawn(
    x: number,
    y: number,
    pieceType: string,
  ): Promise<void> {
    const color = this.getPiece(x, y)?.color;

    if (!color) return;

    switch (pieceType) {
      case 'queen':
        this.grid[y][x] = await createPiece(PieceType.QUEEN, color);
        break;
      case 'rook':
        this.grid[y][x] = await createPiece(PieceType.ROOK, color);
        break;
      case 'bishop':
        this.grid[y][x] = await createPiece(PieceType.BISHOP, color);
        break;
      case 'knight':
        this.grid[y][x] = await createPiece(PieceType.KNIGHT, color);
        break;
    }
  }

  public isKingInCheck(color: PieceColor): boolean {
    const kingPosition = this.findKing(color);
    if (!kingPosition) {
      return false;
    }

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color !== color) {
          if (piece.isValidMove(x, y, kingPosition.x, kingPosition.y, this)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public isCheckmate(color: PieceColor): boolean {
    if (!this.isKingInCheck(color)) {
      return false; // Pas de mat si le roi n'est pas en échec
    }

    // Parcourt chaque pièce de la couleur donnée pour trouver un mouvement légal
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color === color) {
          const moves = this.getValidMoves(x, y);

          for (const move of moves) {
            // Simule le mouvement
            const originalPiece = this.getPiece(move.x, move.y);
            this.grid[move.y][move.x] = piece;
            this.grid[y][x] = null;

            const kingSafe = !this.isKingInCheck(color);

            // Annule le mouvement simulé
            this.grid[y][x] = piece;
            this.grid[move.y][move.x] = originalPiece;

            if (kingSafe) {
              return false; // Un mouvement légal existe pour sortir de l'échec
            }
          }
        }
      }
    }

    return true; // Aucun mouvement possible, échec et mat
  }

  public isStalemate(color: PieceColor): boolean {
    // Pat uniquement si le roi n'est pas en échec et qu'il n'y a aucun coup légal disponible
    if (this.isKingInCheck(color)) return false;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color === color) {
          for (let toY = 0; toY < 8; toY++) {
            for (let toX = 0; toX < 8; toX++) {
              if (piece.isValidMove(x, y, toX, toY, this)) {
                // Simuler le mouvement pour vérifier l'échec potentiel
                const originalPiece = this.getPiece(toX, toY);
                this.grid[toY][toX] = piece;
                this.grid[y][x] = null;

                const isKingSafe = !this.isKingInCheck(color);

                // Annuler le mouvement simulé
                this.grid[y][x] = piece;
                this.grid[toY][toX] = originalPiece;

                if (isKingSafe) return false; // Mouvement valide trouvé, pas de pat
              }
            }
          }
        }
      }
    }
    return true; // Aucun coup légal trouvé, pat détecté
  }

  private findKing(color: PieceColor): { x: number; y: number } | null {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece?.type === PieceType.KING && piece.color === color) {
          return { x, y };
        }
      }
    }
    return null;
  }

  public isKing(x: number, y: number): boolean {
    const piece = this.getPiece(x, y);
    return piece?.type === PieceType.KING;
  }

  public isSquareUnderAttack(x: number, y: number, color: PieceColor): boolean {
    for (let fromY = 0; fromY < 8; fromY++) {
      for (let fromX = 0; fromX < 8; fromX++) {
        const piece = this.getPiece(fromX, fromY);
        if (piece && piece.color !== color) {
          if (piece.isValidMove(fromX, fromY, x, y, this)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Vérifie le matériel insuffisant pour un échec et mat
  public isInsufficientMaterial(): boolean {
    const pieces = this.grid.flat().filter((piece) => piece !== null);

    // Cas les plus courants de matériel insuffisant
    if (pieces.length <= 2) return true; // Seulement les rois sur le plateau
    return (
      pieces.length === 3 &&
      pieces.some(
        (piece) =>
          piece?.type === PieceType.BISHOP || piece?.type === PieceType.KNIGHT,
      )
    );
  }

  // Vérifie si la règle des 50 coups est remplie
  public isFiftyMoveRule(): boolean {
    return this.halfMoveCount >= 50;
  }

  public setPiece(x: number, y: number, piece: Piece | null): void {
    this.grid[y][x] = piece;
  }

  // Vérifie si un mouvement est valide
  public isMoveValid(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ): boolean {
    const piece = this.getPiece(fromRow, fromCol);

    // Si aucune pièce n'est présente à l'emplacement source, le mouvement est invalide
    if (!piece) {
      return false;
    }

    // Si la destination est en dehors de l'échiquier, mouvement invalide
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
      return false;
    }

    // Vérifie si la pièce peut se déplacer à cette destination en utilisant la logique de mouvement de la pièce
    if (!piece.isValidMove(fromRow, fromCol, toRow, toCol, this)) {
      return false;
    }

    // Vérifie s'il y a une pièce à la destination et si elle est de la même couleur
    const destinationPiece = this.getPiece(toRow, toCol);
    return !(destinationPiece && destinationPiece.color === piece.color);
  }

  public isCapture(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    const piece = this.isWithinBounds(fromX, fromY)
      ? this.getPiece(fromX, fromY)
      : null;
    const targetPiece = this.isWithinBounds(toX, toY)
      ? this.getPiece(toX, toY)
      : null;

    // Vérifie qu'il y a une pièce à la position cible et qu'elle est d'une couleur opposée
    return (
      piece !== null &&
      targetPiece !== null &&
      piece.color !== targetPiece.color
    );
  }

  public static async fromData(data: any): Promise<Board> {
    const board = new Board();
    await board.initializeBoard();
    board.grid = await Promise.all(
      data.grid.map(async (row: any[]) =>
        Promise.all(
          row.map(async (pieceData) =>
            pieceData ? await Piece.fromData(pieceData) : null,
          ),
        ),
      ),
    );
    return board;
  }

  public toData(): any {
    return {
      grid: this.grid.map((row) =>
        row.map((piece) => (piece ? piece.toData() : null)),
      ),
    };
  }

  public isAdjacentToAnotherKing(
    x: number,
    y: number,
    color: PieceColor,
  ): boolean {
    const kingPositions = [
      { dx: -1, dy: -1 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: 1 },
    ];

    for (const { dx, dy } of kingPositions) {
      const nx = x + dx;
      const ny = y + dy;
      const piece = this.isWithinBounds(nx, ny) ? this.getPiece(nx, ny) : null;
      if (piece?.type === PieceType.KING && piece.color !== color) {
        return true;
      }
    }
    return false;
  }

  public clone(): Board {
    const clonedBoard = new Board();
    clonedBoard.grid = this.grid.map((row) =>
      row.map((piece) =>
        piece
          ? Object.create(
              Object.getPrototypeOf(piece),
              Object.getOwnPropertyDescriptors(piece),
            )
          : null,
      ),
    );
    clonedBoard.enPassantTarget = this.enPassantTarget
      ? { ...this.enPassantTarget }
      : null;
    clonedBoard.halfMoveCount = this.halfMoveCount;
    return clonedBoard;
  }

  public getPieceCount(): number {
    return this.grid.flat().filter((piece) => piece !== null).length;
  }

  public isGameOver(): boolean {
    // Vérifie l'échec et mat pour chaque couleur
    if (
      this.isCheckmate(PieceColor.WHITE) ||
      this.isCheckmate(PieceColor.BLACK)
    ) {
      return true;
    }

    // Vérifie le pat pour chaque couleur
    if (
      this.isStalemate(PieceColor.WHITE) ||
      this.isStalemate(PieceColor.BLACK)
    ) {
      return true;
    }

    // Vérifie le matériel insuffisant pour chaque couleur
    if (this.isInsufficientMaterial()) {
      return true;
    }

    // Vérifie si la règle des 50 coups est atteinte
    return this.isFiftyMoveRule();
  }

  public getWinner(): PieceColor | null {
    // Si c'est un échec et mat pour les Noirs, Blancs gagnent
    if (this.isCheckmate(PieceColor.BLACK)) {
      return PieceColor.WHITE;
    }

    // Si c'est un échec et mat pour les Blancs, Noirs gagnent
    if (this.isCheckmate(PieceColor.WHITE)) {
      return PieceColor.BLACK;
    }

    // Si c'est un pat, une égalité par matériel insuffisant, ou la règle des 50 coups, la partie est nulle
    if (
      this.isStalemate(PieceColor.WHITE) ||
      this.isStalemate(PieceColor.BLACK) ||
      this.isInsufficientMaterial() ||
      this.isFiftyMoveRule()
    ) {
      return null;
    }

    return null; // Retourne null si le jeu n'est pas encore terminé
  }

  public getPieces(): Piece[] {
    return this.grid.flat().filter((piece): piece is Piece => piece !== null);
  }
}
