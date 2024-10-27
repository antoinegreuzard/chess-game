// tests/timer.test.ts
import { Timer } from '../src/timer';

describe('Timer', () => {
  jest.useFakeTimers();

  let mockOnTimeUpdate: jest.Mock;
  let timer: Timer;

  beforeEach(() => {
    mockOnTimeUpdate = jest.fn();
    timer = new Timer(5, mockOnTimeUpdate);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should start the timer and call onTimeUpdate', () => {
    timer.start();
    expect(timer.isRunning).toBe(true);

    jest.advanceTimersByTime(3000);
    expect(mockOnTimeUpdate).toHaveBeenCalledTimes(3);
    expect(mockOnTimeUpdate).toHaveBeenCalledWith(2); // Le temps restant après 3 secondes
  });

  test('should stop the timer', () => {
    timer.start();
    timer.stop();
    expect(timer.isRunning).toBe(false);

    jest.advanceTimersByTime(3000);
    expect(mockOnTimeUpdate).toHaveBeenCalledTimes(0);
  });

  test('should reset the timer', () => {
    timer.start();
    jest.advanceTimersByTime(2000);

    timer.reset(10);
    expect(timer.isRunning).toBe(true);

    jest.advanceTimersByTime(3000);
    expect(mockOnTimeUpdate).toHaveBeenCalledWith(7); // Le temps restant après le reset et 3 secondes
  });

  test('should call onTimeUpdate when time is up', () => {
    timer.start();
    jest.advanceTimersByTime(5000); // Le temps initial est de 5

    expect(mockOnTimeUpdate).toHaveBeenLastCalledWith(0);
    expect(timer.isRunning).toBe(false);
  });
});
