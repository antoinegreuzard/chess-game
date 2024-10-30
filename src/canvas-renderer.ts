// src/canvas-renderer.ts
import { Board } from './board';
import { Piece, PieceColor } from './piece';

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly tileSize: number;
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
    ) => boolean, // Utilisation d'un retour booléen pour vérifier si le mouvement est valide
  ) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d')!;
    this.tileSize = this.canvas.width / 8;

    // Définir le curseur par défaut
    this.canvas.style.cursor = 'default';

    // Ajouter des écouteurs pour gérer les événements de glisser-déposer
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
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

    const startX = fromX * this.tileSize;
    const startY = fromY * this.tileSize;
    const deltaX = ((toX - fromX) * this.tileSize) / frames;
    const deltaY = ((toY - fromY) * this.tileSize) / frames;

    const animate = () => {
      if (currentFrame <= frames) {
        // Redessine l'échiquier pour effacer l'ancienne position de la pièce
        this.drawBoard();

        this.context.fillStyle =
          piece.color === PieceColor.WHITE ? 'white' : 'black';
        this.context.font = '48px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';

        // Dessine la pièce en mouvement
        this.context.fillText(
          this.getPieceText(piece),
          startX + deltaX * currentFrame + this.tileSize / 2,
          startY + deltaY * currentFrame + this.tileSize / 2,
        );

        currentFrame++;
        requestAnimationFrame(animate);
      } else {
        // Redessiner l'échiquier à la fin de l'animation pour afficher la pièce à la position finale
        this.drawBoard();
      }
    };

    animate();
  }

  // Surligne les mouvements valides pour une pièce sélectionnée
  highlightValidMoves(moves: { x: number; y: number }[]): void {
    this.context.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Couleur de surlignage (vert translucide)
    moves.forEach((move) => {
      this.context.fillRect(
        move.x * this.tileSize,
        move.y * this.tileSize,
        this.tileSize,
        this.tileSize,
      );
    });
  }

  // Dessiner l'échiquier et les pièces
  public drawBoard(): void {
    // Obtenir la position du roi en échec si elle existe
    const kingInCheck = this.board.getKingInCheck();
    this.kingInCheckPosition = kingInCheck
      ? { x: kingInCheck.x, y: kingInCheck.y }
      : null;

    // Dessiner le plateau
    this.drawTiles();
    this.drawPieces();
  }

  // Dessiner les cases de l'échiquier
  private drawTiles(): void {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const isDarkTile = (x + y) % 2 === 1;
        let tileColor = isDarkTile ? '#769656' : '#eeeed2';

        // Si la case contient le roi en échec, change la couleur
        if (
          this.kingInCheckPosition &&
          this.kingInCheckPosition.x === x &&
          this.kingInCheckPosition.y === y
        ) {
          tileColor = '#ff6347'; // Par exemple, une couleur rouge pour indiquer l'échec
        }

        this.context.fillStyle = tileColor;
        this.context.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize,
        );
      }
    }
  }

  // Dessiner toutes les pièces sur l'échiquier
  private drawPieces(): void {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.board.getPiece(x, y);
        if (piece) {
          this.drawPiece(piece, x, y);
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

  // Gérer le début du glissement
  private handleMouseDown(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

    const piece = this.board.getPiece(x, y);
    if (piece) {
      this.draggingPiece = piece;
      this.startX = x;
      this.startY = y;
      this.canvas.style.cursor = 'grabbing'; // Change le curseur pendant le drag

      // Obtenez les mouvements légaux pour la pièce sélectionnée
      this.highlightedMoves = this.board.getValidMoves(x, y);

      // Redessinez le plateau avec les cases surlignées
      this.drawBoard();
      this.highlightValidMoves(this.highlightedMoves); // Surligne les mouvements valides
    }
  }

  // Gérer le mouvement pendant le glissement
  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

    // Changer le curseur lorsque la souris survole une pièce
    let piece = null;
    if (this.board.isWithinBounds(x, y)) piece = this.board.getPiece(x, y);
    if (piece && !this.draggingPiece) {
      this.canvas.style.cursor = 'pointer';
    } else if (!this.draggingPiece) {
      this.canvas.style.cursor = 'default';
    }

    if (!this.draggingPiece) return;

    // Dessiner l'échiquier et les pièces
    this.drawBoard();

    // Assurez-vous que les mouvements valides restent visibles pendant le glissement
    this.highlightValidMoves(this.highlightedMoves);

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Dessiner la pièce en mouvement
    this.context.fillStyle =
      this.draggingPiece.color === 'white' ? 'white' : 'black';
    this.context.font = '48px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    const pieceText = this.getPieceText(this.draggingPiece);
    this.context.fillText(pieceText, mouseX, mouseY);
  }

  // Gérer la fin du glissement
  private handleMouseUp(event: MouseEvent): void {
    if (!this.draggingPiece || this.startX === null || this.startY === null)
      return;

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

    // Utilise la fonction de rappel `moveHandler` pour déplacer la pièce
    const moveSuccessful = this.moveHandler(this.startX, this.startY, x, y);

    // Réinitialise l'état de glissement
    this.draggingPiece = null;
    this.startX = null;
    this.startY = null;
    this.canvas.style.cursor = 'default'; // Rétablir le curseur par défaut

    // Efface les coups surlignés
    this.highlightedMoves = [];

    // Redessine le plateau après la fin du glissement
    this.drawBoard();

    // Si le mouvement est réussi, met à jour le tour
    if (moveSuccessful) {
      this.drawBoard();
    }
  }
}
