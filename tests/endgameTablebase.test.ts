// endgameTablebase.test.ts
import { EndgameTablebase } from '../src/ai/endgameTablebase';

describe('EndgameTablebase', () => {
  it('devrait retourner le bon mouvement pour une fin de partie Roi + Dame contre Roi', () => {
    const positionKey = 'kqkEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 7, fromY: 1, toX: 6, toY: 1 });
  });

  it('devrait retourner le bon mouvement pour une fin de partie Roi + Tour contre Roi', () => {
    const positionKey = 'krkEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 7, fromY: 0, toX: 5, toY: 0 });
  });

  it('devrait retourner le bon mouvement pour une fin de partie Roi + 2 Fous contre Roi', () => {
    const positionKey = 'kbbkEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 5, fromY: 3, toX: 3, toY: 1 });
  });

  it('devrait retourner null pour une position non définie', () => {
    const positionKey = 'unknownEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).toBeNull();
  });

  it('devrait retourner le bon mouvement pour une fin de partie Roi et Pion contre Roi', () => {
    const positionKey = 'kpEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 6, fromY: 5, toX: 6, toY: 6 });
  });

  it('devrait retourner le bon mouvement pour une fin de partie Roi + Tour contre Roi + Pion', () => {
    const positionKey = 'krkpEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 6, fromY: 0, toX: 6, toY: 1 });
  });

  it('devrait retourner le bon mouvement pour une fin de partie Roi + Dame contre Roi + Tour', () => {
    const positionKey = 'kqkrEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 7, fromY: 2, toX: 6, toY: 2 });
  });

  it('devrait retourner le bon mouvement pour une fin de partie Roi + Fou contre Roi + Pion', () => {
    const positionKey = 'kbkpEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 3, fromY: 3, toX: 4, toY: 2 });
  });

  it('devrait retourner le bon mouvement pour une fin de partie Roi + 2 Tours contre Roi', () => {
    const positionKey = 'krrkEndgame';
    const move = EndgameTablebase.getEndgameMove(positionKey);

    expect(move).not.toBeNull();
    expect(move).toEqual({ fromX: 7, fromY: 4, toX: 5, toY: 4 });
  });
});
