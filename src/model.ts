export type Phase = 'focus' | 'break';
export type Settings = { focus: number; break: number; autoBreak: boolean; autoFocus: boolean; sound: boolean };
export type Timer = { id: string; phase: Phase; status: 'idle' | 'running' | 'paused'; duration: number; remaining: number; end: number | null; goal: string };
export type Note = { id: string; text: string; category: string; created: number; done: boolean; session: string | null };
export type State = { settings: Settings; timer: Timer; notes: Note[]; records: Record<string, { at: number; minutes: number }>; nextGoal: string; draft: string; category: string; notice: string; deleted: { note: Note; until: number } | null };
export const uid = () => crypto.randomUUID();
export function timer(phase: Phase, settings: Settings): Timer { const duration = settings[phase] * 60000; return { id: uid(), phase, status: 'idle', duration, remaining: duration, end: null, goal: '' }; }
export function initial(): State { const settings = { focus:20, break:5, autoBreak:true, autoFocus:false, sound:true }; return { settings, timer:timer('focus', settings), notes:[], records:{}, nextGoal:'', draft:'', category:'미분류', notice:'', deleted:null }; }
export function remaining(t: Timer, now: number) { return t.status === 'running' ? Math.max(0, (t.end ?? now) - now) : t.remaining; }
export function start(s: State, now: number): State { const t = s.timer; return { ...s, nextGoal: t.status === 'idle' && t.phase === 'focus' ? '' : s.nextGoal, timer: { ...t, goal: t.status === 'idle' && t.phase === 'focus' ? s.nextGoal : t.goal, status:'running', end:now+t.remaining } }; }
export function pause(s: State, now: number): State { return { ...s, timer:{ ...s.timer, status:'paused', remaining:remaining(s.timer,now), end:null } }; }
export function advance(s: State, now: number, away = false, manual = false): State {
 const t = s.timer;
 if (!manual && (t.status !== 'running' || remaining(t,now) > 0)) return s;
 const completed = !manual && t.phase === 'focus';
 const phase = t.phase === 'focus' ? 'break' : 'focus';
 const count = s.notes.filter(n => n.session === t.id).length;
 let next = { ...s, records: completed ? { ...s.records, [t.id]: { at:t.end ?? now, minutes:t.duration/60000 } } : s.records, timer:timer(phase,s.settings), notice:manual ? '현재 회차를 종료했어요. 기록에는 포함하지 않았어요.' : completed ? `집중을 마쳤어요. 이번 집중 중 적어둔 생각이 ${count}개 있어요.` : '휴식을 마쳤어요. 다음 집중을 준비해 볼까요?' };
 if (!away && !manual && (phase === 'break' ? s.settings.autoBreak : s.settings.autoFocus)) next = start(next, now);
 return next;
}
export function localDate(at: number) { const d = new Date(at); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
export function today(s: State, now: number) { const r = Object.values(s.records).filter(r => localDate(r.at) === localDate(now)); return { count:r.length, minutes:r.reduce((a,b)=>a+b.minutes,0) }; }
export function validMinutes(v: string) { return /^\d+$/.test(v) && Number.isSafeInteger(Number(v)) && Number(v)>0 && Number(v)<=1440; }
