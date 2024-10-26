// src/timer.ts
export class Timer {
    constructor(initialTime, onTimeUpdate) {
        this.initialTime = initialTime;
        this.intervalId = null;
        this.currentTime = initialTime;
        this.onTimeUpdate = onTimeUpdate;
    }
    // Démarrer le compte à rebours
    start() {
        this.intervalId = window.setInterval(() => {
            this.currentTime--;
            this.onTimeUpdate(this.currentTime);
            if (this.currentTime <= 0) {
                this.stop();
            }
        }, 1000);
    }
    // Arrêter le compte à rebours
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    // Réinitialiser le temps
    reset(time) {
        this.stop();
        this.currentTime = time;
        this.start();
    }
}
