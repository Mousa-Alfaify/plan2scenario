import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Progress, Tag, toast } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { SIM_STEPS } from '../../data/labs';

type Answer = { picked: string[]; order?: string[] };

export function Simulation() {
  const { dispatch, go } = useStore();
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Record<string, Answer>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const step: any = SIM_STEPS[idx];
  const a = ans[step.id] ?? { picked: [], order: step.kind === 'order' ? [...step.items].sort(() => Math.random() - 0.5) : undefined };
  const isRevealed = !!revealed[step.id];

  const setA = (v: Answer) => setAns({ ...ans, [step.id]: v });

  const stepScore = (s: any, an: Answer | undefined): number => {
    if (!an) return 0;
    if (s.kind === 'order') {
      if (!an.order) return 0;
      const right = an.order.filter((x: string, i: number) => x === s.items[i]).length;
      return Math.round((right / s.items.length) * 100);
    }
    const correct = s.options.filter((o: any) => o.correct).map((o: any) => o.id);
    const picked = an.picked;
    if (s.kind === 'single') return picked[0] && correct.includes(picked[0]) ? 100 : 0;
    const hit = picked.filter((p) => correct.includes(p)).length;
    const wrong = picked.filter((p) => !correct.includes(p)).length;
    return Math.max(0, Math.round(((hit - wrong) / correct.length) * 100));
  };

  const total = Math.round(SIM_STEPS.reduce((acc, s) => acc + stepScore(s, ans[s.id]), 0) / SIM_STEPS.length);

  const canReveal = step.kind === 'order' ? true : a.picked.length > 0;

  const finish = () => {
    setFinished(true);
    dispatch({ type: 'lab', id: 'simulation', score: total });
    toast(`انتهت المحاكاة — نتيجتك ${total}%`);
  };

  if (finished) {
    return (
      <div className="space-y-4">
        <Card className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-forest-700 text-white grid place-items-center mx-auto mb-4"><Icon name="award" className="w-8 h-8" /></div>
          <h3 className="text-[20px] font-bold">اكتملت المحاكاة</h3>
          <div className="text-[40px] font-bold my-3" style={{ color: total >= 70 ? '#2F7D55' : '#B4903F' }}>{total}%</div>
          <p className="text-[13.5px] text-ink-mute max-w-lg mx-auto leading-relaxed">
            قارني قراراتك بالمثال التعليمي الوارد في الفصل 11 من الدليل. الاختلاف ليس خطأ بالضرورة، لكن راجعي التبرير في كل مرحلة.
          </p>
          <div className="flex gap-2 justify-center mt-5">
            <Button icon="refresh" onClick={() => { setFinished(false); setIdx(0); setAns({}); setRevealed({}); }}>إعادة المحاكاة</Button>
            <Button variant="primary" icon="tools" onClick={() => { dispatch({ type: 'mode', mode: 'build' }); go('#/build'); }}>طبّقيها على مشروعك</Button>
          </div>
        </Card>

        <Card>
          <h4 className="font-bold text-[15px] mb-3">مقارنة قراراتك بالمثال التعليمي</h4>
          <div className="space-y-3">
            {SIM_STEPS.map((s: any) => {
              const sc = stepScore(s, ans[s.id]);
              return (
                <div key={s.id} className="rounded-xl border border-stone-200 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-md grid place-items-center text-[11px] font-bold text-white ${sc >= 70 ? 'bg-ok-500' : sc > 0 ? 'bg-gold-500' : 'bg-danger-500'}`}>{sc}</span>
                    <span className="font-semibold text-[13.5px]">{s.title}</span>
                    <div className="flex-1" />
                    <span className="text-[11px] text-ink-mute bg-stone-100 rounded px-1.5 py-0.5">{s.source}</span>
                  </div>
                  <p className="text-[12.5px] text-ink-soft leading-[1.9]">{s.feedback}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[12.5px] text-ink-mute whitespace-nowrap">المرحلة {idx + 1} من {SIM_STEPS.length}</span>
        <div className="flex-1"><Progress value={(idx / SIM_STEPS.length) * 100} height={5} /></div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-forest-700 text-white grid place-items-center font-bold text-[13px]">{idx + 1}</span>
          <h4 className="font-bold text-[15.5px]">{step.title}</h4>
        </div>
        <p className="text-[14px] leading-relaxed mb-4">{step.prompt}</p>

        {step.kind === 'order' ? (
          <OrderList items={a.order ?? []} onChange={(o) => setA({ ...a, order: o })} disabled={isRevealed}
            correct={isRevealed ? step.items : undefined} />
        ) : (
          <div className="space-y-2">
            {step.options.map((o: any) => {
              const on = a.picked.includes(o.id);
              const show = isRevealed;
              const cls = show
                ? o.correct ? 'border-ok-300 bg-ok-50' : on ? 'border-danger-300 bg-danger-50' : 'border-stone-200 opacity-60'
                : on ? 'border-forest-500 bg-forest-50' : 'border-stone-200 hover:border-forest-400';
              return (
                <button key={o.id} disabled={show}
                  onClick={() => setA({ ...a, picked: step.kind === 'single' ? [o.id] : on ? a.picked.filter((x) => x !== o.id) : [...a.picked, o.id] })}
                  className={`w-full text-right px-3.5 py-3 rounded-lg border text-[13.5px] leading-relaxed transition flex items-start gap-2.5 ${cls}`}>
                  <span className={`mt-0.5 w-5 h-5 shrink-0 grid place-items-center text-[11px] font-bold
                    ${step.kind === 'single' ? 'rounded-full' : 'rounded'} ${on || (show && o.correct) ? 'bg-forest-700 text-white' : 'bg-stone-100 text-ink-mute'}`}>
                    {show ? (o.correct ? '✓' : on ? '✕' : '') : on ? '✓' : ''}
                  </span>
                  <span className="flex-1">{o.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {isRevealed && (
          <div className="mt-4 space-y-2 anim-in">
            <div className="rounded-lg bg-forest-50/70 border border-forest-200 p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon name="info" className="w-4 h-4 text-forest-700" />
                <span className="text-[12px] font-bold text-forest-800">ما فعله الدليل</span>
                <div className="flex-1" />
                <span className="text-[11px] text-ink-mute bg-white/70 rounded px-1.5 py-0.5">{step.source}</span>
              </div>
              <p className="text-[13px] leading-[1.95] text-ink-soft">{step.feedback}</p>
            </div>
            <div className="text-[13px]">نتيجتك في هذه المرحلة: <strong>{stepScore(step, a)}%</strong></div>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          {!isRevealed ? (
            <Button variant="primary" icon="check" disabled={!canReveal}
              onClick={() => { setA(a); setRevealed({ ...revealed, [step.id]: true }); }}>
              تأكيد القرار
            </Button>
          ) : idx < SIM_STEPS.length - 1 ? (
            <Button variant="primary" icon="chevron" onClick={() => setIdx(idx + 1)}>المرحلة التالية</Button>
          ) : (
            <Button variant="gold" icon="award" onClick={finish}>إنهاء المحاكاة وعرض المقارنة</Button>
          )}
          {idx > 0 && <Button icon="chevronD" onClick={() => setIdx(idx - 1)}>السابقة</Button>}
        </div>
      </Card>
    </div>
  );
}

function OrderList({ items, onChange, disabled, correct }: { items: string[]; onChange: (o: string[]) => void; disabled?: boolean; correct?: string[] }) {
  const [drag, setDrag] = useState('');
  const move = (from: string, to: string) => {
    const a = [...items];
    const fi = a.indexOf(from), ti = a.indexOf(to);
    if (fi < 0 || ti < 0) return;
    const [m] = a.splice(fi, 1); a.splice(ti, 0, m); onChange(a);
  };
  return (
    <div className="space-y-2">
      {items.map((x, i) => {
        const ok = correct ? correct[i] === x : undefined;
        return (
          <div key={x} draggable={!disabled} onDragStart={() => setDrag(x)} onDragOver={(e) => e.preventDefault()} onDrop={() => { move(drag, x); setDrag(''); }}
            className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}
              ${ok === undefined ? 'border-stone-200' : ok ? 'border-ok-300 bg-ok-50' : 'border-danger-300 bg-danger-50'}`}>
            {!disabled && <Icon name="drag" className="w-4 h-4 text-stone-400 shrink-0" />}
            <span className="w-6 h-6 rounded-md bg-stone-100 grid place-items-center text-[11.5px] font-bold shrink-0">{i + 1}</span>
            <span className="text-[13px] flex-1 leading-relaxed">{x}</span>
          </div>
        );
      })}
    </div>
  );
}
