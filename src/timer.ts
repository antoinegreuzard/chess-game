// src/timer.ts
export class Timer {
  private intervalId: number | null = null;
  private currentTime: number;
  private readonly onTimeUpdate: (timeLeft: number) => void;
  public isRunning: boolean = false;

  constructor(
    private initialTime: number,
    onTimeUpdate: (timeLeft: number) => void,
  ) {
    this.currentTime = initialTime;
    this.onTimeUpdate = onTimeUpdate;
  }

  // Démarrer le compte à rebours
  public start(): void {
    if (this.isRunning) return;

    console.log('Timer started.');
    this.isRunning = true;
    this.intervalId = window.setInterval(() => {
      this.currentTime--;
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

    console.log('Stopping timer.');
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  // Réinitialiser le temps
  public reset(time: number): void {
    console.log('Resetting timer to', time);
    this.stop();
    this.currentTime = time;
    this.start();
  }
}
