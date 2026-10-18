export const utcDate=(now=new Date())=>now.toISOString().slice(0,10);
export const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&utcDate(new Date(s))===s;
export function hashSeed(s:string){let h=2166136261; for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function random(seed:number):[number,number]{const next=(seed+0x6D2B79F5)>>>0;let t=next;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return [((t^(t>>>14))>>>0)/4294967296,next];}
export const dailyNumber=(date:string)=>Math.floor((Date.parse(date)-Date.parse('2026-10-16'))/86400000)+1;
export function countdown(now:Date){const ms=86400000-(now.getTime()%86400000);const s=Math.floor(ms/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export function streak(dates:string[],today=utcDate()){const set=new Set(dates);let day=Date.parse(today);if(!set.has(today))day-=86400000;let count=0;while(set.has(utcDate(new Date(day)))){count++;day-=86400000;}return count;}
export function longestStreak(dates:string[]){let best=0,run=0,prev=0;for(const d of [...new Set(dates)].sort()){const t=Date.parse(d);run=t-prev===86400000?run+1:1;best=Math.max(best,run);prev=t;}return best;}
