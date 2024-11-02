import { OpeningBook } from '../src/ai/openingBook';

describe('OpeningBook', () => {
  it('devrait retourner un mouvement valide pour une ouverture connue', () => {
    const positionKey = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w'; // Position de départ
    const move = OpeningBook.getOpeningMove(positionKey);

    expect(move).not.toBeNull();
    expect([
      { fromX: 1, fromY: 7, toX: 3, toY: 7 },
      { fromX: 6, fromY: 7, toX: 5, toY: 5 },
    ]).toContainEqual(move); // Vérifie si le mouvement retourné est dans les options possibles
  });

  it('devrait retourner un autre mouvement pour une autre position connue', () => {
    const positionKey = 'rnbqkbnr/pppppppp/8/8/8/8/PP1PPPPP/RNBQKBNR w'; // Position correspondant à Alekhine's Defense
    const move = OpeningBook.getOpeningMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 4, fromY: 7, toX: 4, toY: 5 });
  });

  it('devrait retourner null pour une position non définie', () => {
    const positionKey = 'positionInconnue'; // Clé non définie
    const move = OpeningBook.getOpeningMove(positionKey);

    expect(move).toBeNull();
  });

  it('devrait retourner un mouvement inversé pour les Noirs', () => {
    const positionKey = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w';
    const move = OpeningBook.getOpeningMove(positionKey);

    // Vérifiez que le mouvement n'est pas nul avant de procéder à l'inversion
    expect(move).not.toBeNull();

    // Inverse le mouvement pour simuler le même mouvement pour les Noirs
    const flippedMove = {
      fromX: 7 - move!.fromX,
      fromY: 7 - move!.fromY,
      toX: 7 - move!.toX,
      toY: 7 - move!.toY,
    };

    expect([
      { fromX: 6, fromY: 0, toX: 4, toY: 0 },
      { fromX: 1, fromY: 0, toX: 2, toY: 2 },
    ]).toContainEqual(flippedMove); // Vérifie si le mouvement inversé est dans les options possibles pour les Noirs
  });
});
