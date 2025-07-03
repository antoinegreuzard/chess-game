import { Board } from './board';
import { Piece, PieceColor } from './piece';

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly tileSize: number;
  private get flipBoard(): boolean {
    return this.playerColor === PieceColor.BLACK;
  }
  private draggingPiece: Piece | null = null;
  private startX: number | null = null;
  private startY: number | null = null;
  private highlightedMoves: { x: number; y: number }[] = [];
  private kingInCheckPosition: { x: number; y: number } | null = null;

  constructor(
    private readonly board: Board,
    canvasId: string,
    private readonly moveHandler: (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
    ) => Promise<boolean>,
    private readonly playerColor: PieceColor
  ) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Canvas with id ${canvasId} not found`);
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!this.context)
      throw new Error(`Canvas context could not be initialized`);
    this.tileSize = this.canvas.width / 8;

    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private getCoordinates(x: number, y: number): { x: number; y: number } {
    return this.flipBoard ? { x: 7 - x, y: 7 - y } : { x, y };
  }

  // Animation pour déplacer une pièce
  public animateMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    piece: Piece,
  ): void {
    const frames = 10;
    let currentFrame = 0;

    const { x: startX, y: startY } = this.getCoordinates(fromX, fromY);
    const { x: endX, y: endY } = this.getCoordinates(toX, toY);
    const deltaX = ((endX - startX) * this.tileSize) / frames;
    const deltaY = ((endY - startY) * this.tileSize) / frames;

    const animate = () => {
      if (currentFrame <= frames) {
        this.drawBoard();
        this.context.fillStyle =
          piece.color === PieceColor.WHITE ? 'white' : 'black';
        this.context.font = '48px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';

        this.context.fillText(
          this.getPieceText(piece),
          startX * this.tileSize + deltaX * currentFrame + this.tileSize / 2,
          startY * this.tileSize + deltaY * currentFrame + this.tileSize / 2,
        );

        currentFrame++;
        requestAnimationFrame(animate);
      } else {
        this.drawBoard();
      }
    };

    animate();
  }

  // Surligne les mouvements valides
  highlightValidMoves(moves: { x: number; y: number }[]): void {
    this.context.fillStyle = 'rgba(0, 255, 0, 0.5)';
    moves.forEach((move) => {
      const { x, y } = this.getCoordinates(move.x, move.y);
      this.context.fillRect(
        x * this.tileSize,
        y * this.tileSize,
        this.tileSize,
        this.tileSize,
      );
    });
  }

  // Dessiner l'échiquier et les pièces
  public drawBoard(): void {
    const kingInCheck = this.board.getKingInCheck();
    this.kingInCheckPosition = kingInCheck
      ? this.getCoordinates(kingInCheck.x, kingInCheck.y)
      : null;
    this.drawTiles();
    this.drawPieces();
  }

  // Dessiner les cases de l'échiquier
  private drawTiles(): void {
    const letters = 'abcdefgh';

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const { x: newX, y: newY } = this.getCoordinates(x, y);
        const isDarkTile = (x + y) % 2 === 1;
        let tileColor = isDarkTile ? '#769656' : '#eeeed2';

        // Vérification de la position du roi en échec après conversion
        if (
          this.kingInCheckPosition &&
          this.kingInCheckPosition.x === newX &&
          this.kingInCheckPosition.y === newY
        ) {
          tileColor = '#ff6347';
        }

        this.context.fillStyle = tileColor;
        this.context.fillRect(
          newX * this.tileSize,
          newY * this.tileSize,
          this.tileSize,
          this.tileSize,
        );
      }
    }

    // Dessiner les indicateurs a-h et 1-8
    this.context.font = '16px Arial';
    this.context.fillStyle = 'black';
    for (let i = 0; i < 8; i++) {
      // Afficher les lettres a-h en bas
      const letterX =
        this.getCoordinates(i, 0).x * this.tileSize + this.tileSize / 2;
      const letterY = this.canvas.height - 5;
      this.context.textAlign = 'center';
      this.context.fillText(letters[i], letterX, letterY);

      // Afficher les numéros 1-8 sur le côté
      const numberX = 5;
      const numberY =
        this.getCoordinates(0, i).y * this.tileSize + this.tileSize / 2;
      this.context.textBaseline = 'middle';
      this.context.fillText(`${8 - i}`, numberX, numberY);
    }
  }

  // Dessiner toutes les pièces sur l'échiquier
  private drawPieces(): void {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.board.getPiece(x, y);
        if (piece) {
          const { x: newX, y: newY } = this.getCoordinates(x, y);
          this.drawPiece(piece, newX, newY);
        }
      }
    }
  }

  // Dessiner une pièce spécifique
  private drawPiece(piece: Piece, x: number, y: number): void {
    this.context.fillStyle = piece.color === 'white' ? 'white' : 'black';
    this.context.font = '48px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    const pieceText = this.getPieceText(piece);
    this.context.fillText(
      pieceText,
      x * this.tileSize + this.tileSize / 2,
      y * this.tileSize + this.tileSize / 2,
    );
  }

  // Convertir le type de pièce en texte pour affichage
  private getPieceText(piece: Piece): string {
    switch (piece.type) {
      case 'pawn':
        return piece.color === 'white' ? '♙' : '♟';
      case 'rook':
        return piece.color === 'white' ? '♖' : '♜';
      case 'knight':
        return piece.color === 'white' ? '♘' : '♞';
      case 'bishop':
        return piece.color === 'white' ? '♗' : '♝';
      case 'queen':
        return piece.color === 'white' ? '♕' : '♛';
      case 'king':
        return piece.color === 'white' ? '♔' : '♚';
      default:
        return '';
    }
  }

  // Gestion de début du glissement
  private handleMouseDown(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

    const boardX = this.flipBoard ? 7 - x : x;
    const boardY = this.flipBoard ? 7 - y : y;

    const piece = this.board.getPiece(boardX, boardY);
    if (piece && piece.color === this.playerColor) {
      this.draggingPiece = piece;
      this.startX = boardX;
      this.startY = boardY;
      this.canvas.style.cursor = 'grabbing';

      this.highlightedMoves = this.board.getValidMoves(boardX, boardY);
      this.drawBoard();
      this.highlightValidMoves(this.highlightedMoves);
    } else {
      this.draggingPiece = null;
    }
  }

  // Gestion du mouvement pendant le glissement
  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

    let piece = null;
    if (this.board.isWithinBounds(x, y))
      piece = this.board.getPiece(x, y);

    this.canvas.style.cursor =
      piece && piece.color === this.playerColor && !this.draggingPiece
        ? 'pointer'
        : 'default';    

    if (!this.draggingPiece) return;

    this.drawBoard();
    this.highlightValidMoves(this.highlightedMoves);

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    this.context.fillStyle =
      this.draggingPiece.color === 'white' ? 'white' : 'black';
    this.context.font = '48px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    const pieceText = this.getPieceText(this.draggingPiece);
    this.context.fillText(pieceText, mouseX, mouseY);
  }

  // Gestion de la fin du glissement
  private async handleMouseUp(event: MouseEvent): Promise<void> {
    if (!this.draggingPiece || this.startX === null || this.startY === null)
      return;

    const rect = this.canvas.getBoundingClientRect();
    const rawX = Math.floor((event.clientX - rect.left) / this.tileSize);
    const rawY = Math.floor((event.clientY - rect.top) / this.tileSize);

    const fromX = this.startX;
    const fromY = this.startY;
    const toX = this.flipBoard ? 7 - rawX : rawX;
    const toY = this.flipBoard ? 7 - rawY : rawY;

    this.draggingPiece = null;
    this.startX = null;
    this.startY = null;
    this.canvas.style.cursor = 'default';

    await this.moveHandler(fromX, fromY, toX, toY);
    this.highlightedMoves = [];

    this.drawBoard();
  }
}
