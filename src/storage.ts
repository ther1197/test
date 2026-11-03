import { initial, type State } from './model';
export const KEY='jamkkan-focus-v1';
export let storageWarning = '';
export function read(): State {
 try {
  const raw=localStorage.getItem(KEY); if(!raw) return initial();
  const s=JSON.parse(raw);
  if(!s || !s.settings || !['focus','break'].includes(s.timer?.phase) || !['idle','paused','running'].includes(s.timer?.status) || !Number.isFinite(s.timer.duration) || s.timer.duration<=0 || !Number.isFinite(s.timer.remaining) || (s.timer.status==='running' && !Number.isFinite(s.timer.end)) || !Array.isArray(s.notes) || !s.records || typeof s.records!=='object' || ![s.settings.focus,s.settings.break].every(v=>Number.isInteger(v)&&v>0&&v<=1440) || typeof s.nextGoal!=='string' || typeof s.draft!=='string' || s.notes.some((n: any)=>!n || typeof n.text!=='string' || typeof n.id!=='string' || !Number.isFinite(n.created)) || Object.values(s.records).some((r: any)=>!r||!Number.isFinite(r.at)||!Number.isFinite(r.minutes))) throw Error();
  return {...initial(),...s};
 } catch { storageWarning='저장된 데이터를 읽지 못했어요. 이 화면에서는 새로 시작할 수 있어요.'; return initial(); }
}
export function write(s: State) { try { localStorage.setItem(KEY,JSON.stringify(s)); storageWarning=''; } catch { storageWarning='저장 공간에 접근할 수 없어요. 현재 내용은 이 탭에서 유지되지만 새로고침하면 사라질 수 있어요.'; } }
