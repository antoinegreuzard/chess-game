(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();const U="modulepreload",$=function(o){return"/chess-game/"+o},b={},P=function(t,e,s){let i=Promise.resolve();if(e&&e.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),h=a?.nonce||a?.getAttribute("nonce");i=Promise.allSettled(e.map(l=>{if(l=$(l),l in b)return;b[l]=!0;const d=l.endsWith(".css"),M=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${M}`))return;const p=document.createElement("link");if(p.rel=d?"stylesheet":U,d||(p.as="script"),p.crossOrigin="",p.href=l,h&&p.setAttribute("nonce",h),document.head.appendChild(p),d)return new Promise((E,G)=>{p.addEventListener("load",E),p.addEventListener("error",()=>G(new Error(`Unable to preload CSS for ${l}`)))})}))}function n(a){const h=new Event("vite:preloadError",{cancelable:!0});if(h.payload=a,window.dispatchEvent(h),!h.defaultPrevented)throw a}return i.then(a=>{for(const h of a||[])h.status==="rejected"&&n(h.reason);return t().catch(n)})};async function u(o,t){switch(o){case c.PAWN:const{Pawn:e}=await P(async()=>{const{Pawn:l}=await import("./pawn-Dgz0zvu9.js");return{Pawn:l}},[]);return new e(t);case c.ROOK:const{Rook:s}=await P(async()=>{const{Rook:l}=await import("./rook-QuE8n08B.js");return{Rook:l}},[]);return new s(t);case c.KNIGHT:const{Knight:i}=await P(async()=>{const{Knight:l}=await import("./knight-DbvFb5zK.js");return{Knight:l}},[]);return new i(t);case c.BISHOP:const{Bishop:n}=await P(async()=>{const{Bishop:l}=await import("./bishop-I3o8E6oE.js");return{Bishop:l}},[]);return new n(t);case c.QUEEN:const{Queen:a}=await P(async()=>{const{Queen:l}=await import("./queen-DzdoYk5O.js");return{Queen:l}},[]);return new a(t);case c.KING:const{King:h}=await P(async()=>{const{King:l}=await import("./king-DL6ctWB4.js");return{King:l}},[]);return new h(t);default:throw new Error(`Type de pièce inconnu : ${o}`)}}var r=(o=>(o.WHITE="white",o.BLACK="black",o))(r||{}),c=(o=>(o.PAWN="pawn",o.ROOK="rook",o.KNIGHT="knight",o.BISHOP="bishop",o.QUEEN="queen",o.KING="king",o))(c||{});class O{constructor(t,e){this.color=t,this.type=e}hasMoved=!1;isPathClear(t,e,s,i,n){const a=Math.sign(s-t),h=Math.sign(i-e);let l=t+a,d=e+h;for(;l!==s||d!==i;){if(n.getPiece(l,d)!==null)return!1;l+=a,d+=h}return!0}static isKing(t){return t.type==="king"}canCapture(t,e,s){const i=s.getPiece(t,e);return!i||i.color!==this.color}toData(){return{color:this.color,type:this.type}}static async fromData(t){return await u(t.type,t.color)}async clone(){return await u(this.type,this.color)}}let L=[],R=[];function I(o){const t=document.getElementById("gameMessage");t.textContent=o,t.style.display="block"}function _(o,t){switch(o){case c.PAWN:return t===r.WHITE?"♙":"♟";case c.ROOK:return t===r.WHITE?"♖":"♜";case c.KNIGHT:return t===r.WHITE?"♘":"♞";case c.BISHOP:return t===r.WHITE?"♗":"♝";case c.QUEEN:return t===r.WHITE?"♕":"♛";case c.KING:return t===r.WHITE?"♔":"♚";default:return""}}function v(o,t){const e=_(o,t);t===r.WHITE?L.push(e):R.push(e),q()}function q(){const o=document.getElementById("capturedWhite"),t=document.getElementById("capturedBlack");o&&(o.textContent=L.join(" ")),t&&(t.textContent=R.join(" "))}class T{grid;enPassantTarget=null;halfMoveCount=0;constructor(){this.grid=[]}async init(){this.grid=await this.initializeBoard()}async initializeBoard(){const t=Array(8).fill(null).map(()=>Array(8).fill(null));return t[0]=[await u(c.ROOK,r.WHITE),await u(c.KNIGHT,r.WHITE),await u(c.BISHOP,r.WHITE),await u(c.QUEEN,r.WHITE),await u(c.KING,r.WHITE),await u(c.BISHOP,r.WHITE),await u(c.KNIGHT,r.WHITE),await u(c.ROOK,r.WHITE)],t[1]=await Promise.all(Array(8).fill(null).map(()=>u(c.PAWN,r.WHITE))),t[7]=[await u(c.ROOK,r.BLACK),await u(c.KNIGHT,r.BLACK),await u(c.BISHOP,r.BLACK),await u(c.QUEEN,r.BLACK),await u(c.KING,r.BLACK),await u(c.BISHOP,r.BLACK),await u(c.KNIGHT,r.BLACK),await u(c.ROOK,r.BLACK)],t[6]=await Promise.all(Array(8).fill(null).map(()=>u(c.PAWN,r.BLACK))),t}isWithinBounds(t,e){return t>=0&&t<8&&e>=0&&e<8}getPiece(t,e){return this.grid[e][t]}getValidMoves(t,e){let s=null;if(this.isWithinBounds(t,e)&&(s=this.getPiece(t,e)),!s)return[];const i=[];for(let n=0;n<8;n++)for(let a=0;a<8;a++)s.isValidMove(t,e,a,n,this)&&i.push({x:a,y:n});return i}getKingInCheck(){return this.isKingInCheck(r.WHITE)?this.findKing(r.WHITE):this.isKingInCheck(r.BLACK)?this.findKing(r.BLACK):null}movePiece(t,e,s,i){if(!this.isWithinBounds(t,e)||!this.isWithinBounds(s,i)||["__proto__","constructor","prototype"].includes(e.toString())||["__proto__","constructor","prototype"].includes(i.toString()))return!1;const n=this.getPiece(t,e);if(n&&n.isValidMove(t,e,s,i,this)){const a=this.getPiece(s,i);if(a&&a.type===c.KING)return!1;if(O.isKing(n)&&Math.abs(s-t)===2)return this.isCastlingValid(n,t,e,s)?(this.handleCastling(s,e),!0):!1;if(n?.type===c.PAWN&&this.isEnPassantMove(t,e,s,i)&&this.captureEnPassant(t,e,s,i),this.grid[i][s]=n,this.grid[e][t]=null,this.isKingInCheck(n.color))return this.grid[e][t]=n,this.grid[i][s]=a,!1;"hasMoved"in n&&(n.hasMoved=!0),this.updateEnPassantTarget(t,e,s,i,n),this.halfMoveCount=n.type===c.PAWN||a?0:this.halfMoveCount+1;const h=n.color===r.WHITE?r.BLACK:r.WHITE;return this.isCheckmate(h),!0}return!1}isCastlingValid(t,e,s,i){const n=i>e?1:-1,a=i>e?7:0,h=this.getPiece(a,s);if(h?.type!==c.ROOK||h.hasMoved||t.hasMoved)return!1;for(let l=e+n;l!==i;l+=n)if(this.getPiece(l,s)||this.isSquareUnderAttack(l,s,t.color))return!1;return!this.isSquareUnderAttack(e,s,t.color)&&!this.isSquareUnderAttack(i,s,t.color)}handleCastling(t,e){t===6?this.getPiece(7,e)?.type===c.ROOK&&this.movePiece(7,e,5,e):t===2&&this.getPiece(0,e)?.type===c.ROOK&&this.movePiece(0,e,3,e)}updateEnPassantTarget(t,e,s,i,n){n?.type===c.PAWN&&Math.abs(i-e)===2&&t===s?this.enPassantTarget={x:s,y:(e+i)/2}:this.enPassantTarget=null}captureEnPassant(t,e,s,i){const n=this.getPiece(t,e);if(this.isEnPassantMove(t,e,s,i)&&n?.type===c.PAWN){const a=n.color===r.WHITE?-1:1,h=i+a,l=this.getPiece(s,h);if(l&&l.type===c.PAWN){this.grid[h][s]=null;const d={capturedWhite:[],capturedBlack:[]};return l.color===r.WHITE?d.capturedWhite.push(l.type):d.capturedBlack.push(l.type),v(l.type,l.color),d}}return null}isEnPassantMove(t,e,s,i){return this.enPassantTarget?this.getPiece(t,e)?.type===c.PAWN&&s===this.enPassantTarget.x&&i===this.enPassantTarget.y&&Math.abs(t-s)===1&&Math.abs(e-i)===1:!1}async promotePawn(t,e,s){const i=this.getPiece(t,e)?.color;if(i)switch(s){case"queen":this.grid[e][t]=await u(c.QUEEN,i);break;case"rook":this.grid[e][t]=await u(c.ROOK,i);break;case"bishop":this.grid[e][t]=await u(c.BISHOP,i);break;case"knight":this.grid[e][t]=await u(c.KNIGHT,i);break}}isKingInCheck(t){const e=this.findKing(t);if(!e)return!1;for(let s=0;s<8;s++)for(let i=0;i<8;i++){const n=this.getPiece(i,s);if(n&&n.color!==t&&n.isValidMove(i,s,e.x,e.y,this))return!0}return!1}isCheckmate(t){if(!this.isKingInCheck(t))return!1;for(let e=0;e<8;e++)for(let s=0;s<8;s++){const i=this.getPiece(s,e);if(i&&i.color===t){const n=this.getValidMoves(s,e);for(const a of n){const h=this.getPiece(a.x,a.y);this.grid[a.y][a.x]=i,this.grid[e][s]=null;const l=!this.isKingInCheck(t);if(this.grid[e][s]=i,this.grid[a.y][a.x]=h,l)return!1}}}return!0}isStalemate(t){if(this.isKingInCheck(t))return!1;for(let e=0;e<8;e++)for(let s=0;s<8;s++){const i=this.getPiece(s,e);if(i&&i.color===t){for(let n=0;n<8;n++)for(let a=0;a<8;a++)if(i.isValidMove(s,e,a,n,this)){const h=this.getPiece(a,n);this.grid[n][a]=i,this.grid[e][s]=null;const l=!this.isKingInCheck(t);if(this.grid[e][s]=i,this.grid[n][a]=h,l)return!1}}}return!0}findKing(t){for(let e=0;e<8;e++)for(let s=0;s<8;s++){const i=this.getPiece(s,e);if(i&&i?.type===c.KING&&i.color===t)return{x:s,y:e}}return null}isKing(t,e){return this.getPiece(t,e)?.type===c.KING}isSquareUnderAttack(t,e,s){for(let i=0;i<8;i++)for(let n=0;n<8;n++){const a=this.getPiece(n,i);if(a&&a.color!==s&&a.isValidMove(n,i,t,e,this))return!0}return!1}isInsufficientMaterial(){const t=this.grid.flat().filter(e=>e!==null);return t.length<=2?!0:t.length===3&&t.some(e=>e?.type===c.BISHOP||e?.type===c.KNIGHT)}isFiftyMoveRule(){return this.halfMoveCount>=50}setPiece(t,e,s){this.grid[e][t]=s}isMoveValid(t,e,s,i){const n=this.getPiece(t,e);if(!n||s<0||s>=8||i<0||i>=8||!n.isValidMove(t,e,s,i,this))return!1;const a=this.getPiece(s,i);return!(a&&a.color===n.color)}isCapture(t,e,s,i){const n=this.isWithinBounds(t,e)?this.getPiece(t,e):null,a=this.isWithinBounds(s,i)?this.getPiece(s,i):null;return n!==null&&a!==null&&n.color!==a.color}static async fromData(t){const e=new T;return await e.init(),e.grid=await Promise.all(t.grid.map(async s=>Promise.all(s.map(async i=>i?await O.fromData(i):null)))),e}toData(){return{grid:this.grid.map(t=>t.map(e=>e?e.toData():null))}}isAdjacentToAnotherKing(t,e,s){const i=[{dx:-1,dy:-1},{dx:-1,dy:0},{dx:-1,dy:1},{dx:0,dy:-1},{dx:0,dy:1},{dx:1,dy:-1},{dx:1,dy:0},{dx:1,dy:1}];for(const{dx:n,dy:a}of i){const h=t+n,l=e+a,d=this.isWithinBounds(h,l)?this.getPiece(h,l):null;if(d?.type===c.KING&&d.color!==s)return!0}return!1}clone(){const t=new T;return t.grid=this.grid.map(e=>e.map(s=>s?Object.create(Object.getPrototypeOf(s),Object.getOwnPropertyDescriptors(s)):null)),t.enPassantTarget=this.enPassantTarget?{...this.enPassantTarget}:null,t.halfMoveCount=this.halfMoveCount,t}getPieceCount(){return this.grid.flat().filter(t=>t!==null).length}isGameOver(){return this.isCheckmate(r.WHITE)||this.isCheckmate(r.BLACK)||this.isStalemate(r.WHITE)||this.isStalemate(r.BLACK)||this.isInsufficientMaterial()?!0:this.isFiftyMoveRule()}getWinner(){return this.isCheckmate(r.BLACK)?r.WHITE:this.isCheckmate(r.WHITE)?r.BLACK:(this.isStalemate(r.WHITE)||this.isStalemate(r.BLACK)||this.isInsufficientMaterial()||this.isFiftyMoveRule(),null)}getPieces(){return this.grid.flat().filter(t=>t!==null)}}class j{board;aiWorker;constructor(){this.board=new T,this.aiWorker=new Worker(new URL("/chess-game/assets/ai.worker-CZpNziBD.js",import.meta.url),{type:"module"})}async getBoard(){return await this.board.init(),this.board}makeAIMove(){return new Promise(t=>{this.aiWorker.onmessage=s=>{const{bestMove:i,captureData:n}=s.data;i&&this.board.movePiece(i.fromX,i.fromY,i.toX,i.toY)&&n&&(n.capturedWhite.forEach(h=>v(h,r.WHITE)),n.capturedBlack.forEach(h=>v(h,r.BLACK))),t()};const e=this.board.toData();this.aiWorker.postMessage({boardData:e})})}}class Q{constructor(t,e,s){this.board=t,this.moveHandler=s,this.canvas=document.getElementById(e),this.context=this.canvas.getContext("2d"),this.tileSize=this.canvas.width/8,this.canvas.style.cursor="default",this.canvas.addEventListener("mousedown",this.handleMouseDown.bind(this)),this.canvas.addEventListener("mousemove",this.handleMouseMove.bind(this)),this.canvas.addEventListener("mouseup",this.handleMouseUp.bind(this))}canvas;context;tileSize;draggingPiece=null;startX=null;startY=null;highlightedMoves=[];kingInCheckPosition=null;animateMove(t,e,s,i,n){let h=0;const l=t*this.tileSize,d=e*this.tileSize,M=(s-t)*this.tileSize/10,p=(i-e)*this.tileSize/10,E=()=>{h<=10?(this.drawBoard(),this.context.fillStyle=n.color===r.WHITE?"white":"black",this.context.font="48px Arial",this.context.textAlign="center",this.context.textBaseline="middle",this.context.fillText(this.getPieceText(n),l+M*h+this.tileSize/2,d+p*h+this.tileSize/2),h++,requestAnimationFrame(E)):this.drawBoard()};E()}highlightValidMoves(t){this.context.fillStyle="rgba(0, 255, 0, 0.5)",t.forEach(e=>{this.context.fillRect(e.x*this.tileSize,e.y*this.tileSize,this.tileSize,this.tileSize)})}drawBoard(){const t=this.board.getKingInCheck();this.kingInCheckPosition=t?{x:t.x,y:t.y}:null,this.drawTiles(),this.drawPieces()}drawTiles(){for(let t=0;t<8;t++)for(let e=0;e<8;e++){let i=(e+t)%2===1?"#769656":"#eeeed2";this.kingInCheckPosition&&this.kingInCheckPosition.x===e&&this.kingInCheckPosition.y===t&&(i="#ff6347"),this.context.fillStyle=i,this.context.fillRect(e*this.tileSize,t*this.tileSize,this.tileSize,this.tileSize)}}drawPieces(){for(let t=0;t<8;t++)for(let e=0;e<8;e++){const s=this.board.getPiece(e,t);s&&this.drawPiece(s,e,t)}}drawPiece(t,e,s){this.context.fillStyle=t.color==="white"?"white":"black",this.context.font="48px Arial",this.context.textAlign="center",this.context.textBaseline="middle";const i=this.getPieceText(t);this.context.fillText(i,e*this.tileSize+this.tileSize/2,s*this.tileSize+this.tileSize/2)}getPieceText(t){switch(t.type){case"pawn":return t.color==="white"?"♙":"♟";case"rook":return t.color==="white"?"♖":"♜";case"knight":return t.color==="white"?"♘":"♞";case"bishop":return t.color==="white"?"♗":"♝";case"queen":return t.color==="white"?"♕":"♛";case"king":return t.color==="white"?"♔":"♚";default:return""}}handleMouseDown(t){const e=this.canvas.getBoundingClientRect(),s=Math.floor((t.clientX-e.left)/this.tileSize),i=Math.floor((t.clientY-e.top)/this.tileSize),n=this.board.getPiece(s,i);n&&(this.draggingPiece=n,this.startX=s,this.startY=i,this.canvas.style.cursor="grabbing",this.highlightedMoves=this.board.getValidMoves(s,i),this.drawBoard(),this.highlightValidMoves(this.highlightedMoves))}handleMouseMove(t){const e=this.canvas.getBoundingClientRect(),s=Math.floor((t.clientX-e.left)/this.tileSize),i=Math.floor((t.clientY-e.top)/this.tileSize);let n=null;if(this.board.isWithinBounds(s,i)&&(n=this.board.getPiece(s,i)),n&&!this.draggingPiece?this.canvas.style.cursor="pointer":this.draggingPiece||(this.canvas.style.cursor="default"),!this.draggingPiece)return;this.drawBoard(),this.highlightValidMoves(this.highlightedMoves);const a=t.clientX-e.left,h=t.clientY-e.top;this.context.fillStyle=this.draggingPiece.color==="white"?"white":"black",this.context.font="48px Arial",this.context.textAlign="center",this.context.textBaseline="middle";const l=this.getPieceText(this.draggingPiece);this.context.fillText(l,a,h)}handleMouseUp(t){if(!this.draggingPiece||this.startX===null||this.startY===null)return;const e=this.canvas.getBoundingClientRect(),s=Math.floor((t.clientX-e.left)/this.tileSize),i=Math.floor((t.clientY-e.top)/this.tileSize),n=this.moveHandler(this.startX,this.startY,s,i);this.draggingPiece=null,this.startX=null,this.startY=null,this.canvas.style.cursor="default",this.highlightedMoves=[],this.drawBoard(),n&&this.drawBoard()}}class z{constructor(t,e){this.initialTime=t,this.currentTime=t,this.onTimeUpdate=e}intervalId=null;currentTime;onTimeUpdate;isRunning=!1;start(){this.isRunning||(this.isRunning=!0,this.intervalId=window.setInterval(()=>{this.currentTime--,this.onTimeUpdate(this.currentTime),this.currentTime<=0&&(this.currentTime=0,this.stop(),this.onTimeUpdate(this.currentTime))},1e3))}stop(){this.isRunning&&(this.intervalId!==null&&(clearInterval(this.intervalId),this.intervalId=null),this.isRunning=!1)}reset(t){this.stop(),this.currentTime=t,this.onTimeUpdate(this.currentTime),this.start()}}const D=new j,g=await D.getBoard(),F=document.getElementById("moveHistory"),Z=document.getElementById("currentTurn"),J=document.getElementById("timer"),C=document.getElementById("passTurnButton"),N=document.getElementById("gameMessage"),K=document.getElementById("replayButton");let f=r.WHITE,B="playing",k=!1,W=[[]],H=!1,x=!1,m=new z(60,o=>V(o,r.WHITE)),w=new z(60,o=>V(o,r.BLACK));function V(o,t){t===f&&(J.textContent=`Temps restant: ${o}s`,o<=0&&!H&&y(`${f===r.WHITE?"Noir":"Blanc"} gagne par temps écoulé !`))}const A=new Q(g,"chessBoard",et);A.drawBoard();m.start();function y(o){I(o),H=!0,K.style.display="block",m.isRunning&&m.stop(),w.isRunning&&w.stop()}function X(){N.textContent="",N.style.display="none"}async function S(){X(),f=f===r.WHITE?r.BLACK:r.WHITE,Z.textContent=`Tour actuel: ${f===r.WHITE?"Blanc":"Noir"}`,k=!1,C.disabled=f===r.BLACK,f===r.WHITE?(w.isRunning&&w.stop(),m.reset(60)):(m.isRunning&&m.stop(),w.reset(60)),(g.isKingInCheck(r.BLACK)||g.isKingInCheck(r.WHITE))&&(g.isCheckmate(r.BLACK)&&y("Échec et Mat ! Blanc gagne !"),g.isCheckmate(r.WHITE)&&y("Échec et Mat ! Noir gagne !")),g.isStalemate(f)&&y("Pat ! La partie est nulle."),g.isInsufficientMaterial()&&y("Matériel insuffisant pour continuer, partie nulle !"),g.isFiftyMoveRule()&&y("Règle des 50 coups, partie nulle !"),B==="playing"&&(B="playing"),W.push([]),f===r.BLACK&&await Y()}async function Y(){x=!0,await D.makeAIMove(),A.drawBoard(),x=!1,await S()}function tt(o,t,e,s,i){const n=`${_(i,r.WHITE)} de (${o}, ${t}) à (${e}, ${s})`,a=document.createElement("li");a.textContent=n,F.appendChild(a),W[W.length-1].push({fromX:o,fromY:t,toX:e,toY:s,pieceType:i})}function et(o,t,e,s){if(B==="waiting"||k||H)return I("Veuillez attendre le prochain tour !"),!1;const i=g.getPiece(o,t),n=g.getPiece(e,s);if(!i||i.color!==f)return x||I(`C'est le tour de ${f===r.WHITE?"Blanc":"Noir"}`),!1;if(i.isValidMove(o,t,e,s,g)){if(g.movePiece(o,t,e,s))return k=!0,n&&v(n.type,n.color),tt(o,t,e,s,i.type),A.animateMove(o,t,e,s,i),S(),!0;I("Mouvement invalide !")}return!1}C&&C.addEventListener("click",async o=>{o.preventDefault(),B==="playing"&&f===r.WHITE&&!g.isKingInCheck(r.WHITE)&&(I(`Tour passé pour ${f===r.WHITE?"Blanc":"Noir"}`),await S())});K&&K.addEventListener("click",()=>{location.reload()});export{O as P,c as a,r as b,u as c};
//# sourceMappingURL=index-4lvVbLC1.js.map