export const SCORE={block:5,line:100,multiLineBonus:50,maxCombo:5};
export function scoreMove(blocks:number,lines:number,previousCombo:number){const combo=lines>0?previousCombo+1:0;const multiplier=Math.min(combo,SCORE.maxCombo);return {combo,points:blocks*SCORE.block+(lines*SCORE.line+Math.max(0,lines-1)*SCORE.multiLineBonus)*multiplier};}
