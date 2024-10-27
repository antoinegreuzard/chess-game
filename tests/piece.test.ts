import { Board } from '../src/board';
import { Piece, PieceColor, PieceType } from '../src/piece';

// Classe concrète pour tester la classe abstraite Piece
class TestPiece extends Piece {
  constructor(color: PieceColor) {
    super(color, PieceType.ROOK); // Utilise un type quelconque pour les tests, ici ROOK
  }

  // Implémentation fictive de isValidMove juste pour le test
  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: Board,
  ): boolean {
    return true; // Ne pas vérifier les mouvements dans ces tests
  }
}

describe('Piece Class Tests', () => {
  let board: Board;

  beforeEach(() => {
    // Crée un échiquier vide avant chaque test
    board = new Board();
  });

  test('isPathClear should return true if the path is clear', () => {
    const piece = new TestPiece(PieceColor.WHITE);

    // Remplace par des tests valides pour le chemin dégagé
    // Chemin vertical dégagé
    board.setPiece(0, 1, null); // Assure qu'il n'y a pas de pièces bloquantes
    board.setPiece(0, 2, null);
    board.setPiece(0, 3, null);
    expect(piece.isPathClear(0, 0, 0, 4, board)).toBe(true);

    // Chemin diagonal dégagé
    board.setPiece(2, 2, null); // Assure qu'il n'y a pas de pièces bloquantes
    board.setPiece(3, 3, null);
    expect(piece.isPathClear(1, 1, 4, 4, board)).toBe(true);
  });

  test('isPathClear should return false if the path is not clear', () => {
    const piece = new TestPiece(PieceColor.WHITE);

    // Ajoute une pièce pour bloquer le chemin vertical
    board.setPiece(0, 2, new TestPiece(PieceColor.BLACK));

    // Test avec un chemin bloqué
    expect(piece.isPathClear(0, 0, 0, 4, board)).toBe(false);

    // Ajoute une pièce pour bloquer le chemin diagonal
    board.setPiece(2, 2, new TestPiece(PieceColor.BLACK));
    expect(piece.isPathClear(1, 1, 4, 4, board)).toBe(false);
  });

  test('canCapture should return true if the target can be captured', () => {
    const piece = new TestPiece(PieceColor.WHITE);

    // Ajoute une pièce noire pour être capturée
    board.setPiece(3, 3, new TestPiece(PieceColor.BLACK));
    expect(piece.canCapture(3, 3, board)).toBe(true);

    // Test sur une case vide (peut "capturer" une case vide)
    expect(piece.canCapture(4, 4, board)).toBe(true);
  });

  test('canCapture should return false if the target cannot be captured', () => {
    const piece = new TestPiece(PieceColor.WHITE);

    // Ajoute une pièce blanche (ne peut pas capturer sa propre couleur)
    board.setPiece(2, 2, new TestPiece(PieceColor.WHITE));
    expect(piece.canCapture(2, 2, board)).toBe(false);
  });
});
