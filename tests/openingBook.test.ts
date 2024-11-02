// ai/openingBook.test.ts
import { OpeningBook } from '../src/ai/openingBook';

describe('OpeningBook', () => {
  it('devrait retourner le bon mouvement pour une ouverture connue', () => {
    const positionKey = 'rnbqkbnrpppppppp888888ppppppppRNBQKBNR'; // Position de départ
    const move = OpeningBook.getOpeningMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 1, fromY: 7, toX: 3, toY: 7 });
  });

  it('devrait retourner un autre mouvement pour une autre position connue', () => {
    const positionKey = 'rnbqkbnrpppppppp888888pPPPPpppRNBQKBNR'; // Gambit Dame
    const move = OpeningBook.getOpeningMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 5, fromY: 6, toX: 5, toY: 4 });
  });

  it('devrait retourner null pour une position non définie', () => {
    const positionKey = 'positionInconnue'; // Clé non définie
    const move = OpeningBook.getOpeningMove(positionKey);

    expect(move).toBeNull();
  });

  it('devrait retourner un mouvement inversé pour les Noirs', () => {
    const positionKey = 'rnbqkbnrpppppppp888888ppppppppRNBQKBNR';
    const move = OpeningBook.getOpeningMove(positionKey);

    // Simulation pour les Noirs
    const flippedMove = {
      fromX: 7 - move!.fromX,
      fromY: 7 - move!.fromY,
      toX: 7 - move!.toX,
      toY: 7 - move!.toY,
    };

    expect(flippedMove).toEqual({ fromX: 6, fromY: 0, toX: 4, toY: 0 });
  });
});
