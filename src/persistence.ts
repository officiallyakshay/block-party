import {type Game} from './engine';
import {THEMES} from './themes';
import {SHAPES} from './shapes';
import {validDate,longestStreak} from './daily';
export const STORAGE_KEY='block-party-v1';
export interface Profile {version:1;activeKey:string|null;games:Record<string,Game>;best:{classic:number;daily:number;seasonal:number};pumpkins:number;totalLines:number;completed:number;dailyDates:string[];achievements:string[];settings:{sound:boolean;haptics:boolean;motion:boolean;theme:string;glow:boolean};visited:boolean}
export const freshProfile=():Profile=>({version:1,activeKey:null,games:{},best:{classic:0,daily:0,seasonal:0},pumpkins:0,totalLines:0,completed:0,dailyDates:[],achievements:[],settings:{sound:true,haptics:true,motion:true,theme:'classic',glow:false},visited:false});
const uint=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
export function validGame(g:unknown):g is Game{if(!g||typeof g!=='object')return false;const s=g as Game;return typeof s.id==='string'&&['classic','daily','seasonal'].includes(s.mode)&&validDate(s.date)&&typeof s.ranked==='boolean'&&typeof s.theme==='string'&&typeof s.over==='boolean'&&[s.seed,s.score,s.lines,s.combo,s.maxCombo,s.moves,s.pumpkins,s.started,s.previousBest].every(uint)&&s.seed<=4294967295&&s.combo<=s.moves&&s.maxCombo<=s.moves&&(s.mode!=='daily'||s.moves<=25)&&Array.isArray(s.pieces)&&s.pieces.length===3&&s.pieces.some(Boolean)&&s.pieces.every(id=>id===null||SHAPES.some(sh=>sh.id===id))&&Array.isArray(s.board)&&s.board.length===8&&s.board.every(row=>Array.isArray(row)&&row.length===8&&row.every(c=>c===null||(typeof c==='object'&&uint(c.color)&&c.color>=1&&c.color<=6&&typeof c.pumpkin==='boolean')));}
export function parseProfile(raw:string|null):Profile{const p=freshProfile();if(!raw)return p;try{const d=JSON.parse(raw);if(!d||d.version!==1)return p;if(d.games&&typeof d.games==='object')for(const [k,g] of Object.entries(d.games))if(validGame(g)&&k===gameKey(g))p.games[k]=g;for(const m of ['classic','daily','seasonal'] as const)if(uint(d.best?.[m]))p.best[m]=d.best[m];for(const k of ['pumpkins','totalLines','completed'] as const)if(uint(d[k]))p[k]=d[k];if(Array.isArray(d.dailyDates))p.dailyDates=[...new Set<string>(d.dailyDates.filter((x:unknown)=>typeof x==='string'&&validDate(x)))];if(Array.isArray(d.achievements))p.achievements=d.achievements.filter((x:unknown)=>typeof x==='string'&&ACHIEVEMENTS.some(a=>a.id===x));for(const k of ['sound','haptics','motion','glow'] as const)if(typeof d.settings?.[k]==='boolean')p.settings[k]=d.settings[k];if(THEMES.some(t=>t.id===d.settings?.theme))p.settings.theme=d.settings.theme;if(typeof d.activeKey==='string'&&p.games[d.activeKey])p.activeKey=d.activeKey;p.visited=!!d.visited;p.dailyDates=[...new Set([...p.dailyDates,...Object.values(p.games).filter(g=>g.mode==='daily'&&g.ranked&&g.over).map(g=>g.date)])].sort();return p;}catch{return p;}}
export function loadProfile(){try{return parseProfile(localStorage.getItem(STORAGE_KEY));}catch{return freshProfile();}}
export function saveProfile(p:Profile){try{const merged=mergeProgress(loadProfile(),p);localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));Object.assign(p,merged);return true;}catch{return false;}}
export const gameKey=(g:Pick<Game,'mode'|'date'|'ranked'>)=>g.mode==='daily'?`daily:${g.date}:${g.ranked?'ranked':'practice'}`:g.mode;
export const ACHIEVEMENTS=[{id:'first',name:'Party Starter',detail:'Complete your first game',icon:'🎈'},{id:'thousand',name:'Finding Your Groove',detail:'Score 1,000 in one game',icon:'✦'},{id:'ten-thousand',name:'Life of the Party',detail:'Score 10,000 in one game',icon:'🏆'},{id:'lines',name:'Clean Sweep',detail:'Clear 10 lines across your games',icon:'🧹'},{id:'streak',name:'Three’s a Party',detail:'Complete 3 daily puzzles in a row',icon:'🔥'}];
export function updateProgress(p:Profile,g:Game,lines=0,pumpkins=0){const wasOver=p.games[gameKey(g)]?.over;const n:Profile={...p,games:{...p.games,[gameKey(g)]:g},best:{...p.best},settings:{...p.settings},dailyDates:[...p.dailyDates],achievements:[...p.achievements],totalLines:p.totalLines+lines,pumpkins:p.pumpkins+pumpkins};if(g.mode!=='daily'||g.ranked)n.best[g.mode]=Math.max(n.best[g.mode],g.score);if(g.over&&!wasOver){n.completed++;if(g.mode==='daily'&&g.ranked&&!n.dailyDates.includes(g.date))n.dailyDates.push(g.date);}const maxScore=Math.max(...Object.values(n.best));const checks=[n.completed>0,maxScore>=1000,maxScore>=10000,n.totalLines>=10,longestStreak(n.dailyDates)>=3];ACHIEVEMENTS.forEach((a,i)=>{if(checks[i]&&!n.achievements.includes(a.id))n.achievements.push(a.id);});return n;}

// Preserve earned history when an older tab saves. The active tab owns settings.
export function mergeProgress(old:Profile,next:Profile):Profile {
 const games={...old.games,...next.games};
 for(const [key,g] of Object.entries(old.games)){
  const candidate=next.games[key];
  if(g.mode==='daily'&&g.ranked&&candidate&&(g.over||g.moves>candidate.moves))games[key]=g;
 }
 return {...next,games,dailyDates:[...new Set([...old.dailyDates,...next.dailyDates])].sort(),
 achievements:[...new Set([...old.achievements,...next.achievements])],
 best:{classic:Math.max(old.best.classic,next.best.classic),daily:Math.max(old.best.daily,next.best.daily),seasonal:Math.max(old.best.seasonal,next.best.seasonal)},
 pumpkins:Math.max(old.pumpkins,next.pumpkins),totalLines:Math.max(old.totalLines,next.totalLines),completed:Math.max(old.completed,next.completed)};
}
export function importProgress(raw:string,current:Profile):Profile {
 const data=JSON.parse(raw);
 if(!data||data.version!==1||!data.settings||!Array.isArray(data.dailyDates)||!data.games)throw new Error('Invalid Block Party backup');
 return mergeProgress(current,parseProfile(raw));
}
export function downloadProgress(p:Profile){
 const url=URL.createObjectURL(new Blob([JSON.stringify(p)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='block-party-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
