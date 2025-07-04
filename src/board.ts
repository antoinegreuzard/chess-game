// src/board.ts
import { BoardInterface, Piece, PieceColor, PieceType } from './piece';
import { King } from './pieces/king';
import { updateCapturedPieces } from './utils/utils';
import { createPiece } from './utils/pieceFactory';

type BoardSquare = Piece | null;

export class Board implements BoardInterface {
  private grid: (Piece | null)[][];
  private enPassantTarget: { x: number; y: number } | null = null;
  private halfMoveCount: number = 0; // Compteur pour la règle des 50 coups
  private currentPlayer: PieceColor = PieceColor.WHITE;

  public flipBoard: boolean = false;

  constructor() {
    this.grid = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
  }

  public async init(): Promise<void> {
    this.grid = await this.initializeBoard();
  }

  public setFlipBoard(flip: boolean): void {
    this.flipBoard = flip;
  }

  private async initializeBoard(): Promise<(Piece | null)[][]> {
    const board: (Piece | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Pièces noires en haut (rangée 8 = y=0)
    board[0] = [
      await createPiece(PieceType.ROOK, PieceColor.BLACK),
      await createPiece(PieceType.KNIGHT, PieceColor.BLACK),
      await createPiece(PieceType.BISHOP, PieceColor.BLACK),
      await createPiece(PieceType.QUEEN, PieceColor.BLACK),
      await createPiece(PieceType.KING, PieceColor.BLACK),
      await createPiece(PieceType.BISHOP, PieceColor.BLACK),
      await createPiece(PieceType.KNIGHT, PieceColor.BLACK),
      await createPiece(PieceType.ROOK, PieceColor.BLACK),
    ];
    board[1] = await Promise.all(
      Array(8)
        .fill(null)
        .map(() => createPiece(PieceType.PAWN, PieceColor.BLACK)),
    );

    // Pièces blanches en bas (rangée 1 = y=7)
    board[7] = [
      await createPiece(PieceType.ROOK, PieceColor.WHITE),
      await createPiece(PieceType.KNIGHT, PieceColor.WHITE),
      await createPiece(PieceType.BISHOP, PieceColor.WHITE),
      await createPiece(PieceType.QUEEN, PieceColor.WHITE),
      await createPiece(PieceType.KING, PieceColor.WHITE),
      await createPiece(PieceType.BISHOP, PieceColor.WHITE),
      await createPiece(PieceType.KNIGHT, PieceColor.WHITE),
      await createPiece(PieceType.ROOK, PieceColor.WHITE),
    ];
    board[6] = await Promise.all(
      Array(8)
        .fill(null)
        .map(() => createPiece(PieceType.PAWN, PieceColor.WHITE)),
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

  public captureEnPassantIfValid(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): void {
    if (this.isEnPassantMove(fromX, fromY, toX, toY)) {
      const movingPawn = this.getPiece(fromX, fromY);
      if (!movingPawn) return;

      // Détermine la position du pion capturé en fonction de la couleur
      const capturedPawnY =
        toY + (movingPawn.color === PieceColor.WHITE ? -1 : 1);

      if (this.grid[capturedPawnY][toX]) {
        this.grid[capturedPawnY][toX] = null;
      }
    }
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
    isSimulation: boolean = true,
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

      // Gestion du roque pour le roi
      if (piece.type === PieceType.KING && Math.abs(toX - fromX) === 2) {
        if (this.isCastlingValid(piece, fromX, fromY, toX)) {
          this.handleCastling(toX, fromY);
          piece.hasMoved = true; // Met à jour le statut de mouvement du roi
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
      if (!isSimulation) {
        piece.hasMoved = true;
      }

      // Vérifie si le mouvement met le roi du joueur en échec
      if (this.isKingInCheck(piece.color)) {
        // Annule le mouvement si le roi est en échec
        this.grid[fromY][fromX] = piece;
        this.grid[toY][toX] = targetPiece;
        return false;
      }

      // Mise à jour de `hasMoved` pour les rois et tours
      if (piece.type === PieceType.KING || piece.type === PieceType.ROOK) {
        piece.hasMoved = true;
      }

      // Mise à jour de l'état après un mouvement valide
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

    // Vérification des conditions de roque : roi et tour n'ont pas bougé, et la tour est présente
    if (!(rook?.type === PieceType.ROOK) || rook.hasMoved || king.hasMoved)
      return false;

    // Vérifie que les cases entre le roi et la tour sont libres et non attaquées
    for (let x = fromX + direction; x !== toX + direction; x += direction) {
      if (
        this.getPiece(x, fromY) ||
        this.isSquareUnderAttack(x, fromY, king.color)
      ) {
        return false;
      }
    }

    return true;
  }

  private handleCastling(kingX: number, kingY: number): void {
    // Petit roque (roi vers la droite)
    if (kingX === 6) {
      const rook = this.getPiece(7, kingY);
      const king = this.getPiece(4, kingY);
      if (
        rook?.type === PieceType.ROOK &&
        !rook.hasMoved &&
        king?.type === PieceType.KING &&
        !king.hasMoved
      ) {
        // Déplace la tour et le roi pour le petit roque
        this.setPiece(5, kingY, rook); // Déplace la tour
        this.setPiece(7, kingY, null); // Enlève la tour de sa position initiale
        this.setPiece(6, kingY, king); // Déplace le roi vers sa nouvelle position
        this.setPiece(4, kingY, null); // Enlève le roi de sa position initiale

        // Marque le roi et la tour comme ayant bougé
        king.hasMoved = true;
        rook.hasMoved = true;
      }
    }
    // Grand roque (roi vers la gauche)
    else if (kingX === 2) {
      const rook = this.getPiece(0, kingY);
      const king = this.getPiece(4, kingY);
      if (
        rook?.type === PieceType.ROOK &&
        !rook.hasMoved &&
        king?.type === PieceType.KING &&
        !king.hasMoved
      ) {
        // Déplace la tour et le roi pour le grand roque
        this.setPiece(3, kingY, rook); // Déplace la tour
        this.setPiece(0, kingY, null); // Enlève la tour de sa position initiale
        this.setPiece(2, kingY, king); // Déplace le roi vers sa nouvelle position
        this.setPiece(4, kingY, null); // Enlève le roi de sa position initiale

        // Marque le roi et la tour comme ayant bougé
        king.hasMoved = true;
        rook.hasMoved = true;
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
    // Vérifie que la pièce est un pion et qu'il avance de deux cases
    if (
      piece?.type === PieceType.PAWN &&
      Math.abs(toY - fromY) === 2 &&
      fromX === toX
    ) {
      // Si le pion avance de deux cases, configure `enPassantTarget`
      // pour permettre une prise en passant lors du tour suivant
      this.enPassantTarget = { x: toX, y: (fromY + toY) / 2 };
    } else {
      // Réinitialise `enPassantTarget` si aucune condition de prise en passant n'est remplie
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
        // Supprime le pion capturé de la grille
        this.grid[capturedPawnY][toX] = null;

        // Initialise les données de capture
        const captureData: {
          capturedWhite: PieceType[];
          capturedBlack: PieceType[];
        } = {
          capturedWhite: [],
          capturedBlack: [],
        };

        // Met à jour les données de capture selon la couleur du pion capturé
        if (capturedPawn.color === PieceColor.WHITE) {
          captureData.capturedWhite.push(capturedPawn.type);
        } else {
          captureData.capturedBlack.push(capturedPawn.type);
        }

        // Appelle updateCapturedPieces pour mettre à jour l'interface
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
    // Vérifie si le roi de la couleur donnée est en échec
    const kingInCheck = this.isKingInCheck(color);

    // Si le roi n'est pas en échec, ce n'est pas un échec et mat
    if (!kingInCheck) {
      return false;
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

  findKing(color: PieceColor): { x: number; y: number } | null {
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
          // Utilise `isThreatenedMove` pour éviter la récursion infinie
          if (piece.type === PieceType.KING) {
            if (piece.isThreatenedMove(fromX, fromY, x, y)) {
              return true;
            }
          } else if (piece.isValidMove(fromX, fromY, x, y, this)) {
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
    await board.init();
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

  public getPieceCount(): number {
    return this.grid.flat().filter((piece) => piece !== null).length;
  }

  public setPlayerColor(color: PieceColor): void {
    this.currentPlayer = color;
  }

  public getPlayerColor(): PieceColor {
    return this.currentPlayer;
  }

  public getCurrentMovesHash(): string {
    let hash = '';

    for (let y = 0; y < 8; y++) {
      let emptyCount = 0;
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece) {
          // If there were empty squares, add their count to the hash
          if (emptyCount > 0) {
            hash += emptyCount.toString();
            emptyCount = 0;
          }
          // Use standard FEN notation for pieces
          const pieceChar = this.getPieceSymbol(piece);
          hash += pieceChar;
        } else {
          // Count empty squares
          emptyCount++;
        }
      }
      // Add any remaining empty squares in the row
      if (emptyCount > 0) hash += emptyCount.toString();
      // Add row separator, except for the last row
      if (y < 7) hash += '/';
    }

    // Append the current player's turn
    hash += ` ${this.currentPlayer === PieceColor.WHITE ? 'w' : 'b'}`;

    return hash;
  }

  private getPieceSymbol(piece: Piece): string {
    const symbolMap: { [key in PieceType]: string } = {
      [PieceType.PAWN]: 'p',
      [PieceType.ROOK]: 'r',
      [PieceType.KNIGHT]: 'n', // Use 'n' for knight to avoid confusion with king
      [PieceType.BISHOP]: 'b',
      [PieceType.QUEEN]: 'q',
      [PieceType.KING]: 'k',
    };
    // Return the symbol in uppercase for White, lowercase for Black
    return piece.color === PieceColor.WHITE
      ? symbolMap[piece.type].toUpperCase()
      : symbolMap[piece.type];
  }

  // Méthode toString pour représenter le plateau et état de jeu actuel
  public toString(): string {
    let boardString = '';

    // Inclure chaque pièce et sa position sur le plateau
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece) {
          boardString += `${piece.color[0]}${piece.type[0]}`;
        } else {
          boardString += '__'; // Place vide pour chaque case
        }
      }
    }

    // Ajouter l'état d'en passant, demi-coups, et joueur actuel
    boardString += this.enPassantTarget
      ? `e${this.enPassantTarget.x}${this.enPassantTarget.y}`
      : 'e--';
    boardString += `h${this.halfMoveCount}`;
    boardString += `p${this.currentPlayer[0]}`;

    return boardString;
  }
}
