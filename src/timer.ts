export class Timer {
  private intervalId: number | null = null;
  private currentTime: number;
  private readonly onTimeUpdate: (timeLeft: number) => void;
  private isStopped: boolean = false;
  private isRunning: boolean = false; // Ajoute un flag pour vérifier si le timer est actif

  constructor(
    private initialTime: number,
    onTimeUpdate: (timeLeft: number) => void,
  ) {
    this.currentTime = initialTime;
    this.onTimeUpdate = onTimeUpdate;
  }

  // Démarrer le compte à rebours
  public start(): void {
    if (this.isRunning) return; // Empêche de démarrer si déjà en cours

    this.isStopped = false;
    this.isRunning = true; // Indique que le timer est maintenant actif
    this.intervalId = window.setInterval(() => {
      if (this.isStopped) return;

      this.currentTime--;
      if (this.currentTime <= 0) {
        this.currentTime = 0;
        this.stop();
      }
      this.onTimeUpdate(this.currentTime);
    }, 1000);
  }

  // Arrêter le compte à rebours
  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isStopped = true;
    this.isRunning = false; // Indique que le timer est arrêté
  }

  // Réinitialiser le temps
  public reset(time: number): void {
    this.stop();
    this.currentTime = time;
    this.start();
  }
}
