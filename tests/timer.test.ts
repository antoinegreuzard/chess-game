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

    jest.advanceTimersByTime(3000);

    expect(onTimeUpdate).toHaveBeenCalledTimes(3);
    expect(onTimeUpdate).toHaveBeenCalledWith(9);
    expect(onTimeUpdate).toHaveBeenCalledWith(8);
    expect(onTimeUpdate).toHaveBeenCalledWith(7);
  });

  it('should stop the timer when stop is called', () => {
    timer.start();
    jest.advanceTimersByTime(3000);
    timer.stop();

    jest.advanceTimersByTime(3000);

    expect(onTimeUpdate).toHaveBeenCalledTimes(3);
  });

  it('should reset the timer to a new time and start immediately', () => {
    timer.start();
    jest.advanceTimersByTime(2000);
    timer.reset(5);

    expect(onTimeUpdate).toHaveBeenCalledWith(5);

    jest.advanceTimersByTime(5000);

    expect(onTimeUpdate).toHaveBeenCalledWith(0);
  });

  it('should stop the timer when the time reaches 0', () => {
    timer.start();

    jest.advanceTimersByTime(10000);

    expect(onTimeUpdate).toHaveBeenCalledWith(0);
    expect(timer.isRunning).toBe(false);
  });

  it('should not start the timer if already running', () => {
    timer.start();
    jest.advanceTimersByTime(2000);

    timer.start(); // Start à nouveau sans effet
    jest.advanceTimersByTime(2000);

    expect(onTimeUpdate).toHaveBeenCalledTimes(4);
  });

  it('should reset the timer and not start if startImmediately is false', () => {
    timer.start();
    jest.advanceTimersByTime(2000);
    timer.reset(8, false); // Réinitialiser à 8 secondes sans démarrage immédiat

    expect(onTimeUpdate).toHaveBeenCalledWith(8);
    expect(timer.isRunning).toBe(false);

    jest.advanceTimersByTime(2000);

    expect(onTimeUpdate).toHaveBeenCalledTimes(3); // Aucun appel supplémentaire après la réinitialisation
  });

  it('should handle multiple stops without errors', () => {
    timer.start();
    jest.advanceTimersByTime(3000);

    timer.stop();
    timer.stop(); // Appel stop multiple
    jest.advanceTimersByTime(2000);

    expect(onTimeUpdate).toHaveBeenCalledTimes(3);
    expect(timer.isRunning).toBe(false);
  });

  it('should trigger onTimeUpdate immediately upon reset with the new time', () => {
    timer.reset(15);

    expect(onTimeUpdate).toHaveBeenCalledWith(15);
    expect(timer.isRunning).toBe(true);

    jest.advanceTimersByTime(5000);

    expect(onTimeUpdate).toHaveBeenCalledWith(10);
  });
});
