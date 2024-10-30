import { PieceColor, PieceType } from './types';
import { createPiece } from './utils/pieceFactory';

export abstract class Piece {
  public hasMoved: boolean = false;

  protected constructor(
    public color: PieceColor,
    public type: PieceType,
  ) {}

  abstract isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: any,
  ): boolean;

  public isPathClear(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: any,
  ): boolean {
    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);
    let x = fromX + dx;
    let y = fromY + dy;
    while (x !== toX || y !== toY) {
      if (board.getPiece(x, y) !== null) return false;
      x += dx;
      y += dy;
    }
    return true;
  }

  static isKing(piece: Piece): boolean {
    return piece.type === PieceType.KING;
  }

  public canCapture(toX: number, toY: number, board: any): boolean {
    const targetPiece = board.getPiece(toX, toY);
    return !targetPiece || targetPiece.color !== this.color;
  }

  public toData(): any {
    return { color: this.color, type: this.type };
  }

  static async fromData(data: any): Promise<Piece> {
    return await createPiece(data.type, data.color);
  }
}
