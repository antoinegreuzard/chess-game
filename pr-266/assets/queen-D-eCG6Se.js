import{P as n,a as u}from"./index-CrHTSMZt.js";class l extends n{constructor(a){super(a,u.QUEEN)}isValidMove(a,i,e,s,r){return e<0||e>=8||s<0||s>=8?!1:(a===e||i===s||Math.abs(e-a)===Math.abs(s-i))&&this.isPathClear(a,i,e,s,r)?this.canCapture(e,s,r):!1}}export{l as Queen};
//# sourceMappingURL=queen-D-eCG6Se.js.map
