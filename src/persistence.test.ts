// @vitest-environment jsdom
import {it,expect,beforeEach} from 'vitest';
import {freshProfile,saveProfile,loadProfile,parseProfile,importProgress,gameKey} from './persistence';
import {newGame} from './engine';
beforeEach(()=>localStorage.clear());
it('recovers missing daily history from finished ranked games only',()=>{const p=freshProfile();const g={...newGame('daily','2026-10-16'),over:true};p.games[gameKey(g)]=g;const practice={...g,date:'2026-10-15',ranked:false};p.games[gameKey(practice)]=practice;expect(parseProfile(JSON.stringify(p)).dailyDates).toEqual(['2026-10-16']);});
it('keeps earned daily history when a stale tab saves',()=>{const stale=freshProfile();const p=freshProfile();p.dailyDates=['2026-10-16'];p.best.daily=500;saveProfile(p);stale.settings.theme='summer';saveProfile(stale);expect(loadProfile().dailyDates).toEqual(['2026-10-16']);expect(loadProfile().best.daily).toBe(500);expect(loadProfile().settings.theme).toBe('summer');});
it('imports a backup without losing existing achievements or dates',()=>{const a=freshProfile();a.dailyDates=['2026-10-15'];a.achievements=['first'];const b=freshProfile();b.dailyDates=['2026-10-16'];const result=importProgress(JSON.stringify(b),a);expect(result.dailyDates).toEqual(['2026-10-15','2026-10-16']);expect(result.achievements).toContain('first');expect(()=>importProgress('{}',a)).toThrow();expect(()=>importProgress('{oops',a)).toThrow();});
