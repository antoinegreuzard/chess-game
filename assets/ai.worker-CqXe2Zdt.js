async function createPiece(type, color) {
  switch (type) {
    case PieceType.PAWN:
      const { Pawn } = await import('./pawn-CJJXa_Rb.js');
      return new Pawn(color);
    case PieceType.ROOK:
      const { Rook } = await import('./rook-Dp_TpVkZ.js');
      return new Rook(color);
    case PieceType.KNIGHT:
      const { Knight } = await import('./knight-CZ4Ikkby.js');
      return new Knight(color);
    case PieceType.BISHOP:
      const { Bishop } = await import('./bishop-CAtiqWg8.js');
      return new Bishop(color);
    case PieceType.QUEEN:
      const { Queen } = await import('./queen-Ds9a_lAC.js');
      return new Queen(color);
    case PieceType.KING:
      const { King } = await import('./king-BHyRmpRy.js');
      return new King(color);
    default:
      throw new Error(`Type de pièce inconnu : ${type}`);
  }
}

var PieceColor = /* @__PURE__ */ ((PieceColor2) => {
  PieceColor2["WHITE"] = "white";
  PieceColor2["BLACK"] = "black";
  return PieceColor2;
})(PieceColor || {});
var PieceType = /* @__PURE__ */ ((PieceType2) => {
  PieceType2["PAWN"] = "pawn";
  PieceType2["ROOK"] = "rook";
  PieceType2["KNIGHT"] = "knight";
  PieceType2["BISHOP"] = "bishop";
  PieceType2["QUEEN"] = "queen";
  PieceType2["KING"] = "king";
  return PieceType2;
})(PieceType || {});
class Piece {
  constructor(color, type) {
    this.color = color;
    this.type = type;
  }
  hasMoved = false;
  isPathClear(fromX, fromY, toX, toY, board) {
    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);
    let x = fromX + dx;
    let y = fromY + dy;
    while (x !== toX || y !== toY) {
      if (board.getPiece(x, y) !== null) return false;
      x += dx;
      y += dy;
    }
    return true;
  }
  static isKing(piece) {
    return piece.type === "king" /* KING */;
  }
  canCapture(toX, toY, board) {
    const targetPiece = board.getPiece(toX, toY);
    return !targetPiece || targetPiece.color !== this.color;
  }
  // Sérialisation des données de la pièce
  toData() {
    return {
      color: this.color,
      type: this.type
    };
  }
  static async fromData(data) {
    return await createPiece(data.type, data.color);
  }
  // Méthode clone pour créer une nouvelle instance identique
  async clone() {
    return await createPiece(this.type, this.color);
  }
}

let capturedWhite = [];
let capturedBlack = [];
function getPieceSymbol(piece, color) {
  switch (piece) {
    case PieceType.PAWN:
      return color === PieceColor.WHITE ? "♙" : "♟";
    case PieceType.ROOK:
      return color === PieceColor.WHITE ? "♖" : "♜";
    case PieceType.KNIGHT:
      return color === PieceColor.WHITE ? "♘" : "♞";
    case PieceType.BISHOP:
      return color === PieceColor.WHITE ? "♗" : "♝";
    case PieceType.QUEEN:
      return color === PieceColor.WHITE ? "♕" : "♛";
    case PieceType.KING:
      return color === PieceColor.WHITE ? "♔" : "♚";
    default:
      return "";
  }
}
function updateCapturedPieces(piece, color) {
  const pieceSymbol = getPieceSymbol(piece, color);
  if (color === PieceColor.WHITE) {
    capturedWhite.push(pieceSymbol);
  } else {
    capturedBlack.push(pieceSymbol);
  }
  updateCapturedPiecesDOM();
}
function updateCapturedPiecesDOM() {
  const capturedWhiteElement = document.getElementById(
    "capturedWhite"
  );
  const capturedBlackElement = document.getElementById(
    "capturedBlack"
  );
  if (capturedWhiteElement) {
    capturedWhiteElement.textContent = capturedWhite.join(" ");
  }
  if (capturedBlackElement) {
    capturedBlackElement.textContent = capturedBlack.join(" ");
  }
}

class Board {
  grid;
  enPassantTarget = null;
  halfMoveCount = 0;
  // Compteur pour la règle des 50 coups
  constructor() {
    this.grid = [];
  }
  async init() {
    this.grid = await this.initializeBoard();
  }
  async initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    board[0] = [
      await createPiece(PieceType.ROOK, PieceColor.WHITE),
      await createPiece(PieceType.KNIGHT, PieceColor.WHITE),
      await createPiece(PieceType.BISHOP, PieceColor.WHITE),
      await createPiece(PieceType.QUEEN, PieceColor.WHITE),
      await createPiece(PieceType.KING, PieceColor.WHITE),
      await createPiece(PieceType.BISHOP, PieceColor.WHITE),
      await createPiece(PieceType.KNIGHT, PieceColor.WHITE),
      await createPiece(PieceType.ROOK, PieceColor.WHITE)
    ];
    board[1] = await Promise.all(
      Array(8).fill(null).map(() => createPiece(PieceType.PAWN, PieceColor.WHITE))
    );
    board[7] = [
      await createPiece(PieceType.ROOK, PieceColor.BLACK),
      await createPiece(PieceType.KNIGHT, PieceColor.BLACK),
      await createPiece(PieceType.BISHOP, PieceColor.BLACK),
      await createPiece(PieceType.QUEEN, PieceColor.BLACK),
      await createPiece(PieceType.KING, PieceColor.BLACK),
      await createPiece(PieceType.BISHOP, PieceColor.BLACK),
      await createPiece(PieceType.KNIGHT, PieceColor.BLACK),
      await createPiece(PieceType.ROOK, PieceColor.BLACK)
    ];
    board[6] = await Promise.all(
      Array(8).fill(null).map(() => createPiece(PieceType.PAWN, PieceColor.BLACK))
    );
    return board;
  }
  // Méthode générale pour vérifier les limites
  isWithinBounds(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }
  getPiece(x, y) {
    return this.grid[y][x];
  }
  getValidMoves(x, y) {
    let piece = null;
    if (this.isWithinBounds(x, y)) piece = this.getPiece(x, y);
    if (!piece) return [];
    const validMoves = [];
    for (let toY = 0; toY < 8; toY++) {
      for (let toX = 0; toX < 8; toX++) {
        if (piece.isValidMove(x, y, toX, toY, this)) {
          validMoves.push({ x: toX, y: toY });
        }
      }
    }
    return validMoves;
  }
  getKingInCheck() {
    if (this.isKingInCheck(PieceColor.WHITE)) {
      return this.findKing(PieceColor.WHITE);
    } else if (this.isKingInCheck(PieceColor.BLACK)) {
      return this.findKing(PieceColor.BLACK);
    }
    return null;
  }
  movePiece(fromX, fromY, toX, toY) {
    if (!this.isWithinBounds(fromX, fromY) || !this.isWithinBounds(toX, toY) || ["__proto__", "constructor", "prototype"].includes(fromY.toString()) || ["__proto__", "constructor", "prototype"].includes(toY.toString())) {
      return false;
    }
    const piece = this.getPiece(fromX, fromY);
    if (piece && piece.isValidMove(fromX, fromY, toX, toY, this)) {
      const targetPiece = this.getPiece(toX, toY);
      if (targetPiece && targetPiece.type === PieceType.KING) {
        return false;
      }
      if (Piece.isKing(piece) && Math.abs(toX - fromX) === 2) {
        if (this.isCastlingValid(piece, fromX, fromY, toX)) {
          this.handleCastling(toX, fromY);
          return true;
        } else {
          return false;
        }
      }
      if (piece?.type === PieceType.PAWN && this.isEnPassantMove(fromX, fromY, toX, toY)) {
        this.captureEnPassant(fromX, fromY, toX, toY);
      }
      this.grid[toY][toX] = piece;
      this.grid[fromY][fromX] = null;
      if (this.isKingInCheck(piece.color)) {
        this.grid[fromY][fromX] = piece;
        this.grid[toY][toX] = targetPiece;
        return false;
      }
      if ("hasMoved" in piece) {
        piece.hasMoved = true;
      }
      this.updateEnPassantTarget(fromX, fromY, toX, toY, piece);
      this.halfMoveCount = piece.type === PieceType.PAWN || targetPiece ? 0 : this.halfMoveCount + 1;
      const opponentColor = piece.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
      if (this.isCheckmate(opponentColor)) {
        return true;
      }
      return true;
    }
    return false;
  }
  isCastlingValid(king, fromX, fromY, toX) {
    const direction = toX > fromX ? 1 : -1;
    const rookX = toX > fromX ? 7 : 0;
    const rook = this.getPiece(rookX, fromY);
    if (!(rook?.type === PieceType.ROOK) || rook.hasMoved || king.hasMoved)
      return false;
    for (let x = fromX + direction; x !== toX; x += direction) {
      if (this.getPiece(x, fromY) || this.isSquareUnderAttack(x, fromY, king.color)) {
        return false;
      }
    }
    return !this.isSquareUnderAttack(fromX, fromY, king.color) && !this.isSquareUnderAttack(toX, fromY, king.color);
  }
  handleCastling(kingX, kingY) {
    if (kingX === 6) {
      const rook = this.getPiece(7, kingY);
      if (rook?.type === PieceType.ROOK) {
        this.movePiece(7, kingY, 5, kingY);
      }
    } else if (kingX === 2) {
      const rook = this.getPiece(0, kingY);
      if (rook?.type === PieceType.ROOK) {
        this.movePiece(0, kingY, 3, kingY);
      }
    }
  }
  updateEnPassantTarget(fromX, fromY, toX, toY, piece) {
    if (piece?.type === PieceType.PAWN && Math.abs(toY - fromY) === 2 && fromX === toX) {
      this.enPassantTarget = { x: toX, y: (fromY + toY) / 2 };
    } else {
      this.enPassantTarget = null;
    }
  }
  captureEnPassant(fromX, fromY, toX, toY) {
    const piece = this.getPiece(fromX, fromY);
    if (this.isEnPassantMove(fromX, fromY, toX, toY) && piece?.type === PieceType.PAWN) {
      const direction = piece.color === PieceColor.WHITE ? -1 : 1;
      const capturedPawnY = toY + direction;
      const capturedPawn = this.getPiece(toX, capturedPawnY);
      if (capturedPawn && capturedPawn.type === PieceType.PAWN) {
        this.grid[capturedPawnY][toX] = null;
        const captureData = {
          capturedWhite: [],
          capturedBlack: []
        };
        if (capturedPawn.color === PieceColor.WHITE) {
          captureData.capturedWhite.push(capturedPawn.type);
        } else {
          captureData.capturedBlack.push(capturedPawn.type);
        }
        updateCapturedPieces(capturedPawn.type, capturedPawn.color);
        return captureData;
      }
    }
    return null;
  }
  isEnPassantMove(fromX, fromY, toX, toY) {
    if (!this.enPassantTarget) return false;
    const piece = this.getPiece(fromX, fromY);
    return piece?.type === PieceType.PAWN && toX === this.enPassantTarget.x && toY === this.enPassantTarget.y && Math.abs(fromX - toX) === 1 && Math.abs(fromY - toY) === 1;
  }
  async promotePawn(x, y, pieceType) {
    const color = this.getPiece(x, y)?.color;
    if (!color) return;
    switch (pieceType) {
      case "queen":
        this.grid[y][x] = await createPiece(PieceType.QUEEN, color);
        break;
      case "rook":
        this.grid[y][x] = await createPiece(PieceType.ROOK, color);
        break;
      case "bishop":
        this.grid[y][x] = await createPiece(PieceType.BISHOP, color);
        break;
      case "knight":
        this.grid[y][x] = await createPiece(PieceType.KNIGHT, color);
        break;
    }
  }
  isKingInCheck(color) {
    const kingPosition = this.findKing(color);
    if (!kingPosition) {
      return false;
    }
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color !== color) {
          if (piece.isValidMove(x, y, kingPosition.x, kingPosition.y, this)) {
            return true;
          }
        }
      }
    }
    return false;
  }
  isCheckmate(color) {
    if (!this.isKingInCheck(color)) {
      return false;
    }
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color === color) {
          const moves = this.getValidMoves(x, y);
          for (const move of moves) {
            const originalPiece = this.getPiece(move.x, move.y);
            this.grid[move.y][move.x] = piece;
            this.grid[y][x] = null;
            const kingSafe = !this.isKingInCheck(color);
            this.grid[y][x] = piece;
            this.grid[move.y][move.x] = originalPiece;
            if (kingSafe) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }
  isStalemate(color) {
    if (this.isKingInCheck(color)) return false;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece.color === color) {
          for (let toY = 0; toY < 8; toY++) {
            for (let toX = 0; toX < 8; toX++) {
              if (piece.isValidMove(x, y, toX, toY, this)) {
                const originalPiece = this.getPiece(toX, toY);
                this.grid[toY][toX] = piece;
                this.grid[y][x] = null;
                const isKingSafe = !this.isKingInCheck(color);
                this.grid[y][x] = piece;
                this.grid[toY][toX] = originalPiece;
                if (isKingSafe) return false;
              }
            }
          }
        }
      }
    }
    return true;
  }
  findKing(color) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.getPiece(x, y);
        if (piece && piece?.type === PieceType.KING && piece.color === color) {
          return { x, y };
        }
      }
    }
    return null;
  }
  isKing(x, y) {
    const piece = this.getPiece(x, y);
    return piece?.type === PieceType.KING;
  }
  isSquareUnderAttack(x, y, color) {
    for (let fromY = 0; fromY < 8; fromY++) {
      for (let fromX = 0; fromX < 8; fromX++) {
        const piece = this.getPiece(fromX, fromY);
        if (piece && piece.color !== color) {
          if (piece.isValidMove(fromX, fromY, x, y, this)) {
            return true;
          }
        }
      }
    }
    return false;
  }
  // Vérifie le matériel insuffisant pour un échec et mat
  isInsufficientMaterial() {
    const pieces = this.grid.flat().filter((piece) => piece !== null);
    if (pieces.length <= 2) return true;
    return pieces.length === 3 && pieces.some(
      (piece) => piece?.type === PieceType.BISHOP || piece?.type === PieceType.KNIGHT
    );
  }
  // Vérifie si la règle des 50 coups est remplie
  isFiftyMoveRule() {
    return this.halfMoveCount >= 50;
  }
  setPiece(x, y, piece) {
    this.grid[y][x] = piece;
  }
  // Vérifie si un mouvement est valide
  isMoveValid(fromRow, fromCol, toRow, toCol) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) {
      return false;
    }
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
      return false;
    }
    if (!piece.isValidMove(fromRow, fromCol, toRow, toCol, this)) {
      return false;
    }
    const destinationPiece = this.getPiece(toRow, toCol);
    return !(destinationPiece && destinationPiece.color === piece.color);
  }
  isCapture(fromX, fromY, toX, toY) {
    const piece = this.isWithinBounds(fromX, fromY) ? this.getPiece(fromX, fromY) : null;
    const targetPiece = this.isWithinBounds(toX, toY) ? this.getPiece(toX, toY) : null;
    return piece !== null && targetPiece !== null && piece.color !== targetPiece.color;
  }
  static async fromData(data) {
    const board = new Board();
    await board.init();
    board.grid = await Promise.all(
      data.grid.map(
        async (row) => Promise.all(
          row.map(
            async (pieceData) => pieceData ? await Piece.fromData(pieceData) : null
          )
        )
      )
    );
    return board;
  }
  toData() {
    return {
      grid: this.grid.map(
        (row) => row.map((piece) => piece ? piece.toData() : null)
      )
    };
  }
  isAdjacentToAnotherKing(x, y, color) {
    const kingPositions = [
      { dx: -1, dy: -1 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: 1 }
    ];
    for (const { dx, dy } of kingPositions) {
      const nx = x + dx;
      const ny = y + dy;
      const piece = this.isWithinBounds(nx, ny) ? this.getPiece(nx, ny) : null;
      if (piece?.type === PieceType.KING && piece.color !== color) {
        return true;
      }
    }
    return false;
  }
  clone() {
    const clonedBoard = new Board();
    clonedBoard.grid = this.grid.map(
      (row) => row.map(
        (piece) => piece ? Object.create(
          Object.getPrototypeOf(piece),
          Object.getOwnPropertyDescriptors(piece)
        ) : null
      )
    );
    clonedBoard.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
    clonedBoard.halfMoveCount = this.halfMoveCount;
    return clonedBoard;
  }
  getPieceCount() {
    return this.grid.flat().filter((piece) => piece !== null).length;
  }
  isGameOver() {
    if (this.isCheckmate(PieceColor.WHITE) || this.isCheckmate(PieceColor.BLACK)) {
      return true;
    }
    if (this.isStalemate(PieceColor.WHITE) || this.isStalemate(PieceColor.BLACK)) {
      return true;
    }
    if (this.isInsufficientMaterial()) {
      return true;
    }
    return this.isFiftyMoveRule();
  }
  getWinner() {
    if (this.isCheckmate(PieceColor.BLACK)) {
      return PieceColor.WHITE;
    }
    if (this.isCheckmate(PieceColor.WHITE)) {
      return PieceColor.BLACK;
    }
    if (this.isStalemate(PieceColor.WHITE) || this.isStalemate(PieceColor.BLACK) || this.isInsufficientMaterial() || this.isFiftyMoveRule()) {
      return null;
    }
    return null;
  }
  getPieces() {
    return this.grid.flat().filter((piece) => piece !== null);
  }
}

const pieceValues = {
  [PieceType.PAWN]: 1,
  [PieceType.KNIGHT]: 3,
  [PieceType.BISHOP]: 3.25,
  [PieceType.ROOK]: 5,
  [PieceType.QUEEN]: 9,
  [PieceType.KING]: 0
};
const pieceSquareTables = {
  [PieceType.PAWN]: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    [0.1, 0.1, 0.2, 0.3, 0.3, 0.2, 0.1, 0.1],
    [0.05, 0.05, 0.1, 0.25, 0.25, 0.1, 0.05, 0.05],
    [0, 0, 0, 0.2, 0.2, 0, 0, 0],
    [0.05, -0.05, -0.1, 0, 0, -0.1, -0.05, 0.05],
    [0.05, 0.1, 0.1, -0.2, -0.2, 0.1, 0.1, 0.05],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  [PieceType.KNIGHT]: [
    [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5],
    [-0.4, -0.2, 0, 0, 0, 0, -0.2, -0.4],
    [-0.3, 0, 0.1, 0.15, 0.15, 0.1, 0, -0.3],
    [-0.3, 0.05, 0.15, 0.2, 0.2, 0.15, 0.05, -0.3],
    [-0.3, 0, 0.15, 0.2, 0.2, 0.15, 0, -0.3],
    [-0.3, 0.05, 0.1, 0.15, 0.15, 0.1, 0.05, -0.3],
    [-0.4, -0.2, 0, 0.05, 0.05, 0, -0.2, -0.4],
    [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5]
  ],
  [PieceType.BISHOP]: [
    [-0.2, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.2],
    [-0.1, 0, 0, 0, 0, 0, 0, -0.1],
    [-0.1, 0, 0.05, 0.1, 0.1, 0.05, 0, -0.1],
    [-0.1, 0.05, 0.05, 0.1, 0.1, 0.05, 0.05, -0.1],
    [-0.1, 0, 0.1, 0.1, 0.1, 0.1, 0, -0.1],
    [-0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, -0.1],
    [-0.1, 0.05, 0, 0, 0, 0, 0.05, -0.1],
    [-0.2, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.2]
  ],
  [PieceType.ROOK]: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.05, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [-0.05, 0, 0, 0, 0, 0, 0, -0.05],
    [0, 0, 0, 0.05, 0.05, 0, 0, 0]
  ],
  [PieceType.QUEEN]: [
    [-0.2, -0.1, -0.1, -0.05, -0.05, -0.1, -0.1, -0.2],
    [-0.1, 0, 0, 0, 0, 0, 0, -0.1],
    [-0.1, 0, 0.05, 0.05, 0.05, 0.05, 0, -0.1],
    [-0.05, 0, 0.05, 0.05, 0.05, 0.05, 0, -0.05],
    [0, 0, 0.05, 0.05, 0.05, 0.05, 0, -0.05],
    [-0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0, -0.1],
    [-0.1, 0, 0.05, 0, 0, 0, 0, -0.1],
    [-0.2, -0.1, -0.1, -0.05, -0.05, -0.1, -0.1, -0.2]
  ],
  [PieceType.KING]: [
    [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
    [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
    [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
    [-0.3, -0.4, -0.4, -0.5, -0.5, -0.4, -0.4, -0.3],
    [-0.2, -0.3, -0.3, -0.4, -0.4, -0.3, -0.3, -0.2],
    [-0.1, -0.2, -0.2, -0.2, -0.2, -0.2, -0.2, -0.1],
    [0.2, 0.2, 0, 0, 0, 0, 0.2, 0.2],
    [0.2, 0.3, 0, 0, 0, 0, 0.3, 0.2]
  ]
};
const centerControlBonus = {
  "3,3": 0.5,
  "3,4": 0.5,
  "4,3": 0.5,
  "4,4": 0.5,
  // Cases centrales
  "2,3": 0.25,
  "2,4": 0.25,
  "3,2": 0.25,
  "4,2": 0.25,
  "4,5": 0.25,
  "3,5": 0.25,
  "5,3": 0.25,
  "5,4": 0.25
  // Cases autour
};
function evaluateBoard(board, color) {
  let score = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (piece) {
        let pieceScore = pieceValues[piece.type];
        const pieceTable = pieceSquareTables[piece.type];
        if (pieceTable) {
          pieceScore += pieceTable[y][x];
        }
        const positionKey = `${x},${y}`;
        if (centerControlBonus[positionKey]) {
          pieceScore += centerControlBonus[positionKey];
        }
        if (piece.type === PieceType.PAWN) {
          pieceScore += evaluatePawnStructure(board, x, y, piece.color);
          if (isPassedPawn(board, x, y, piece.color)) {
            pieceScore += 1;
          }
        }
        if (piece.type === PieceType.KING && isKingExposed(board, x, y, piece.color)) {
          pieceScore -= 0.5;
        }
        score += piece.color === color ? pieceScore : -pieceScore;
      }
    }
  }
  return score;
}
function evaluatePawnStructure(board, x, y, color) {
  let score = 0;
  score -= checkDoubledPawns(board, x, y, color) * 1.5;
  score -= checkIsolatedPawns(board, x, y, color) * 1.5;
  return score;
}
function checkDoubledPawns(board, x, y, color) {
  for (let i = 0; i < 8; i++) {
    if (i !== y && board.getPiece(x, i)?.type === PieceType.PAWN && board.getPiece(x, i)?.color === color) {
      return 0.5;
    }
  }
  return 0;
}
function checkIsolatedPawns(board, x, y, color) {
  const leftColumn = x - 1 >= 0 ? board.getPiece(x - 1, y) : null;
  const rightColumn = x + 1 < 8 ? board.getPiece(x + 1, y) : null;
  if ((!leftColumn || leftColumn.type !== PieceType.PAWN || leftColumn.color !== color) && (!rightColumn || rightColumn.type !== PieceType.PAWN || rightColumn.color !== color)) {
    return 1.5;
  }
  return 0;
}
function isKingExposed(board, x, y, color) {
  const piece = board.getPiece(x, y);
  if (piece && piece.type === PieceType.KING) {
    const surroundingSquares = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: -1 }
    ];
    return surroundingSquares.some(({ dx, dy }) => {
      const newX = x + dx;
      const newY = y + dy;
      if (board.isWithinBounds(newX, newY)) {
        const adjPiece = board.getPiece(newX, newY);
        return !adjPiece || // Case vide
        adjPiece.color !== color || // Pièce ennemie
        adjPiece.type !== PieceType.PAWN;
      }
      return true;
    });
  }
  return false;
}
function isPassedPawn(board, x, y, color) {
  const direction = color === PieceColor.WHITE ? -1 : 1;
  for (let i = y + direction; i >= 0 && i < 8; i += direction) {
    const pieceInFront = board.getPiece(x, i);
    if (pieceInFront && pieceInFront.type === PieceType.PAWN && pieceInFront.color !== color) {
      return false;
    }
  }
  const adjacentColumns = [x - 1, x + 1];
  return adjacentColumns.every((col) => {
    if (col < 0 || col >= 8) return true;
    for (let i = 0; i < 8; i++) {
      const adjacentPiece = board.getPiece(col, i);
      if (adjacentPiece && adjacentPiece.type === PieceType.PAWN && adjacentPiece.color === color) {
        return false;
      }
    }
    return true;
  });
}

function getEndgameMove(board, color) {
  const pieces = board.getPieces();
  if (pieces.length === 3 && hasPiece(pieces, PieceType.KING, color) && hasPiece(pieces, PieceType.ROOK, color) && hasPiece(pieces, PieceType.KING, getOpponentColor(color))) {
    return getKingRookVsKingMove(board, color);
  }
  if (pieces.length === 4 && hasPiece(pieces, PieceType.KING, color) && hasPiece(pieces, PieceType.BISHOP, color) && hasPiece(pieces, PieceType.KNIGHT, color) && hasPiece(pieces, PieceType.KING, getOpponentColor(color))) {
    return getKingBishopKnightVsKingMove(board, color);
  }
  if (pieces.length === 4 && hasPiece(pieces, PieceType.KING, color) && hasPiece(pieces, PieceType.BISHOP, color) && pieces.filter(
    (piece) => piece.type === PieceType.BISHOP && piece.color === color
  ).length === 2 && hasPiece(pieces, PieceType.KING, getOpponentColor(color))) {
    return getKingTwoBishopsVsKingMove(board, color);
  }
  if (pieces.length === 3 && hasPiece(pieces, PieceType.KING, color) && hasPiece(pieces, PieceType.PAWN, color) && hasPiece(pieces, PieceType.KING, getOpponentColor(color))) {
    return getKingPawnVsKingMove(board, color);
  }
  return null;
}
function hasPiece(pieces, type, color) {
  return pieces.some((piece) => piece.type === type && piece.color === color);
}
function getOpponentColor(color) {
  return color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
}
function getKingRookVsKingMove(board, color) {
  const opponentKingPos = findPiecePosition(
    board,
    PieceType.KING,
    getOpponentColor(color)
  );
  const rookPos = findPiecePosition(board, PieceType.ROOK, color);
  if (!opponentKingPos || !rookPos) return null;
  if (opponentKingPos.x < 4) {
    return {
      fromX: rookPos.x,
      fromY: rookPos.y,
      toX: opponentKingPos.x + 1,
      toY: opponentKingPos.y
    };
  } else {
    return {
      fromX: rookPos.x,
      fromY: rookPos.y,
      toX: opponentKingPos.x - 1,
      toY: opponentKingPos.y
    };
  }
}
function getKingBishopKnightVsKingMove(board, color) {
  const opponentKingPos = findPiecePosition(
    board,
    PieceType.KING,
    getOpponentColor(color)
  );
  const knightPos = findPiecePosition(board, PieceType.KNIGHT, color);
  const bishopPos = findPiecePosition(board, PieceType.BISHOP, color);
  if (!opponentKingPos || !knightPos || !bishopPos) return null;
  if (opponentKingPos.x < 4) {
    return {
      fromX: knightPos.x,
      fromY: knightPos.y,
      toX: opponentKingPos.x + 1,
      toY: opponentKingPos.y
    };
  } else {
    return {
      fromX: bishopPos.x,
      fromY: bishopPos.y,
      toX: opponentKingPos.x - 1,
      toY: opponentKingPos.y
    };
  }
}
function getKingTwoBishopsVsKingMove(board, color) {
  const opponentKingPos = findPiecePosition(
    board,
    PieceType.KING,
    getOpponentColor(color)
  );
  const bishops = findAllPiecesPositions(board, PieceType.BISHOP, color);
  if (!opponentKingPos || bishops.length < 2) return null;
  return {
    fromX: bishops[0].x,
    fromY: bishops[0].y,
    toX: opponentKingPos.x,
    toY: opponentKingPos.y > 4 ? opponentKingPos.y - 1 : opponentKingPos.y + 1
  };
}
function getKingPawnVsKingMove(board, color) {
  const opponentKingPos = findPiecePosition(
    board,
    PieceType.KING,
    getOpponentColor(color)
  );
  const pawnPos = findPiecePosition(board, PieceType.PAWN, color);
  if (!opponentKingPos || !pawnPos) return null;
  const direction = color === PieceColor.WHITE ? 1 : -1;
  return {
    fromX: pawnPos.x,
    fromY: pawnPos.y,
    toX: pawnPos.x,
    toY: pawnPos.y + direction
  };
}
function findPiecePosition(board, pieceType, color) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (piece && piece.type === pieceType && piece.color === color) {
        return { x, y };
      }
    }
  }
  return null;
}
function findAllPiecesPositions(board, pieceType, color) {
  const positions = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board.getPiece(x, y);
      if (piece && piece.type === pieceType && piece.color === color) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

const openingBook = {
  // Ouverture Ruy Lopez
  "e2e4 e7e5 g1f3 b8c6 f1b5": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 3 },
    // e7e5
    { fromX: 6, fromY: 7, toX: 5, toY: 5 },
    // g1f3
    { fromX: 1, fromY: 0, toX: 2, toY: 2 },
    // b8c6
    { fromX: 5, fromY: 7, toX: 1, toY: 5 }
    // f1b5
  ],
  // Défense Sicilienne
  "e2e4 c7c5": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 2, fromY: 1, toX: 2, toY: 3 }
    // c7c5
  ],
  "e2e4 c7c5 g1f3 d7d6": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 2, fromY: 1, toX: 2, toY: 3 },
    // c7c5
    { fromX: 6, fromY: 7, toX: 5, toY: 5 },
    // g1f3
    { fromX: 3, fromY: 1, toX: 3, toY: 2 }
    // d7d6
  ],
  // Gambit de la Reine
  "d2d4 d7d5 c2c4": [
    { fromX: 3, fromY: 6, toX: 3, toY: 4 },
    // d2d4
    { fromX: 3, fromY: 1, toX: 3, toY: 3 },
    // d7d5
    { fromX: 2, fromY: 6, toX: 2, toY: 4 }
    // c2c4
  ],
  // Défense Caro-Kann
  "e2e4 c7c6": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 2, fromY: 1, toX: 2, toY: 2 }
    // c7c6
  ],
  "e2e4 c7c6 d2d4 d7d5": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 2, fromY: 1, toX: 2, toY: 2 },
    // c7c6
    { fromX: 3, fromY: 6, toX: 3, toY: 4 },
    // d2d4
    { fromX: 3, fromY: 1, toX: 3, toY: 3 }
    // d7d5
  ],
  // Défense Française
  "e2e4 e7e6": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 2 }
    // e7e6
  ],
  "e2e4 e7e6 d2d4 d7d5": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 2 },
    // e7e6
    { fromX: 3, fromY: 6, toX: 3, toY: 4 },
    // d2d4
    { fromX: 3, fromY: 1, toX: 3, toY: 3 }
    // d7d5
  ],
  // Partie Italienne
  "e2e4 e7e5 g1f3 b8c6 f1c4": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 3 },
    // e7e5
    { fromX: 6, fromY: 7, toX: 5, toY: 5 },
    // g1f3
    { fromX: 1, fromY: 0, toX: 2, toY: 2 },
    // b8c6
    { fromX: 5, fromY: 7, toX: 2, toY: 4 }
    // f1c4
  ],
  // Défense Alekhine
  "e2e4 g8f6": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 6, fromY: 0, toX: 5, toY: 2 }
    // g8f6
  ],
  // Défense Pirc
  "e2e4 d7d6": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 3, fromY: 1, toX: 3, toY: 2 }
    // d7d6
  ],
  // Partie Écossaise
  "e2e4 e7e5 g1f3 b8c6 d2d4": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 3 },
    // e7e5
    { fromX: 6, fromY: 7, toX: 5, toY: 5 },
    // g1f3
    { fromX: 1, fromY: 0, toX: 2, toY: 2 },
    // b8c6
    { fromX: 3, fromY: 6, toX: 3, toY: 4 }
    // d2d4
  ],
  // Gambit du Roi
  "e2e4 e7e5 f2f4": [
    { fromX: 4, fromY: 6, toX: 4, toY: 4 },
    // e2e4
    { fromX: 4, fromY: 1, toX: 4, toY: 3 },
    // e7e5
    { fromX: 5, fromY: 6, toX: 5, toY: 4 }
    // f2f4
  ],
  // Ouverture anglaise
  c2c4: [
    { fromX: 2, fromY: 6, toX: 2, toY: 4 }
    // c2c4
  ],
  // Ouverture Réti
  "g1f3 d7d5": [
    { fromX: 6, fromY: 7, toX: 5, toY: 5 },
    // g1f3
    { fromX: 3, fromY: 1, toX: 3, toY: 3 }
    // d7d5
  ]
};

class AI {
  // Heuristic des coups efficaces
  constructor(color, maxTime = 5e3) {
    this.color = color;
    this.transpositionTable = /* @__PURE__ */ new Map();
    this.maxTime = maxTime;
    this.killerMoves = /* @__PURE__ */ new Map();
    this.startTime = 0;
  }
  openingMoves = openingBook;
  transpositionTable;
  // Table de transposition
  maxTime;
  // Temps maximum de réflexion en millisecondes
  startTime;
  // Temps de début pour gestion du temps
  killerMoves;
  // Méthode principale pour faire un mouvement
  makeMove(board) {
    const openingMove = this.getOpeningMove(board);
    if (openingMove) {
      return openingMove;
    }
    const endgameMove = this.useEndgameTablebase(board);
    if (endgameMove) {
      return endgameMove;
    }
    if (this.shouldUseMCTS(board)) {
      return this.mcts(board);
    }
    let bestMove = null;
    let bestValue = -Infinity;
    const maxDepth = 10;
    this.startTime = Date.now();
    for (let depth = 1; depth <= maxDepth; depth++) {
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);
      for (const move of moves) {
        const piece = board.getPiece(move.fromX, move.fromY);
        if (!piece) continue;
        const originalPiece = board.getPiece(move.toX, move.toY);
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const isCritical = board.isKingInCheck(this.color) || this.isCriticalMove(piece, move, board);
        const adjustedDepth = isCritical ? depth + 1 : depth;
        const boardValue = this.minimax(
          board,
          adjustedDepth - 1,
          -Infinity,
          Infinity,
          false
        );
        board.setPiece(move.fromX, move.fromY, piece);
        board.setPiece(move.toX, move.toY, originalPiece);
        if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
        if (Date.now() - this.startTime > this.maxTime) {
          break;
        }
      }
      if (Date.now() - this.startTime > this.maxTime) {
        break;
      }
    }
    return bestMove;
  }
  // Fonction Minimax avec Alpha-Beta Pruning et table de transposition
  minimax(board, depth, alpha, beta, isMaximizing) {
    const boardKey = board.toString();
    if (Date.now() - this.startTime > this.maxTime) {
      return evaluateBoard(board, this.color);
    }
    if (this.transpositionTable.has(boardKey)) {
      return this.transpositionTable.get(boardKey);
    }
    if (depth > 1 && !board.isKingInCheck(this.color)) {
      const nullMoveEval = -this.minimax(
        board,
        depth - 2,
        -beta,
        -alpha,
        !isMaximizing
      );
      if (nullMoveEval >= beta) {
        return beta;
      }
    }
    if (depth === 0 || board.isCheckmate(this.color) || board.isCheckmate(this.getOpponentColor()) || Date.now() - this.startTime > this.maxTime) {
      const evaluation = this.quiescenceSearch(board, alpha, beta);
      this.transpositionTable.set(boardKey, evaluation);
      return evaluation;
    }
    if (isMaximizing) {
      let maxEval = -Infinity;
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);
        const shouldReduce = i > 3 && depth > 2;
        const newDepth = shouldReduce ? depth - 1 : depth;
        const isCheck = board.isKingInCheck(this.color);
        const isPawnPush = fromPiece && fromPiece.type === PieceType.PAWN && (move.toY === 0 || move.toY === 7);
        const extendedDepth = isCheck || isPawnPush ? newDepth + 1 : newDepth;
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const evaluation = this.minimax(
          board,
          extendedDepth - 1,
          alpha,
          beta,
          false
        );
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) {
          this.addKillerMove(depth, move);
          break;
        }
      }
      this.transpositionTable.set(boardKey, maxEval);
      return maxEval;
    } else {
      let minEval = Infinity;
      let moves = this.getAllValidMoves(board);
      moves = this.sortMoves(moves, board, depth);
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const fromPiece = board.getPiece(move.fromX, move.fromY);
        const toPiece = board.getPiece(move.toX, move.toY);
        const shouldReduce = i > 3 && depth > 2;
        const newDepth = shouldReduce ? depth - 1 : depth;
        const isCheck = board.isKingInCheck(this.getOpponentColor());
        const isPawnPush = fromPiece && fromPiece.type === PieceType.PAWN && (move.toY === 0 || move.toY === 7);
        const extendedDepth = isCheck || isPawnPush ? newDepth + 1 : newDepth;
        board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        const evaluation = this.minimax(
          board,
          extendedDepth - 1,
          alpha,
          beta,
          true
        );
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) {
          this.addKillerMove(depth, move);
          break;
        }
      }
      this.transpositionTable.set(boardKey, minEval);
      return minEval;
    }
  }
  // Ajout d'un coup prometteur dans les killer moves
  addKillerMove(depth, move) {
    const killers = this.killerMoves.get(depth) || [];
    const existingMove = killers.find(
      (k) => k.move.fromX === move.fromX && k.move.fromY === move.fromY && k.move.toX === move.toX && k.move.toY === move.toY
    );
    if (existingMove) {
      existingMove.score += 1;
    } else {
      killers.push({ move, score: 1 });
    }
    killers.sort((a, b) => b.score - a.score);
    this.killerMoves.set(depth, killers);
  }
  // Recherche de quiescence pour améliorer l'évaluation des positions
  quiescenceSearch(board, alpha, beta, depth = 0) {
    const maxQuiescenceDepth = 10;
    if (depth >= maxQuiescenceDepth) {
      return evaluateBoard(board, this.color);
    }
    const standPat = evaluateBoard(board, this.color);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
    const moves = this.getAllValidMoves(board).filter(
      (move) => board.isCapture(move.fromX, move.fromY, move.toX, move.toY)
    );
    for (const move of moves) {
      const fromPiece = board.getPiece(move.fromX, move.fromY);
      const toPiece = board.getPiece(move.toX, move.toY);
      board.movePiece(move.fromX, move.fromY, move.toX, move.toY);
      const kingSafe = !board.isKingInCheck(this.color);
      if (kingSafe) {
        const score = -this.quiescenceSearch(board, -beta, -alpha, depth + 1);
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      } else {
        board.setPiece(move.fromX, move.fromY, fromPiece);
        board.setPiece(move.toX, move.toY, toPiece);
      }
    }
    return alpha;
  }
  getOpponentColor() {
    return this.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  }
  getAllValidMoves(board) {
    const validMoves = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);
        if (piece && piece.color === this.color) {
          const moves = board.getValidMoves(x, y);
          for (const move of moves) {
            if (board.isMoveValid(x, y, move.x, move.y)) {
              const originalPiece = board.getPiece(move.x, move.y);
              board.setPiece(move.x, move.y, piece);
              board.setPiece(x, y, null);
              const kingSafe = !board.isKingInCheck(this.color);
              board.setPiece(x, y, piece);
              board.setPiece(move.x, move.y, originalPiece);
              if (kingSafe) {
                validMoves.push({
                  fromX: x,
                  fromY: y,
                  toX: move.x,
                  toY: move.y
                });
              }
            }
          }
        }
      }
    }
    return validMoves;
  }
  sortMoves(moves, board, depth) {
    return moves.sort((a, b) => {
      const killerMovesAtDepth = this.killerMoves.get(depth);
      if (killerMovesAtDepth && killerMovesAtDepth.some(
        (move) => move.move.fromX === a.fromX && move.move.fromY === a.fromY
      )) {
        return -1;
      }
      const pieceA = board.getPiece(a.toX, a.toY);
      const pieceB = board.getPiece(b.toX, b.toY);
      if (pieceA && !pieceB) return -1;
      if (!pieceA && pieceB) return 1;
      const centerControlA = centerControlBonus[`${a.toX},${a.toY}`] || 0;
      const centerControlB = centerControlBonus[`${b.toX},${b.toY}`] || 0;
      return centerControlB - centerControlA;
    });
  }
  // Algorithme MCTS pour évaluer des positions complexes ou de fin de partie
  mcts(board) {
    const iterations = 1e3;
    const moveScores = /* @__PURE__ */ new Map();
    const validMoves = this.getAllValidMoves(board);
    for (let i = 0; i < iterations; i++) {
      const move = validMoves[Math.floor(Math.random() * validMoves.length)];
      if (!move || move.fromX === void 0 || move.fromY === void 0 || move.toX === void 0 || move.toY === void 0) {
        continue;
      }
      const simulationResult = this.simulateRandomGame(board, move);
      const moveKey = `${move.fromX},${move.fromY},${move.toX},${move.toY}`;
      moveScores.set(
        moveKey,
        (moveScores.get(moveKey) || 0) + simulationResult
      );
    }
    if (moveScores.size === 0) {
      return null;
    }
    const bestMoveKey = Array.from(moveScores.entries()).reduce(
      (best, current) => {
        return current[1] > best[1] ? current : best;
      }
    )[0];
    const [fromX, fromY, toX, toY] = bestMoveKey.split(",").map(Number);
    return { fromX, fromY, toX, toY };
  }
  // Simule une partie aléatoire pour obtenir une estimation du résultat
  simulateRandomGame(board, move) {
    if (!move || move.fromX === void 0 || move.fromY === void 0 || move.toX === void 0 || move.toY === void 0) {
      console.error("Invalid move:", move);
      return 0;
    }
    const tempBoard = board.clone();
    tempBoard.movePiece(move.fromX, move.fromY, move.toX, move.toY);
    let currentPlayer = this.color;
    let moves = this.getAllValidMoves(tempBoard);
    while (!tempBoard.isGameOver() && moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      if (!randomMove || randomMove.fromX === void 0 || randomMove.fromY === void 0 || randomMove.toX === void 0 || randomMove.toY === void 0) {
        console.error("Invalid random move:", randomMove);
        break;
      }
      tempBoard.movePiece(
        randomMove.fromX,
        randomMove.fromY,
        randomMove.toX,
        randomMove.toY
      );
      currentPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
      moves = this.getAllValidMoves(tempBoard);
    }
    return tempBoard.getWinner() === this.color ? 1 : tempBoard.getWinner() === null ? 0.5 : 0;
  }
  // Détermine quand utiliser MCTS
  shouldUseMCTS(board) {
    return board.getPieceCount() <= 10;
  }
  // Fonction de détection et d'application des tables de fin de partie
  useEndgameTablebase(board) {
    if (board.getPieceCount() <= 4) {
      return getEndgameMove(board, this.color);
    }
    return null;
  }
  // Fonction pour identifier les mouvements critiques
  isCriticalMove(piece, move, board) {
    const targetPiece = board.getPiece(move.toX, move.toY);
    return targetPiece && targetPiece.color !== piece.color || board.isKingInCheck(piece.color);
  }
  // Méthode pour trouver le mouvement d'ouverture
  getOpeningMove(board) {
    const boardHash = this.getBoardHash(board);
    if (this.openingMoves[boardHash]) {
      return this.openingMoves[boardHash][0];
    }
    return null;
  }
  // Génération d'un identifiant de position simplifié pour le dictionnaire d'ouverture
  getBoardHash(board) {
    let hash = "";
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board.getPiece(x, y);
        if (piece) {
          const pieceCode = piece.color === PieceColor.WHITE ? piece.type : piece.type.toLowerCase();
          hash += pieceCode + x + y + " ";
        }
      }
    }
    return hash.trim();
  }
}

const ai = new AI(PieceColor.BLACK);
self.onmessage = async (event) => {
  const { boardData } = event.data;
  const board = await Board.fromData(boardData);
  const bestMove = ai.makeMove(board);
  let captureData = null;
  if (bestMove && board.isCapture(bestMove.fromX, bestMove.fromY, bestMove.toX, bestMove.toY)) {
    const targetPiece = board.getPiece(bestMove.toX, bestMove.toY);
    if (targetPiece) {
      captureData = {
        capturedWhite: [],
        capturedBlack: []
      };
      if (targetPiece.color === PieceColor.WHITE) {
        captureData.capturedWhite.push(targetPiece.type);
      } else {
        captureData.capturedBlack.push(targetPiece.type);
      }
    }
  }
  self.postMessage({ bestMove, captureData });
};

export { Piece as P, PieceType as a, PieceColor as b, createPiece as c };
//# sourceMappingURL=ai.worker-CqXe2Zdt.js.map
