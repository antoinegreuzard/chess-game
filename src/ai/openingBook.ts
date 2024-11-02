// ai/openingBook.ts

export class OpeningBook {
  private static openings: {
    [key: string]: { fromX: number; fromY: number; toX: number; toY: number }[];
  } = {
    rnbqkbnrpppppppp888888ppppppppRNBQKBNR: [
      { fromX: 1, fromY: 7, toX: 3, toY: 7 }, // Pion roi du roi (1. e4)
      { fromX: 6, fromY: 7, toX: 5, toY: 5 }, // Pion roi de la dame (1. d4)
    ],
    rnbqkbnrpppppppp888888pppPPpppRNBQKBNR: [
      { fromX: 2, fromY: 7, toX: 4, toY: 7 }, // Pion vers 1.c4 (Ouverture anglaise)
    ],
    rnbqkbnrpppppppp888888pPPPPpppRNBQKBNR: [
      { fromX: 5, fromY: 6, toX: 5, toY: 4 }, // Gambit Dame (1.d4 d5 2.c4)
    ],
    rnbqkbnrp1pppppp888888pppPPpppRNBQKBNR: [
      { fromX: 4, fromY: 7, toX: 5, toY: 7 }, // Cavalier vers f3 (1. e4 e5 2. Nf3)
    ],
    rnbqkb1rpppppppp888888pppnPPppRNBQKBNR: [
      { fromX: 4, fromY: 6, toX: 4, toY: 4 }, // Défense sicilienne (1.e4 c5)
      { fromX: 2, fromY: 7, toX: 3, toY: 5 }, // Ouverture écossaise (1.e4 e5 2. Nf3 Nc6 3.d4)
    ],
    rnbqkbnrpp1ppppp888888ppp1PPppRNBQKBNR: [
      { fromX: 5, fromY: 6, toX: 4, toY: 4 }, // Défense française (1.e4 e6)
      { fromX: 5, fromY: 7, toX: 5, toY: 6 }, // Pion vers e3 (Début du pion roi)
    ],
    rnbqkbnrppppp1pp888888ppPPpPppRNBQKBNR: [
      { fromX: 5, fromY: 7, toX: 3, toY: 6 }, // Défense Alekhine (1.e4 Nf6)
    ],
    rnbqkbnrpppppp1p888888ppPPpPppRNBQKBNR: [
      { fromX: 6, fromY: 6, toX: 6, toY: 4 }, // Défense moderne (1.e4 g6)
    ],
  };

  static getOpeningMove(
    positionKey: string,
  ): { fromX: number; fromY: number; toX: number; toY: number } | null {
    const moves = this.openings[positionKey];
    if (moves && moves.length > 0) {
      // Ici, on peut choisir aléatoirement un mouvement parmi les options, ou garder le premier
      return moves[0];
    }
    return null;
  }
}
