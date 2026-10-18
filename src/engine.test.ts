import {describe,it,expect,vi,afterEach} from 'vitest';
import {emptyBoard,canPlace,canFit,clearLines,isGameOver,newGame,place,deal,type Game,type Board} from './engine';
import {shapeById,SHAPES} from './shapes';
import {scoreMove} from './scoring';
import {hashSeed,random,utcDate,countdown,streak,longestStreak,validDate} from './daily';
import {parseProfile,freshProfile,updateProgress,validGame,gameKey,saveProfile,loadProfile} from './persistence';
const square=shapeById('square'),single=shapeById('single');
const filled=():Board=>Array.from({length:8},()=>Array.from({length:8},()=>({color:1,pumpkin:false})));
function fixture(mode:'classic'|'daily'|'seasonal'='classic'):Game{const g=newGame(mode,'2026-10-16',true,mode==='seasonal'?'halloween':'classic',0,123);return {...g,board:emptyBoard(),pieces:['single','square','triple-h']};}
afterEach(()=>vi.unstubAllGlobals());
describe('placement validation',()=>{
 it('places at each valid corner',()=>{for(const [r,c] of [[0,0],[0,6],[6,0],[6,6]])expect(canPlace(emptyBoard(),square,r,c)).toBe(true);});
 it('rejects all boundary overflow and fractional indices',()=>{for(const [r,c] of [[-1,0],[0,-1],[7,0],[0,7],[8,8],[.5,0],[NaN,0]])expect(canPlace(emptyBoard(),square,r,c)).toBe(false);});
 it('detects a collision with any occupied cell',()=>{const b=emptyBoard();b[1][1]={color:3,pumpkin:true};expect(canPlace(b,square,0,0)).toBe(false);expect(canPlace(b,single,0,0)).toBe(true);});
 it('does not lose a piece, mutate board, or change score on invalid drop',()=>{const g=fixture();const snapshot=JSON.stringify(g);expect(place(g,0,-1,0)).toBeNull();expect(JSON.stringify(g)).toBe(snapshot);expect(place(g,1,7,7)).toBeNull();expect(JSON.stringify(g)).toBe(snapshot);});
 it('has no mutation on successful placement',()=>{const g=fixture(),before=JSON.stringify(g);const n=place(g,1,0,0)!;expect(JSON.stringify(g)).toBe(before);expect(n.game.board[1][1]?.color).toBe(square.color);expect(n.game.pieces).toEqual(['single',null,'triple-h']);expect(n.points).toBe(20);});
 it('rejects already used pieces and all moves after game over',()=>{const g=fixture();g.pieces[1]=null;expect(place(g,1,0,0)).toBeNull();g.over=true;expect(place(g,0,0,0)).toBeNull();});
 it('deals only after all three are used',()=>{let g=fixture();g=place(g,0,0,0)!.game;expect(g.pieces).toEqual([null,'square','triple-h']);g=place(g,1,2,0)!.game;expect(g.pieces).toEqual([null,null,'triple-h']);g=place(g,2,4,0)!.game;expect(g.pieces.every(Boolean)).toBe(true);expect(g.moves).toBe(3);});
 it('uses a valid and configurable weighted shape pool',()=>{expect(SHAPES.every(s=>s.weight>0&&s.cells.length===new Set(s.cells.map(c=>c.join(','))).size)).toBe(true);for(let seed=0;seed<100;seed++){const d=deal(seed);expect(d.pieces).toHaveLength(3);expect(d.pieces.every(id=>!!shapeById(id))).toBe(true);}});
});
describe('line clearing and scoring',()=>{
 it('clears a completed row and leaves other cells',()=>{const b=emptyBoard();b[0].fill({color:1,pumpkin:false});b[1][4]={color:2,pumpkin:false};const n=clearLines(b);expect(n.lines).toBe(1);expect(n.cleared).toHaveLength(8);expect(n.board[0].every(c=>!c)).toBe(true);expect(n.board[1][4]).toEqual(b[1][4]);});
 it('clears a completed column',()=>{const b=emptyBoard();b.forEach(r=>r[3]={color:2,pumpkin:false});const n=clearLines(b);expect(n.lines).toBe(1);expect(n.board.every(r=>!r[3])).toBe(true);});
 it('counts crossing row/column cells and pumpkin once',()=>{const b=emptyBoard();b[3].fill({color:1,pumpkin:false});b.forEach(r=>r[4]={color:1,pumpkin:false});b[3][4]={color:2,pumpkin:true};const n=clearLines(b);expect(n.lines).toBe(2);expect(n.cleared).toHaveLength(15);expect(n.pumpkins).toBe(1);expect(n.board.flat().filter(Boolean)).toHaveLength(0);});
 it('clears two rows and columns simultaneously',()=>{const b=filled();const n=clearLines(b);expect(n.lines).toBe(16);expect(n.cleared).toHaveLength(64);expect(n.board.flat().filter(Boolean)).toHaveLength(0);});
 it('scores a crossing clear as two lines without counting shared squares twice',()=>{const g=fixture();g.board[0].fill({color:1,pumpkin:false});g.board.forEach(r=>r[0]={color:1,pumpkin:false});g.board[0][0]=null;const n=place(g,0,0,0)!;expect(n.lines).toBe(2);expect(n.points).toBe(255);expect(n.game.lines).toBe(2);expect(n.game.score).toBe(255);});
 it('rewards placed squares, lines, multi-lines, and consecutive line clears',()=>{expect(scoreMove(4,0,0)).toEqual({points:20,combo:0});expect(scoreMove(4,1,0)).toEqual({points:120,combo:1});expect(scoreMove(4,2,1)).toEqual({points:520,combo:2});expect(scoreMove(1,1,8)).toEqual({points:505,combo:9});});
 it('resets the combo after a placement without a clear',()=>expect(scoreMove(2,0,4)).toEqual({points:10,combo:0}));
});
describe('game over',()=>{
 it('keeps playing if one remaining piece fits even if another cannot',()=>{const b=filled();b[0][0]=null;expect(canFit(b,square)).toBe(false);expect(isGameOver(b,['square',null,'single'])).toBe(false);});
 it('ends only when no remaining piece fits',()=>{const b=filled();b[0][0]=null;expect(isGameOver(b,['square',null,'triple-h'])).toBe(true);expect(isGameOver(b,[null,'single',null])).toBe(false);b[0][0]={color:1,pumpkin:false};expect(isGameOver(b,[null,'single',null])).toBe(true);});
 it('checks game over after the line is cleared, not before',()=>{const g=fixture();g.board[0].fill({color:1,pumpkin:false});g.board[0][0]=null;const n=place(g,0,0,0)!;expect(n.game.over).toBe(false);expect(n.game.board[0].every(c=>!c)).toBe(true);});
});
describe('daily puzzles',()=>{
 it('has an identical starting board, pieces, and PRNG state for the same UTC date',()=>{const a=newGame('daily','2026-10-16'),b=newGame('daily','2026-10-16');expect(a.board).toEqual(b.board);expect(a.pieces).toEqual(b.pieces);expect(a.seed).toBe(b.seed);});
 it('has the same hand sequence in ranked and practice',()=>{const a=newGame('daily','2026-10-16',true),b=newGame('daily','2026-10-16',false);let x=a.seed,y=b.seed;for(let i=0;i<20;i++){const ah=deal(x),bh=deal(y);expect(ah).toEqual(bh);x=ah.seed;y=bh.seed;}});
 it('changes between dates',()=>{const a=newGame('daily','2026-10-16'),b=newGame('daily','2026-10-17');expect(a.seed).not.toBe(b.seed);expect(a.board).not.toEqual(b.board);});
 it('ends at exactly 25 placements',()=>{const g=fixture('daily');g.moves=24;const n=place(g,0,0,0)!;expect(n.game.moves).toBe(25);expect(n.game.over).toBe(true);expect(place(n.game,1,1,1)).toBeNull();});
 it('pins an ongoing game to its starting date when midnight passes',()=>{const g=fixture('daily');vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-17T00:01:00Z'));expect(place(g,0,0,0)!.game.date).toBe('2026-10-16');vi.useRealTimers();});
 it('uses UTC and handles day countdown',()=>{expect(utcDate(new Date('2026-10-16T23:59:59-04:00'))).toBe('2026-10-17');expect(countdown(new Date('2026-10-16T23:59:59Z'))).toBe('00:00:01');expect(countdown(new Date('2026-10-17T00:00:00Z'))).toBe('24:00:00');});
 it('rejects invalid date strings',()=>{expect(validDate('2026-02-30')).toBe(false);expect(validDate('nope')).toBe(false);expect(validDate('2026-10-16')).toBe(true);});
 it('uses reproducible random values in [0,1)',()=>{expect(hashSeed('abc')).toBe(hashSeed('abc'));expect(random(123)).toEqual(random(123));let s=1;for(let i=0;i<1000;i++){const [v,next]=random(s);expect(v).toBeGreaterThanOrEqual(0);expect(v).toBeLessThan(1);s=next;}});
});
describe('seasonal progress',()=>{
 it('places cosmetic pumpkin markers without modifying collision rules',()=>{const g=fixture('seasonal');const n=place(g,0,0,0)!;expect(n.game.board[0][0]?.pumpkin).toBe(true);expect(canPlace(n.game.board,single,0,0)).toBe(false);expect(n.pumpkins).toBe(0);});
 it('collects pumpkins only when their cells clear',()=>{const g=fixture('seasonal');for(let c=0;c<7;c++)g.board[0][c]={color:1,pumpkin:true};const n=place(g,0,0,7)!;expect(n.pumpkins).toBe(8);expect(n.game.pumpkins).toBe(8);const p=freshProfile();p.pumpkins=95;expect(updateProgress(p,n.game,n.lines,n.pumpkins).pumpkins).toBe(103);});
 it('keeps the event theme on an ongoing run',()=>{const g=fixture('seasonal');expect(place(g,0,0,0)!.game.theme).toBe('halloween');});
});
describe('persistent progress',()=>{
 it('round-trips complete board, hand, PRNG, score, and mode',()=>{let g=fixture('seasonal');g=place(g,1,0,0)!.game;const p=updateProgress(freshProfile(),g);const restored=parseProfile(JSON.stringify(p));expect(restored).toEqual(p);expect(place(restored.games.seasonal,0,3,3)).toEqual(place(g,0,3,3));});
 it('falls back safely for missing, corrupt, and unknown schema data',()=>{for(const raw of [null,'{oops','null','[]','{"version":5}'])expect(parseProfile(raw)).toEqual(freshProfile());});
 it('drops malformed games while preserving valid unrelated progress',()=>{const p=freshProfile();p.best.classic=250;p.games.classic={...fixture(),board:[[null]]};const n=parseProfile(JSON.stringify(p));expect(n.games).toEqual({});expect(n.best.classic).toBe(250);});
 it('rejects bad shapes, missing fields, invalid cells and non-integer scores',()=>{const g=fixture();expect(validGame(g)).toBe(true);expect(validGame({...g,pieces:['bad',null,null]})).toBe(false);expect(validGame({...g,score:NaN})).toBe(false);expect(validGame({...g,board:null})).toBe(false);expect(validGame({...g,moves:-1})).toBe(false);expect(validGame({...g,board:g.board.map(r=>r.map(()=>({color:90,pumpkin:false})))})).toBe(false);});
 it('records each completed daily only once and excludes practice from ranked best',()=>{const g=fixture('daily');g.over=true;g.score=123;let p=updateProgress(freshProfile(),g);p=updateProgress(p,g);expect(p.completed).toBe(1);expect(p.dailyDates).toEqual(['2026-10-16']);expect(p.best.daily).toBe(123);const practice={...g,ranked:false,score:999};p=updateProgress(p,practice);expect(p.best.daily).toBe(123);expect(p.dailyDates).toHaveLength(1);});
 it('saves ranked attempt separately from unlimited practice',()=>{const g=fixture('daily');expect(gameKey(g)).toBe('daily:2026-10-16:ranked');expect(gameKey({...g,ranked:false})).toBe('daily:2026-10-16:practice');});
 it('counts streaks without breaking yesterday’s streak early',()=>{expect(streak(['2026-10-14','2026-10-15'],'2026-10-16')).toBe(2);expect(streak(['2026-10-13','2026-10-15','2026-10-16'],'2026-10-16')).toBe(2);expect(streak(['2026-10-13'],'2026-10-16')).toBe(0);expect(longestStreak(['2026-10-15','2026-10-14','2026-10-14','2026-10-16'])).toBe(3);});
 it('unlocks all five achievements based on actual local play',()=>{const p=freshProfile();p.dailyDates=['2026-10-14','2026-10-15'];const g=fixture('daily');g.score=10000;g.over=true;const n=updateProgress(p,g,10);expect(n.achievements).toHaveLength(5);});
 it('handles denied storage without crashing',()=>{vi.stubGlobal('localStorage',{getItem:()=>{throw new Error('denied');},setItem:()=>{throw new Error('quota');}});expect(loadProfile()).toEqual(freshProfile());expect(saveProfile(freshProfile())).toBe(false);});
 it('supports real localStorage save/restore adapter behavior',()=>{const data=new Map();vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)});const p=updateProgress(freshProfile(),fixture());expect(saveProfile(p)).toBe(true);expect(loadProfile()).toEqual(p);});
});
describe('full-game invariants',()=>{
 it('simulates 100 games with legal moves and save/restore on each turn',()=>{for(let seed=0;seed<100;seed++){let g=newGame(seed%2?'classic':'seasonal','2026-10-16',true,'classic',0,seed);let prevScore=0;for(let turn=0;turn<150&&!g.over;turn++){let choice:[number,number,number]|null=null;for(let i=0;i<3&&!choice;i++){if(!g.pieces[i])continue;for(let r=0;r<8&&!choice;r++)for(let c=0;c<8&&!choice;c++)if(canPlace(g.board,shapeById(g.pieces[i]!),r,c))choice=[i,r,c];}expect(choice).not.toBeNull();const n=place(g,...choice!)!;g=n.game;expect(g.score).toBeGreaterThan(prevScore);prevScore=g.score;expect(g.board).toHaveLength(8);expect(clearLines(g.board).lines).toBe(0);expect(validGame(g)).toBe(true);expect(g.over).toBe(isGameOver(g.board,g.pieces));g=parseProfile(JSON.stringify(updateProgress(freshProfile(),g))).games[gameKey(g)];expect(g).toBeDefined();}}});
});
