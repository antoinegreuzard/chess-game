// src/timer.ts
export class Timer {
  private intervalId: NodeJS.Timeout | null = null;
  private currentTime: number;
  private readonly onTimeUpdate: (timeLeft: number) => void;
  public isRunning: boolean = false;

  constructor(initialTime: number, onTimeUpdate: (timeLeft: number) => void) {
    this.currentTime = Math.max(0, initialTime);
    this.onTimeUpdate = onTimeUpdate;
  }

  // Démarrer le compte à rebours
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.currentTime = Math.max(this.currentTime - 1, 0);
      this.onTimeUpdate(this.currentTime);

      if (this.currentTime <= 0) {
        this.currentTime = 0;
        this.stop();
        // Appel de la fonction onTimeUpdate une dernière fois pour garantir l'affichage du temps écoulé
        this.onTimeUpdate(this.currentTime);
      }
    }, 1000);
  }

  // Arrêter le compte à rebours
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  // Réinitialiser le temps
  public reset(time: number, startImmediately: boolean = true): void {
    this.stop();
    this.currentTime = Math.max(0, time);
    this.onTimeUpdate(this.currentTime);
    if (startImmediately) {
      this.start();
    }
  }
}
