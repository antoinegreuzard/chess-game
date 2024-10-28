# Chess Game in TypeScript

This is a simple Chess game implemented in TypeScript, featuring a 2D graphical interface, animation for piece
movements, and rules enforcement.

## Features

- **Turn-based system** where players take turns playing as White or Black.
- **Animation** for piece movements.
- **Legal move highlights**: When a piece is selected, all legal moves are highlighted.
- **Check indicator**: The board highlights when the King is in check.
- Enforced **Chess rules** for piece movements.
- **Timer** for each turn.
- **Capture of pieces** with visual updates.
- **Castling**, **En Passant**, and **Pawn Promotion** supported.
- **Stalemate** and **Checkmate** detection.

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/en/) (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/antoinegreuzard/chess-game.git
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
   npm run start
   ```

3. Open your browser and navigate to `http://localhost:5173` to play the game.

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

1. The game validates moves and allows capturing of opponent's pieces if the move is legal.
2. Captured pieces are removed from the board and displayed in the "Captured Pieces" sidebar.

### Implementing Castling

To implement castling:

1. Conditions for castling have been added in the King’s move validation.
2. The King and the Rook involved must not have moved before.
3. There must be no pieces between the King and the Rook.
4. The King must not be in check before, during, or after castling.

### Implementing Special Chess Rules

- **En Passant**: This special pawn capture move is implemented, allowing pawns to capture opponents in specific
  conditions.
- **Pawn Promotion**: When a pawn reaches the opponent's back rank, it can be promoted to another piece (Queen by
  default, with options to choose another piece).
- **Stalemate**: The game correctly identifies situations of stalemate, leading to a draw.
- **50-Move Rule**: The game can end in a draw if 50 moves are made without a pawn move or a capture.
- **Check Indicator**: When the King is in check, the board visually highlights the King’s position.

### Scripts

- **`npm run build`**: Compiles the TypeScript code.
- **`npm run dev`**: Starts the development server using a local server.

## Additional Features

- **Draw by Mutual Agreement**: A button in the UI allows players to propose a draw. If both players agree, the game
  ends in a draw.
- **Insufficient Material**: The game detects situations where a checkmate is impossible due to insufficient material (
  e.g., King vs. King).

## Contributions

Feel free to fork this repository and submit pull requests. Contributions are always welcome!

## License

This project is licensed under the MIT License.

[![Depfu](https://badges.depfu.com/badges/8ae82388d5e29a8e9210627b8c53c142/status.svg)](https://depfu.com)
[![Depfu](https://badges.depfu.com/badges/8ae82388d5e29a8e9210627b8c53c142/overview.svg)](https://depfu.com/github/antoinegreuzard/chess-game?project_id=48982)
[![Depfu](https://badges.depfu.com/badges/8ae82388d5e29a8e9210627b8c53c142/count.svg)](https://depfu.com/github/antoinegreuzard/chess-game?project_id=48982)
