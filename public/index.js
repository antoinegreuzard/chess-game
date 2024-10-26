var $ = Object.defineProperty;
var V = (r, e, t) =>
  e in r
    ? $(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (r[e] = t);
var h = (r, e, t) => V(r, typeof e != 'symbol' ? e + '' : e, t);
(function () {
  const e = document.createElement('link').relList;
  if (e && e.supports && e.supports('modulepreload')) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) s(i);
  new MutationObserver((i) => {
    for (const n of i)
      if (n.type === 'childList')
        for (const a of n.addedNodes)
          a.tagName === 'LINK' && a.rel === 'modulepreload' && s(a);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(i) {
    const n = {};
    return (
      i.integrity && (n.integrity = i.integrity),
      i.referrerPolicy && (n.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === 'use-credentials'
        ? (n.credentials = 'include')
        : i.crossOrigin === 'anonymous'
          ? (n.credentials = 'omit')
          : (n.credentials = 'same-origin'),
      n
    );
  }
  function s(i) {
    if (i.ep) return;
    i.ep = !0;
    const n = t(i);
    fetch(i.href, n);
  }
})();
var c = ((r) => ((r.WHITE = 'white'), (r.BLACK = 'black'), r))(c || {}),
  g = ((r) => (
    (r.PAWN = 'pawn'),
    (r.ROOK = 'rook'),
    (r.KNIGHT = 'knight'),
    (r.BISHOP = 'bishop'),
    (r.QUEEN = 'queen'),
    (r.KING = 'king'),
    r
  ))(g || {});
class w {
  constructor(e, t) {
    (this.color = e), (this.type = t);
  }
  isPathClear(e, t, s, i, n) {
    const a = Math.sign(s - e),
      l = Math.sign(i - t);
    let u = e + a,
      o = t + l;
    for (; u !== s || o !== i; ) {
      if (n.getPiece(u, o)) return !1;
      (u += a), (o += l);
    }
    return !0;
  }
  canCapture(e, t, s) {
    const i = s.getPiece(e, t);
    return i !== null && i.color !== this.color;
  }
}
class p extends w {
  constructor(t) {
    super(t, g.ROOK);
    h(this, 'hasMoved', !1);
  }
  isValidMove(t, s, i, n, a) {
    return (t === i || s === n) && this.isPathClear(t, s, i, n, a)
      ? a.getPiece(i, n) === null || this.canCapture(i, n, a)
      : !1;
  }
}
class v extends w {
  constructor(t) {
    super(t, g.KING);
    h(this, 'hasMoved', !1);
  }
  isValidMove(t, s, i, n, a) {
    const l = Math.abs(i - t),
      u = Math.abs(n - s);
    if (l <= 1 && u <= 1) {
      const o = a.getPiece(i, n);
      return !(o && o.type === g.KING);
    }
    if (!this.hasMoved && u === 0 && l === 2) {
      const o = i > t ? 1 : -1,
        I = i > t ? 7 : 0,
        y = a.getPiece(I, s);
      if (y && y instanceof p && !y.hasMoved) {
        for (let m = t + o; m !== I; m += o) if (a.getPiece(m, s)) return !1;
        if (!a.isKingInCheck(this.color)) return !0;
      }
    }
    return !1;
  }
}
class x extends w {
  constructor(e) {
    super(e, g.KNIGHT);
  }
  isValidMove(e, t, s, i) {
    const n = Math.abs(s - e),
      a = Math.abs(i - t);
    return (n === 2 && a === 1) || (n === 1 && a === 2);
  }
}
class B extends w {
  constructor(e) {
    super(e, g.BISHOP);
  }
  isValidMove(e, t, s, i, n) {
    return Math.abs(s - e) === Math.abs(i - t)
      ? this.isPathClear(e, t, s, i, n)
      : !1;
  }
}
class W extends w {
  constructor(e) {
    super(e, g.QUEEN);
  }
  isValidMove(e, t, s, i, n) {
    return e === s || t === i || Math.abs(s - e) === Math.abs(i - t)
      ? this.isPathClear(e, t, s, i, n)
      : !1;
  }
}
class K extends w {
  constructor(e) {
    super(e, g.PAWN);
  }
  isValidMove(e, t, s, i, n) {
    const a = this.color === c.WHITE ? 1 : -1,
      l = this.color === c.WHITE ? 1 : 6,
      u = (i - t) * a,
      o = Math.abs(s - e);
    if (
      (o === 0 && u === 1 && !n.getPiece(s, i)) ||
      (o === 0 &&
        u === 2 &&
        t === l &&
        !n.getPiece(s, i) &&
        !n.getPiece(e, t + a))
    )
      return !0;
    if (o === 1 && u === 1) {
      const I = n.getPiece(s, i);
      if (I && I.color !== this.color) return !0;
    }
    return !1;
  }
}
class G {
  constructor() {
    h(this, 'grid');
    this.grid = this.initializeBoard();
  }
  initializeBoard() {
    const e = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    return (
      (e[0] = [
        new p(c.WHITE),
        new x(c.WHITE),
        new B(c.WHITE),
        new W(c.WHITE),
        new v(c.WHITE),
        new B(c.WHITE),
        new x(c.WHITE),
        new p(c.WHITE),
      ]),
      (e[1] = Array(8)
        .fill(null)
        .map(() => new K(c.WHITE))),
      (e[7] = [
        new p(c.BLACK),
        new x(c.BLACK),
        new B(c.BLACK),
        new W(c.BLACK),
        new v(c.BLACK),
        new B(c.BLACK),
        new x(c.BLACK),
        new p(c.BLACK),
      ]),
      (e[6] = Array(8)
        .fill(null)
        .map(() => new K(c.BLACK))),
      e
    );
  }
  getPiece(e, t) {
    return this.grid[t][e];
  }
  movePiece(e, t, s, i) {
    const n = this.getPiece(e, t);
    if (n && n.isValidMove(e, t, s, i, this)) {
      const a = this.getPiece(s, i);
      return a && a.type === g.KING
        ? !1
        : (a && a.color !== n.color && (this.grid[i][s] = null),
          (this.grid[i][s] = n),
          (this.grid[t][e] = null),
          n instanceof v
            ? ((n.hasMoved = !0),
              Math.abs(s - e) === 2 && this.handleCastling(s, i))
            : n instanceof p && (n.hasMoved = !0),
          !0);
    }
    return !1;
  }
  handleCastling(e, t) {
    if (e === 6) {
      const s = this.getPiece(7, t);
      s instanceof p && ((this.grid[5][t] = s), (this.grid[7][t] = null));
    } else if (e === 2) {
      const s = this.getPiece(0, t);
      s instanceof p && ((this.grid[3][t] = s), (this.grid[0][t] = null));
    }
  }
  isKingInCheck(e) {
    const t = this.findKing(e);
    if (!t) return !1;
    for (let s = 0; s < 8; s++)
      for (let i = 0; i < 8; i++) {
        const n = this.getPiece(i, s);
        if (n && n.color !== e && n.isValidMove(i, s, t.x, t.y, this))
          return !0;
      }
    return !1;
  }
  isCheckmate(e) {
    if (!this.isKingInCheck(e)) return !1;
    for (let t = 0; t < 8; t++)
      for (let s = 0; s < 8; s++) {
        const i = this.getPiece(s, t);
        if (i && i.color === e) {
          for (let n = 0; n < 8; n++)
            for (let a = 0; a < 8; a++)
              if (i.isValidMove(s, t, a, n, this)) {
                const l = this.getPiece(a, n);
                (this.grid[n][a] = i), (this.grid[t][s] = null);
                const u = !this.isKingInCheck(e);
                if (((this.grid[t][s] = i), (this.grid[n][a] = l), u))
                  return !1;
              }
        }
      }
    return !0;
  }
  findKing(e) {
    for (let t = 0; t < 8; t++)
      for (let s = 0; s < 8; s++) {
        const i = this.getPiece(s, t);
        if (i && i instanceof v && i.color === e) return { x: s, y: t };
      }
    return null;
  }
}
class R {
  constructor() {
    h(this, 'board');
    this.board = new G();
  }
  start() {
    console.log("Nouvelle partie d'échecs démarrée !");
  }
  getBoard() {
    return this.board;
  }
}
class q {
  constructor(e, t, s) {
    h(this, 'canvas');
    h(this, 'context');
    h(this, 'tileSize');
    h(this, 'selectedPiece', null);
    (this.board = e),
      (this.moveHandler = s),
      (this.canvas = document.getElementById(t)),
      (this.context = this.canvas.getContext('2d')),
      (this.tileSize = this.canvas.width / 8),
      this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
  }
  drawBoard() {
    this.drawTiles(), this.drawPieces();
  }
  drawTiles() {
    for (let e = 0; e < 8; e++)
      for (let t = 0; t < 8; t++) {
        const s = (t + e) % 2 === 1;
        (this.context.fillStyle = s ? '#769656' : '#eeeed2'),
          this.context.fillRect(
            t * this.tileSize,
            e * this.tileSize,
            this.tileSize,
            this.tileSize,
          );
      }
  }
  drawPieces() {
    for (let e = 0; e < 8; e++)
      for (let t = 0; t < 8; t++) {
        const s = this.board.getPiece(t, e);
        s && this.drawPiece(s, t, e);
      }
  }
  drawPiece(e, t, s) {
    (this.context.fillStyle = e.color === 'white' ? 'white' : 'black'),
      (this.context.font = '48px Arial'),
      (this.context.textAlign = 'center'),
      (this.context.textBaseline = 'middle');
    const i = this.getPieceText(e);
    this.context.fillText(
      i,
      t * this.tileSize + this.tileSize / 2,
      s * this.tileSize + this.tileSize / 2,
    );
  }
  getPieceText(e) {
    switch (e.type) {
      case 'pawn':
        return e.color === 'white' ? '♙' : '♟';
      case 'rook':
        return e.color === 'white' ? '♖' : '♜';
      case 'knight':
        return e.color === 'white' ? '♘' : '♞';
      case 'bishop':
        return e.color === 'white' ? '♗' : '♝';
      case 'queen':
        return e.color === 'white' ? '♕' : '♛';
      case 'king':
        return e.color === 'white' ? '♔' : '♚';
      default:
        return '';
    }
  }
  animateMove(e, t, s, i, n) {
    let l = 0;
    const u = e * this.tileSize,
      o = t * this.tileSize,
      I = ((s - e) * this.tileSize) / 10,
      y = ((i - t) * this.tileSize) / 10,
      m = () => {
        l <= 10
          ? (this.drawBoard(),
            (this.context.fillStyle = n.color === c.WHITE ? 'white' : 'black'),
            (this.context.font = '48px Arial'),
            (this.context.textAlign = 'center'),
            (this.context.textBaseline = 'middle'),
            this.context.fillText(
              this.getPieceText(n),
              u + I * l + this.tileSize / 2,
              o + y * l + this.tileSize / 2,
            ),
            l++,
            requestAnimationFrame(m))
          : this.drawBoard();
      };
    m();
  }
  handleCanvasClick(e) {
    const t = this.canvas.getBoundingClientRect(),
      s = Math.floor((e.clientX - t.left) / this.tileSize),
      i = Math.floor((e.clientY - t.top) / this.tileSize);
    if (this.selectedPiece) {
      const n = this.selectedPiece.x,
        a = this.selectedPiece.y;
      this.moveHandler(n, a, s, i), (this.selectedPiece = null);
    } else this.selectedPiece = { x: s, y: i };
  }
}
class A {
  constructor(e, t) {
    h(this, 'intervalId', null);
    h(this, 'currentTime');
    h(this, 'onTimeUpdate');
    (this.initialTime = e), (this.currentTime = e), (this.onTimeUpdate = t);
  }
  start() {
    this.intervalId = window.setInterval(() => {
      this.currentTime--,
        this.onTimeUpdate(this.currentTime),
        this.currentTime <= 0 && this.stop();
    }, 1e3);
  }
  stop() {
    this.intervalId !== null &&
      (clearInterval(this.intervalId), (this.intervalId = null));
  }
  reset(e) {
    this.stop(), (this.currentTime = e), this.start();
  }
}
const U = new R(),
  T = U.getBoard(),
  D = document.getElementById('moveHistory'),
  F = document.getElementById('currentTurn'),
  Q = document.getElementById('timer'),
  j = document.getElementById('capturedWhite'),
  J = document.getElementById('capturedBlack'),
  Z = document.getElementById('passTurnButton'),
  M = document.getElementById('gameMessage'),
  b = document.getElementById('replayButton');
let d = c.WHITE,
  P = 'playing',
  H = !1,
  S = [],
  k = [],
  E = new A(60, (r) => z(r, c.WHITE)),
  C = new A(60, (r) => z(r, c.BLACK));
function z(r, e) {
  e === d &&
    ((Q.textContent = `Temps restant: ${r}s`),
    r <= 0 &&
      (f(`${d === c.WHITE ? 'Noir' : 'Blanc'} gagne par temps écoulé !`), N()));
}
const L = new q(T, 'chessBoard', te);
L.drawBoard();
E.start();
function N() {
  E.stop(),
    C.stop(),
    (P = 'waiting'),
    f('La partie est terminée !'),
    (b.style.display = 'block');
}
function f(r) {
  (M.textContent = r), (M.style.display = 'block');
}
function _() {
  (M.textContent = ''), (M.style.display = 'none');
}
function O() {
  _(),
    (d = d === c.WHITE ? c.BLACK : c.WHITE),
    (F.textContent = `Tour actuel: ${d === c.WHITE ? 'Blanc' : 'Noir'}`),
    (H = !1),
    d === c.WHITE
      ? (C.stop(), E.reset(60), E.start())
      : (E.stop(), C.reset(60), C.start()),
    (P = 'playing');
}
function X(r, e, t, s, i) {
  const n = `${i} de (${r}, ${e}) à (${t}, ${s})`,
    a = document.createElement('li');
  (a.textContent = n), D.appendChild(a);
}
function Y(r, e) {
  const t = ee(r, e);
  e === c.WHITE
    ? (S.push(t), (j.textContent = S.join(' ')))
    : (k.push(t), (J.textContent = k.join(' ')));
}
function ee(r, e) {
  switch (r) {
    case 'pawn':
      return e === c.WHITE ? '♙' : '♟';
    case 'rook':
      return e === c.WHITE ? '♖' : '♜';
    case 'knight':
      return e === c.WHITE ? '♘' : '♞';
    case 'bishop':
      return e === c.WHITE ? '♗' : '♝';
    case 'queen':
      return e === c.WHITE ? '♕' : '♛';
    case 'king':
      return e === c.WHITE ? '♔' : '♚';
    default:
      return '';
  }
}
function te(r, e, t, s) {
  if (P === 'waiting' || H) {
    f('Veuillez attendre le prochain tour !');
    return;
  }
  const i = T.getPiece(r, e),
    n = T.getPiece(t, s);
  if (!i || i.color !== d) {
    f(`Ce n'est pas le tour de ${d === c.WHITE ? 'Blanc' : 'Noir'}`);
    return;
  }
  if (i.isValidMove(r, e, t, s, T))
    if (T.movePiece(r, e, t, s)) {
      (H = !0),
        n && Y(n.type, n.color),
        X(r, e, t, s, i.type),
        L.animateMove(r, e, t, s, i);
      const a = d === c.WHITE ? c.BLACK : c.WHITE;
      T.isKingInCheck(a) &&
        (T.isCheckmate(a)
          ? (f(`Échec et Mat ! ${d === c.WHITE ? 'Blanc' : 'Noir'} gagne !`),
            N())
          : f(`Échec au ${a === c.WHITE ? 'Blanc' : 'Noir'} !`)),
        (P = 'waiting'),
        O();
    } else f('Mouvement invalide !');
  else f('Mouvement invalide !');
}
Z.addEventListener('click', (r) => {
  r.preventDefault(),
    P === 'playing' &&
      (f(`Tour passé pour ${d === c.WHITE ? 'Blanc' : 'Noir'}`), O());
});
b.addEventListener('click', () => {
  location.reload();
});
//# sourceMappingURL=index.js.map
