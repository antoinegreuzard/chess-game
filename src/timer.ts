// src/timer.ts
export class Timer {
  private intervalId: number | null = null;
  private currentTime: number;
  private readonly onTimeUpdate: (timeLeft: number) => void;

  constructor(private initialTime: number, onTimeUpdate: (timeLeft: number) => void) {
    this.currentTime = initialTime;
    this.onTimeUpdate = onTimeUpdate;
  }

  // Démarrer le compte à rebours
  public start(): void {
    this.intervalId = window.setInterval(() => {
      this.currentTime--;
      this.onTimeUpdate(this.currentTime);

      if (this.currentTime <= 0) {
        this.stop();
      }
    }, 1000);
  }

  // Arrêter le compte à rebours
  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Réinitialiser le temps
  public reset(time: number): void {
    this.stop();
    this.currentTime = time;
    this.start();
  }
}
