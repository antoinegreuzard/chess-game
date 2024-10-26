// src/canvas-renderer.ts
import {Board} from './board';
import {Piece, PieceColor} from './piece';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private readonly tileSize: number;
  private selectedPiece: { x: number; y: number } | null = null;

  constructor(private board: Board, canvasId: string, private moveHandler: (fromX: number, fromY: number, toX: number, toY: number) => void) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d')!;
    this.tileSize = this.canvas.width / 8;

    // Ajouter un écouteur pour gérer les clics de la souris
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
  }

  // Dessiner l'échiquier et les pièces
  public drawBoard(): void {
    this.drawTiles();
    this.drawPieces();
  }

  // Dessiner les cases de l'échiquier
  private drawTiles(): void {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const isDarkTile = (x + y) % 2 === 1;
        this.context.fillStyle = isDarkTile ? '#769656' : '#eeeed2';
        this.context.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
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
    this.context.fillText(pieceText, x * this.tileSize + this.tileSize / 2, y * this.tileSize + this.tileSize / 2);
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

  // Animation pour déplacer une pièce
  private animateMove(fromX: number, fromY: number, toX: number, toY: number, piece: Piece): void {
    const frames = 10;
    let currentFrame = 0;

    const startX = fromX * this.tileSize;
    const startY = fromY * this.tileSize;
    const deltaX = ((toX - fromX) * this.tileSize) / frames;
    const deltaY = ((toY - fromY) * this.tileSize) / frames;

    const animate = () => {
      if (currentFrame <= frames) {
        this.drawBoard();
        this.context.fillStyle = piece.color === PieceColor.WHITE ? 'white' : 'black';
        this.context.font = '48px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';

        // Dessiner la pièce en mouvement
        this.context.fillText(
          this.getPieceText(piece),
          startX + deltaX * currentFrame + this.tileSize / 2,
          startY + deltaY * currentFrame + this.tileSize / 2
        );

        currentFrame++;
        requestAnimationFrame(animate);
      } else {
        // Redessiner la grille finale
        this.drawBoard();
      }
    };

    animate();
  }

  // Gérer les clics sur le canevas pour déplacer les pièces
  private handleCanvasClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

    if (this.selectedPiece) {
      // Si une pièce est déjà sélectionnée, tente de la déplacer
      const fromX = this.selectedPiece.x;
      const fromY = this.selectedPiece.y;

      // Utilise la fonction de rappel `moveHandler` pour déplacer la pièce
      this.moveHandler(fromX, fromY, x, y);

      this.selectedPiece = null;
    } else {
      // Sélectionne une nouvelle pièce
      this.selectedPiece = {x, y};
    }
  }
}
