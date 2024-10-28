// tests/timer.test.ts
import { Timer } from '../src/timer';

describe('Timer', () => {
  jest.useFakeTimers();
  let onTimeUpdate: jest.Mock;
  let timer: Timer;

  beforeEach(() => {
    onTimeUpdate = jest.fn();
    timer = new Timer(10, onTimeUpdate); // initialiser le minuteur avec 10 secondes
  });

  afterEach(() => {
    timer.stop(); // Arrêter le minuteur pour éviter les conflits entre les tests
  });

  it('should start the timer and call onTimeUpdate every second', () => {
    timer.start();

    // Avancer le temps de 3 secondes
    jest.advanceTimersByTime(3000);

    // Vérifier que la fonction onTimeUpdate a été appelée 3 fois avec le temps mis à jour
    expect(onTimeUpdate).toHaveBeenCalledTimes(3);
    expect(onTimeUpdate).toHaveBeenCalledWith(9); // 1 sec écoulée (10-1)
    expect(onTimeUpdate).toHaveBeenCalledWith(8); // 2 sec écoulées (10-2)
    expect(onTimeUpdate).toHaveBeenCalledWith(7); // 3 sec écoulées (10-3)
  });

  it('should stop the timer when stop is called', () => {
    timer.start();
    jest.advanceTimersByTime(3000);
    timer.stop();

    // Avancer le temps de 3 secondes de plus
    jest.advanceTimersByTime(3000);

    // Vérifier que la fonction onTimeUpdate n'a pas été appelée après l'arrêt
    expect(onTimeUpdate).toHaveBeenCalledTimes(3);
  });

  it('should reset the timer to a new time and start immediately', () => {
    timer.start();
    jest.advanceTimersByTime(2000);
    timer.reset(5); // Réinitialiser le timer à 5 secondes

    // Vérifier immédiatement l'appel initial avec la nouvelle valeur réinitialisée
    expect(onTimeUpdate).toHaveBeenCalledWith(5);

    // Continuer à avancer le temps
    jest.advanceTimersByTime(5000);

    // Vérifier que le timer a atteint 0
    expect(onTimeUpdate).toHaveBeenCalledWith(0);
  });

  it('should stop the timer when the time reaches 0', () => {
    timer.start();

    // Avancer le temps de 10 secondes pour que le timer atteigne 0
    jest.advanceTimersByTime(10000);

    // Vérifier que le timer s'est arrêté et appelle onTimeUpdate avec 0
    expect(onTimeUpdate).toHaveBeenCalledWith(0);
    expect(timer.isRunning).toBe(false);
  });
});
