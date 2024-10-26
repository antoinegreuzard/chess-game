// src/canvas-renderer.ts
import {Board} from './board';
import {Piece, PieceColor} from './piece';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private tileSize: number;
  private selectedPiece: { x: number; y: number } | null = null;

  constructor(private board: Board, canvasId: string) {
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

  // Dessiner les pièces sur l'échiquier
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
    const pieceText = this.getPieceText(piece);
    this.context.fillStyle = piece.color === PieceColor.WHITE ? 'white' : 'black';
    this.context.font = '48px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(pieceText, x * this.tileSize + this.tileSize / 2, y * this.tileSize + this.tileSize / 2);
  }

  // Déterminer le symbole texte pour chaque pièce
  private getPieceText(piece: Piece): string {
    switch (piece.type) {
      case 'pawn':
        return '♙';
      case 'rook':
        return '♖';
      case 'knight':
        return '♘';
      case 'bishop':
        return '♗';
      case 'queen':
        return '♕';
      case 'king':
        return '♔';
      default:
        return '';
    }
  }

  // Gérer les clics sur le canevas pour déplacer les pièces
  private handleCanvasClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

    if (this.selectedPiece) {
      // Déplacer la pièce sélectionnée vers la nouvelle position
      this.board.movePiece(this.selectedPiece.x, this.selectedPiece.y, x, y);
      this.selectedPiece = null;
    } else {
      // Sélectionner une pièce
      this.selectedPiece = {x, y};
    }

    // Redessiner l'échiquier après chaque action
    this.drawBoard();
  }
}
