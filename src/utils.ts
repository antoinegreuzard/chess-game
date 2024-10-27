// src/utils.ts

export function showMessage(message: string) {
  const gameMessageElement = document.getElementById('gameMessage')!;
  gameMessageElement.textContent = message;
  gameMessageElement.style.display = 'block'; // Afficher le message
}
