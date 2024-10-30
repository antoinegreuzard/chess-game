true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

const scriptRel = 'modulepreload';const assetsURL = function(dep) { return "/chess-game/"+dep };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (true && deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};

async function createPiece(type, color) {
  switch (type) {
    case PieceType.PAWN:
      const { Pawn } = await __vitePreload(async () => { const { Pawn } = await Promise.resolve().then(() => pawn);return { Pawn }},true?void 0:void 0);
      return new Pawn(color);
    case PieceType.ROOK:
      const { Rook } = await __vitePreload(async () => { const { Rook } = await Promise.resolve().then(() => rook);return { Rook }},true?void 0:void 0);
      return new Rook(color);
    case PieceType.KNIGHT:
      const { Knight } = await __vitePreload(async () => { const { Knight } = await Promise.resolve().then(() => knight);return { Knight }},true?void 0:void 0);
      return new Knight(color);
    case PieceType.BISHOP:
      const { Bishop } = await __vitePreload(async () => { const { Bishop } = await Promise.resolve().then(() => bishop);return { Bishop }},true?void 0:void 0);
      return new Bishop(color);
    case PieceType.QUEEN:
      const { Queen } = await __vitePreload(async () => { const { Queen } = await Promise.resolve().then(() => queen);return { Queen }},true?void 0:void 0);
      return new Queen(color);
    case PieceType.KING:
      const { King } = await __vitePreload(async () => { const { King } = await Promise.resolve().then(() => king);return { King }},true?void 0:void 0);
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
function showMessage(message) {
  const gameMessageElement = document.getElementById(
    "gameMessage"
  );
  gameMessageElement.textContent = message;
  gameMessageElement.style.display = "block";
}
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

class Game {
  board;
  aiWorker;
  constructor() {
    this.board = new Board();
    this.aiWorker = new Worker(new URL(/* @vite-ignore */ "/chess-game/assets/ai.worker-CqXe2Zdt.js", import.meta.url), {
      type: "module"
    });
  }
  async getBoard() {
    await this.board.init();
    return this.board;
  }
  makeAIMove() {
    return new Promise((resolve) => {
      this.aiWorker.onmessage = (event) => {
        const { bestMove, captureData } = event.data;
        if (bestMove) {
          const wasMoved = this.board.movePiece(
            bestMove.fromX,
            bestMove.fromY,
            bestMove.toX,
            bestMove.toY
          );
          if (wasMoved && captureData) {
            captureData.capturedWhite.forEach(
              (piece) => updateCapturedPieces(piece, PieceColor.WHITE)
            );
            captureData.capturedBlack.forEach(
              (piece) => updateCapturedPieces(piece, PieceColor.BLACK)
            );
          }
        }
        resolve();
      };
      const boardData = this.board.toData();
      this.aiWorker.postMessage({ boardData });
    });
  }
}

class CanvasRenderer {
  constructor(board, canvasId, moveHandler) {
    this.board = board;
    this.moveHandler = moveHandler;
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.tileSize = this.canvas.width / 8;
    this.canvas.style.cursor = "default";
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }
  canvas;
  context;
  tileSize;
  draggingPiece = null;
  startX = null;
  startY = null;
  highlightedMoves = [];
  kingInCheckPosition = null;
  // Animation pour déplacer une pièce
  animateMove(fromX, fromY, toX, toY, piece) {
    const frames = 10;
    let currentFrame = 0;
    const startX = fromX * this.tileSize;
    const startY = fromY * this.tileSize;
    const deltaX = (toX - fromX) * this.tileSize / frames;
    const deltaY = (toY - fromY) * this.tileSize / frames;
    const animate = () => {
      if (currentFrame <= frames) {
        this.drawBoard();
        this.context.fillStyle = piece.color === PieceColor.WHITE ? "white" : "black";
        this.context.font = "48px Arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(
          this.getPieceText(piece),
          startX + deltaX * currentFrame + this.tileSize / 2,
          startY + deltaY * currentFrame + this.tileSize / 2
        );
        currentFrame++;
        requestAnimationFrame(animate);
      } else {
        this.drawBoard();
      }
    };
    animate();
  }
  // Surligne les mouvements valides pour une pièce sélectionnée
  highlightValidMoves(moves) {
    this.context.fillStyle = "rgba(0, 255, 0, 0.5)";
    moves.forEach((move) => {
      this.context.fillRect(
        move.x * this.tileSize,
        move.y * this.tileSize,
        this.tileSize,
        this.tileSize
      );
    });
  }
  // Dessiner l'échiquier et les pièces
  drawBoard() {
    const kingInCheck = this.board.getKingInCheck();
    this.kingInCheckPosition = kingInCheck ? { x: kingInCheck.x, y: kingInCheck.y } : null;
    this.drawTiles();
    this.drawPieces();
  }
  // Dessiner les cases de l'échiquier
  drawTiles() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const isDarkTile = (x + y) % 2 === 1;
        let tileColor = isDarkTile ? "#769656" : "#eeeed2";
        if (this.kingInCheckPosition && this.kingInCheckPosition.x === x && this.kingInCheckPosition.y === y) {
          tileColor = "#ff6347";
        }
        this.context.fillStyle = tileColor;
        this.context.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
  }
  // Dessiner toutes les pièces sur l'échiquier
  drawPieces() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.board.getPiece(x, y);
        if (piece) {
          this.drawPiece(piece, x, y);
        }
      }
    }
  }
  // Dessiner une pièce spécifique
  drawPiece(piece, x, y) {
    this.context.fillStyle = piece.color === "white" ? "white" : "black";
    this.context.font = "48px Arial";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    const pieceText = this.getPieceText(piece);
    this.context.fillText(
      pieceText,
      x * this.tileSize + this.tileSize / 2,
      y * this.tileSize + this.tileSize / 2
    );
  }
  // Convertir le type de pièce en texte pour affichage
  getPieceText(piece) {
    switch (piece.type) {
      case "pawn":
        return piece.color === "white" ? "♙" : "♟";
      case "rook":
        return piece.color === "white" ? "♖" : "♜";
      case "knight":
        return piece.color === "white" ? "♘" : "♞";
      case "bishop":
        return piece.color === "white" ? "♗" : "♝";
      case "queen":
        return piece.color === "white" ? "♕" : "♛";
      case "king":
        return piece.color === "white" ? "♔" : "♚";
      default:
        return "";
    }
  }
  // Gérer le début du glissement
  handleMouseDown(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);
    const piece = this.board.getPiece(x, y);
    if (piece) {
      this.draggingPiece = piece;
      this.startX = x;
      this.startY = y;
      this.canvas.style.cursor = "grabbing";
      this.highlightedMoves = this.board.getValidMoves(x, y);
      this.drawBoard();
      this.highlightValidMoves(this.highlightedMoves);
    }
  }
  // Gérer le mouvement pendant le glissement
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);
    let piece = null;
    if (this.board.isWithinBounds(x, y)) piece = this.board.getPiece(x, y);
    if (piece && !this.draggingPiece) {
      this.canvas.style.cursor = "pointer";
    } else if (!this.draggingPiece) {
      this.canvas.style.cursor = "default";
    }
    if (!this.draggingPiece) return;
    this.drawBoard();
    this.highlightValidMoves(this.highlightedMoves);
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    this.context.fillStyle = this.draggingPiece.color === "white" ? "white" : "black";
    this.context.font = "48px Arial";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    const pieceText = this.getPieceText(this.draggingPiece);
    this.context.fillText(pieceText, mouseX, mouseY);
  }
  // Gérer la fin du glissement
  handleMouseUp(event) {
    if (!this.draggingPiece || this.startX === null || this.startY === null)
      return;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);
    const moveSuccessful = this.moveHandler(this.startX, this.startY, x, y);
    this.draggingPiece = null;
    this.startX = null;
    this.startY = null;
    this.canvas.style.cursor = "default";
    this.highlightedMoves = [];
    this.drawBoard();
    if (moveSuccessful) {
      this.drawBoard();
    }
  }
}

class Timer {
  constructor(initialTime, onTimeUpdate) {
    this.initialTime = initialTime;
    this.currentTime = initialTime;
    this.onTimeUpdate = onTimeUpdate;
  }
  intervalId = null;
  currentTime;
  onTimeUpdate;
  isRunning = false;
  // Démarrer le compte à rebours
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = window.setInterval(() => {
      this.currentTime--;
      this.onTimeUpdate(this.currentTime);
      if (this.currentTime <= 0) {
        this.currentTime = 0;
        this.stop();
        this.onTimeUpdate(this.currentTime);
      }
    }, 1e3);
  }
  // Arrêter le compte à rebours
  stop() {
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
  reset(time) {
    this.stop();
    this.currentTime = time;
    this.onTimeUpdate(this.currentTime);
    this.start();
  }
}

const game = new Game();
const board = await game.getBoard();
const moveHistoryElement = document.getElementById(
  "moveHistory"
);
const currentTurnElement = document.getElementById(
  "currentTurn"
);
const timerElement = document.getElementById("timer");
const passTurnButton = document.getElementById(
  "passTurnButton"
);
const gameMessageElement = document.getElementById(
  "gameMessage"
);
const replayButton = document.getElementById(
  "replayButton"
);
let currentPlayer = PieceColor.WHITE;
let gameState = "playing";
let hasMoved = false;
let moveHistory = [[]];
let isGameEnded = false;
let isAITurn = false;
let whiteTimer = new Timer(
  60,
  (timeLeft) => updateTimerDisplay(timeLeft, PieceColor.WHITE)
);
let blackTimer = new Timer(
  60,
  (timeLeft) => updateTimerDisplay(timeLeft, PieceColor.BLACK)
);
function updateTimerDisplay(timeLeft, color) {
  if (color === currentPlayer) {
    timerElement.textContent = `Temps restant: ${timeLeft}s`;
    if (timeLeft <= 0 && !isGameEnded) {
      endGame(
        `${currentPlayer === PieceColor.WHITE ? "Noir" : "Blanc"} gagne par temps écoulé !`
      );
    }
  }
}
const renderer = new CanvasRenderer(board, "chessBoard", handleMove);
renderer.drawBoard();
whiteTimer.start();
function endGame(message) {
  showMessage(message);
  isGameEnded = true;
  replayButton.style.display = "block";
  if (whiteTimer.isRunning) whiteTimer.stop();
  if (blackTimer.isRunning) blackTimer.stop();
}
function clearMessage() {
  gameMessageElement.textContent = "";
  gameMessageElement.style.display = "none";
}
async function updateTurn() {
  clearMessage();
  currentPlayer = currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  currentTurnElement.textContent = `Tour actuel: ${currentPlayer === PieceColor.WHITE ? "Blanc" : "Noir"}`;
  hasMoved = false;
  passTurnButton.disabled = currentPlayer === PieceColor.BLACK;
  if (currentPlayer === PieceColor.WHITE) {
    if (blackTimer.isRunning) blackTimer.stop();
    whiteTimer.reset(60);
  } else {
    if (whiteTimer.isRunning) whiteTimer.stop();
    blackTimer.reset(60);
  }
  if (board.isKingInCheck(PieceColor.BLACK) || board.isKingInCheck(PieceColor.WHITE)) {
    if (board.isCheckmate(PieceColor.BLACK)) {
      endGame("Échec et Mat ! Blanc gagne !");
    }
    if (board.isCheckmate(PieceColor.WHITE)) {
      endGame("Échec et Mat ! Noir gagne !");
    }
  }
  if (board.isStalemate(currentPlayer)) {
    endGame("Pat ! La partie est nulle.");
  }
  if (board.isInsufficientMaterial()) {
    endGame("Matériel insuffisant pour continuer, partie nulle !");
  }
  if (board.isFiftyMoveRule()) {
    endGame("Règle des 50 coups, partie nulle !");
  }
  if (gameState === "playing") {
    gameState = "playing";
  }
  moveHistory.push([]);
  if (currentPlayer === PieceColor.BLACK) {
    await triggerAIMove();
  }
}
async function triggerAIMove() {
  isAITurn = true;
  await game.makeAIMove();
  renderer.drawBoard();
  isAITurn = false;
  await updateTurn();
}
function addMoveToHistory(fromX, fromY, toX, toY, pieceType) {
  const moveText = `${getPieceSymbol(pieceType, PieceColor.WHITE)} de (${fromX}, ${fromY}) à (${toX}, ${toY})`;
  const listItem = document.createElement("li");
  listItem.textContent = moveText;
  moveHistoryElement.appendChild(listItem);
  moveHistory[moveHistory.length - 1].push({
    fromX,
    fromY,
    toX,
    toY,
    pieceType
  });
}
function handleMove(fromX, fromY, toX, toY) {
  if (gameState === "waiting" || hasMoved || isGameEnded) {
    showMessage("Veuillez attendre le prochain tour !");
    return false;
  }
  const piece = board.getPiece(fromX, fromY);
  const targetPiece = board.getPiece(toX, toY);
  if (!piece || piece.color !== currentPlayer) {
    if (!isAITurn) {
      showMessage(
        `C'est le tour de ${currentPlayer === PieceColor.WHITE ? "Blanc" : "Noir"}`
      );
    }
    return false;
  }
  if (piece.isValidMove(fromX, fromY, toX, toY, board)) {
    if (board.movePiece(fromX, fromY, toX, toY)) {
      hasMoved = true;
      if (targetPiece) {
        updateCapturedPieces(targetPiece.type, targetPiece.color);
      }
      addMoveToHistory(fromX, fromY, toX, toY, piece.type);
      renderer.animateMove(fromX, fromY, toX, toY, piece);
      updateTurn();
      return true;
    }
    showMessage("Mouvement invalide !");
  }
  return false;
}
if (passTurnButton) {
  passTurnButton.addEventListener("click", async (event) => {
    event.preventDefault();
    if (gameState === "playing" && currentPlayer === PieceColor.WHITE && !board.isKingInCheck(PieceColor.WHITE)) {
      showMessage(
        `Tour passé pour ${currentPlayer === PieceColor.WHITE ? "Blanc" : "Noir"}`
      );
      await updateTurn();
    }
  });
}
if (replayButton) {
  replayButton.addEventListener("click", () => {
    location.reload();
  });
}

class Pawn extends Piece {
  hasMoved = false;
  constructor(color) {
    super(color, PieceType.PAWN);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    const direction = this.color === PieceColor.WHITE ? 1 : -1;
    const startRow = this.color === PieceColor.WHITE ? 1 : 6;
    const distanceY = (toY - fromY) * direction;
    const distanceX = Math.abs(toX - fromX);
    if (distanceX === 0 && distanceY === 1 && !board.getPiece(toX, toY)) {
      if ((this.color === PieceColor.WHITE && toY === 7 || this.color === PieceColor.BLACK && toY === 0) && board.getPiece(fromX, fromY)?.type === PieceType.PAWN) {
        this.handlePromotion(toX, toY, board);
      }
      return true;
    }
    if (distanceX === 0 && distanceY === 2 && fromY === startRow && !board.getPiece(toX, toY) && !board.getPiece(fromX, fromY + direction)) {
      board.updateEnPassantTarget(fromX, fromY, toX, toY, this);
      return true;
    }
    if (distanceX === 1 && distanceY === 1) {
      if (board.getPiece(toX, toY) && this.canCapture(toX, toY, board)) {
        if (this.color === PieceColor.WHITE && toY === 7 || this.color === PieceColor.BLACK && toY === 0 && board.getPiece(fromX, fromY)?.type === PieceType.PAWN) {
          this.handlePromotion(toX, toY, board);
        }
        return true;
      }
      if (board.isEnPassantMove(fromX, fromY, toX, toY)) {
        return true;
      }
    }
    return false;
  }
  handlePromotion(toX, toY, board) {
    const promotionDialog = document.getElementById(
      "promotionDialog"
    );
    if (promotionDialog) {
      promotionDialog.style.display = "block";
      window.promote = (pieceType) => {
        promotionDialog.style.display = "none";
        board.promotePawn(toX, toY, pieceType);
      };
    }
  }
}

const pawn = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Pawn
}, Symbol.toStringTag, { value: 'Module' }));

class Rook extends Piece {
  type = PieceType.ROOK;
  hasMoved = false;
  constructor(color) {
    super(color, PieceType.ROOK);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    const isStraightMove = fromX === toX || fromY === toY;
    if (!isStraightMove) {
      return false;
    }
    const isPathClear = this.isPathClear(fromX, fromY, toX, toY, board);
    if (!isPathClear) {
      return false;
    }
    return this.canCapture(toX, toY, board);
  }
  toData() {
    return {
      ...super.toData(),
      hasMoved: this.hasMoved
    };
  }
  // Ajuste le type de retour pour inclure Promise<Rook>
  static async fromData(data) {
    const rook = await createPiece(PieceType.ROOK, data.color);
    rook.hasMoved = data.hasMoved;
    return rook;
  }
}

const rook = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Rook
}, Symbol.toStringTag, { value: 'Module' }));

class Knight extends Piece {
  constructor(color) {
    super(color, PieceType.KNIGHT);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return (dx === 2 && dy === 1 || dx === 1 && dy === 2) && this.canCapture(toX, toY, board);
  }
}

const knight = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Knight
}, Symbol.toStringTag, { value: 'Module' }));

class Bishop extends Piece {
  constructor(color) {
    super(color, PieceType.BISHOP);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    if (Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
      if (this.isPathClear(fromX, fromY, toX, toY, board)) {
        return this.canCapture(toX, toY, board);
      }
    }
    return false;
  }
}

const bishop = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Bishop
}, Symbol.toStringTag, { value: 'Module' }));

class Queen extends Piece {
  constructor(color) {
    super(color, PieceType.QUEEN);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    if (fromX === toX || // Déplacement en colonne
    fromY === toY || // Déplacement en ligne
    Math.abs(toX - fromX) === Math.abs(toY - fromY)) {
      if (this.isPathClear(fromX, fromY, toX, toY, board)) {
        return this.canCapture(toX, toY, board);
      }
    }
    return false;
  }
}

const queen = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Queen
}, Symbol.toStringTag, { value: 'Module' }));

class King extends Piece {
  hasMoved = false;
  type = PieceType.KING;
  constructor(color) {
    super(color, PieceType.KING);
  }
  isValidMove(fromX, fromY, toX, toY, board) {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    if (dx <= 1 && dy <= 1) {
      return this.canCapture(toX, toY, board) && !board.isAdjacentToAnotherKing(toX, toY, this.color);
    }
    if (!this.hasMoved && dy === 0 && dx === 2) {
      const direction = toX > fromX ? 1 : -1;
      const rookX = toX > fromX ? 7 : 0;
      const rook = board.getPiece(rookX, fromY);
      if (rook && rook?.type === PieceType.ROOK && !rook.hasMoved) {
        for (let x = fromX + direction; x !== toX; x += direction) {
          if (board.getPiece(x, fromY) || board.isSquareUnderAttack(x, fromY, this.color)) {
            return false;
          }
        }
        return !board.isSquareUnderAttack(toX, fromY, this.color) && !board.isAdjacentToAnotherKing(toX, toY, this.color);
      }
    }
    return false;
  }
}

const king = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  King
}, Symbol.toStringTag, { value: 'Module' }));
//# sourceMappingURL=bundle.js.map
