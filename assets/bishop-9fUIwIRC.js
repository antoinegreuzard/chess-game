import{P as c,a as h}from"./ai.worker-e4aBx5g4.js";class t extends c{constructor(a){super(a,h.BISHOP)}isValidMove(a,i,e,s,r){return e<0||e>=8||s<0||s>=8?!1:Math.abs(e-a)===Math.abs(s-i)&&this.isPathClear(a,i,e,s,r)?this.canCapture(e,s,r):!1}}export{t as Bishop};
//# sourceMappingURL=bishop-9fUIwIRC.js.map
