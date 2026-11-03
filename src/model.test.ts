import { describe,it,expect } from 'vitest';
import { advance,initial,start,pause,remaining,today,localDate,validMinutes } from './model';
describe('종료 시각 기준 타이머',()=>{
 it('기본값과 선택 목표 없이 집중 시작',()=>{const s=start(initial(),1000);expect(s.timer.end).toBe(1201000);expect(s.timer.goal).toBe('');expect(s.settings.break).toBe(5);});
 it('집중 완료 → 자동 휴식 → 다음 집중 대기',()=>{let s=start(initial(),0);s=advance(s,1200000);expect(s.timer.phase).toBe('break');expect(s.timer.status).toBe('running');expect(Object.values(s.records)).toEqual([{at:1200000,minutes:20}]);s=advance(s,1500000);expect(s.timer.phase).toBe('focus');expect(s.timer.status).toBe('idle');});
 it('두 자동 시작 설정을 독립 적용',()=>{let s=initial();s.settings.autoBreak=false;s.settings.autoFocus=true;s=advance(start(s,0),1200000);expect(s.timer.status).toBe('idle');s=advance(start(s,1200000),1500000);expect(s.timer.phase).toBe('focus');expect(s.timer.status).toBe('running');});
 it('일시정지와 JSON 복원, 재개 시 일시정지 시간 제외',()=>{let s=pause(start(initial(),0),60000);s=JSON.parse(JSON.stringify(s));expect(remaining(s.timer,500000)).toBe(1140000);s=start(s,500000);expect(s.timer.end).toBe(1640000);expect(remaining(s.timer,600000)).toBe(1040000);});
 it('오래 닫혔던 앱은 한 번만 완료하고 다음 단계 대기',()=>{let s=advance(start(initial(),0),999999999,true);expect(s.timer.status).toBe('idle');expect(s.timer.phase).toBe('break');expect(Object.keys(s.records)).toHaveLength(1);s=advance(s,999999999,true);expect(Object.keys(s.records)).toHaveLength(1);});
 it('같은 회차 재처리와 여러 탭 결과도 기록 키 중복 없음',()=>{const s=start(initial(),0);const a=advance(s,1200000),b=advance(s,1200000);expect(Object.keys({...a.records,...b.records})).toHaveLength(1);});
 it('수동 종료와 휴식은 기록에 포함하지 않음',()=>{let s=advance(start(initial(),0),60000,false,true);expect(Object.keys(s.records)).toHaveLength(0);s=advance(start(s,60000),360000);expect(Object.keys(s.records)).toHaveLength(0);});
 it('진행 중 시간 설정 변경은 현재 회차 유지, 다음 단계에 반영',()=>{let s=start(initial(),0);s.settings={...s.settings,focus:30,break:7};expect(s.timer.duration).toBe(1200000);s=advance(s,1200000);expect(s.timer.duration).toBe(420000);});
 it('자정 넘긴 회차는 기기 현지 완료 날짜에 기록',()=>{const begin=new Date(2026,10,3,23,50).getTime();const end=begin+1200000;const s=advance(start(initial(),begin),end);expect(today(s,begin).count).toBe(0);expect(today(s,end)).toEqual({count:1,minutes:20});expect(localDate(end)).toBe('2026-11-4');});
 it('현재 회차 메모 개수 안내',()=>{let s=start(initial(),0);s.notes=[{id:'n',text:'생각',category:'미분류',created:1,done:false,session:s.timer.id}];s=advance(s,1200000);expect(s.notice).toContain('1개');});
 it('잘못된 시간 거절',()=>{for(const v of ['','0','-1','1.5','abc','Infinity','1441'])expect(validMinutes(v)).toBe(false);expect(validMinutes('20')).toBe(true);});
});
