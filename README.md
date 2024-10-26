# Chess Game in TypeScript

This is a simple Chess game implemented in TypeScript, featuring a 2D graphical interface, animation for piece
movements, and rules enforcement.

## Features

- **Turn-based system** where players take turns playing as White or Black.
- **Animation** for piece movements.
- Enforced **Chess rules** for piece movements.
- **Timer** for each turn.
- Capture of pieces and implementation of **Castling** will be included.

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/en/) (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chess-game
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Game

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to play the game.

### Project Structure

- **src/**: Contains the TypeScript source code.
   - **index.ts**: Entry point of the application. Contains game logic and initialization.
   - **canvas-renderer.ts**: Handles the drawing of the board and pieces, and user interactions.
   - **piece.ts**: Defines different chess pieces and their movement rules.
   - **board.ts**: Contains the board setup and logic for move validation.
   - **game.ts**: Game-related logic.
   - **timer.ts**: Handles the timer for each turn.

### Implementing Capture of Pieces

To implement the capture of pieces:

1. Update the move validation to allow capturing of opponent's pieces.
2. Remove the captured piece from the board.

### Implementing Castling

To implement castling:

1. Add conditions for castling in the King’s move validation.
2. Ensure neither the King nor the Rook involved has moved before.
3. Ensure there are no pieces between the King and the Rook.
4. Ensure the King is not in check before, during, or after castling.

### Scripts

- **`npm run build`**: Compiles the TypeScript code.
- **`npm run dev`**: Starts the development server using a local server.

## Contributions

Feel free to fork this repository and submit pull requests. Contributions are always welcome!

## License

This project is licensed under the MIT License.

[![Depfu](https://badges.depfu.com/badges/8ae82388d5e29a8e9210627b8c53c142/status.svg)](https://depfu.com)
[![Depfu](https://badges.depfu.com/badges/8ae82388d5e29a8e9210627b8c53c142/overview.svg)](https://depfu.com/github/antoinegreuzard/chess-game?project_id=48982)
[![Depfu](https://badges.depfu.com/badges/8ae82388d5e29a8e9210627b8c53c142/count.svg)](https://depfu.com/github/antoinegreuzard/chess-game?project_id=48982)