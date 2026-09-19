import React, { useMemo, useState } from 'react';
import type { Question } from '../../data/quizzes';
import { Button, Card, Input, Progress, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CATEGORIES } from '../../data/categories';
import { useStore } from '../../store/store';

export interface QuizAnswer { correct: boolean; detail?: string }

/* ------------------------- تقييم كل نوع سؤال ------------------------- */
function evaluate(q: Question, v: any): boolean {
  switch (q.t) {
    case 'mcq': return v === q.correct;
    case 'tf': return v === q.correct;
    case 'classify': return q.items.every((it, i) => v?.[i] === it.cat);
    case 'match': return q.pairs.every((p, i) => v?.[i] === i);
    case 'order': return Array.isArray(v) && q.items.every((it, i) => v[i] === it);
    case 'fill': return q.slots.every((s, i) => {
      const val = String(v?.[i] ?? '').trim();
      return val.length > 0 && s.accept.some((a) => val.includes(a) || a.includes(val));
    });
  }
}

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

/* ------------------------------ السؤال ------------------------------ */
function QuestionView({ q, value, onChange, locked }: { q: Question; value: any; onChange: (v: any) => void; locked: boolean }) {
  const rightOptions = useMemo(() => (q.t === 'match' ? shuffle(q.pairs.map((p, i) => ({ i, r: p.r }))) : []), [q]);
  const orderItems = useMemo(() => (q.t === 'order' ? shuffle(q.items) : []), [q]);
  const [drag, setDrag] = useState('');

  React.useEffect(() => {
    if (q.t === 'order' && !value) onChange(orderItems);
  }, [q]);

  switch (q.t) {
    case 'mcq':
      return (
        <div className="space-y-2">
          {q.options.map((o, i) => {
            const on = value === i;
            const state = !locked ? (on ? 'sel' : 'idle') : i === q.correct ? 'right' : on ? 'wrong' : 'dim';
            return (
              <button key={i} disabled={locked} onClick={() => onChange(i)}
                className={`w-full text-right px-3.5 py-2.5 rounded-lg border text-[13.5px] leading-relaxed transition flex items-start gap-2.5
                  ${state === 'idle' ? 'border-stone-200 hover:border-forest-400 hover:bg-forest-50/40'
                  : state === 'sel' ? 'border-forest-500 bg-forest-50'
                  : state === 'right' ? 'border-ok-300 bg-ok-50'
                  : state === 'wrong' ? 'border-danger-300 bg-danger-50' : 'border-stone-200 opacity-50'}`}>
                <span className={`mt-0.5 w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold shrink-0
                  ${state === 'right' ? 'bg-ok-500 text-white' : state === 'wrong' ? 'bg-danger-500 text-white' : on ? 'bg-forest-700 text-white' : 'bg-stone-100 text-ink-mute'}`}>
                  {state === 'right' ? '✓' : state === 'wrong' ? '✕' : String.fromCharCode(1571 + i)}
                </span>
                <span className="flex-1">{o}</span>
              </button>
            );
          })}
        </div>
      );

    case 'tf':
      return (
        <div className="flex gap-2">
          {[true, false].map((b) => {
            const on = value === b;
            const state = !locked ? (on ? 'sel' : 'idle') : b === q.correct ? 'right' : on ? 'wrong' : 'dim';
            return (
              <button key={String(b)} disabled={locked} onClick={() => onChange(b)}
                className={`flex-1 px-4 py-3 rounded-lg border text-[14px] font-medium transition
                  ${state === 'idle' ? 'border-stone-200 hover:border-forest-400'
                  : state === 'sel' ? 'border-forest-500 bg-forest-50'
                  : state === 'right' ? 'border-ok-300 bg-ok-50 text-ok-500'
                  : state === 'wrong' ? 'border-danger-300 bg-danger-50 text-danger-600' : 'border-stone-200 opacity-50'}`}>
                {b ? 'صحيح' : 'خطأ'}
              </button>
            );
          })}
        </div>
      );

    case 'classify':
      return (
        <div className="space-y-2">
          {q.items.map((it, i) => {
            const ok = locked && value?.[i] === it.cat;
            return (
              <div key={i} className={`grid sm:grid-cols-[1fr_200px] gap-2 items-center rounded-lg border p-2.5
                ${locked ? (ok ? 'border-ok-300 bg-ok-50' : 'border-danger-300 bg-danger-50') : 'border-stone-200'}`}>
                <span className="text-[13px] leading-relaxed">{it.text}</span>
                <select disabled={locked} value={value?.[i] ?? ''} className="field field-sm"
                  onChange={(e) => { const v = [...(value ?? [])]; v[i] = e.target.value; onChange(v); }}>
                  <option value="">— اختاري الفئة —</option>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
                </select>
                {locked && !ok && <span className="sm:col-span-2 text-[12px] text-danger-600">الصحيح: {CATEGORIES.find((c) => c.id === it.cat)!.name}</span>}
              </div>
            );
          })}
        </div>
      );

    case 'match':
      return (
        <div className="space-y-2">
          {q.pairs.map((p, i) => {
            const ok = locked && value?.[i] === i;
            return (
              <div key={i} className={`grid sm:grid-cols-[1fr_1fr] gap-2 items-center rounded-lg border p-2.5
                ${locked ? (ok ? 'border-ok-300 bg-ok-50' : 'border-danger-300 bg-danger-50') : 'border-stone-200'}`}>
                <span className="text-[13px] leading-relaxed font-medium">{p.l}</span>
                <select disabled={locked} value={value?.[i] ?? ''} className="field field-sm"
                  onChange={(e) => { const v = [...(value ?? [])]; v[i] = e.target.value === '' ? '' : +e.target.value; onChange(v); }}>
                  <option value="">— اختاري المقابل —</option>
                  {rightOptions.map((o) => <option key={o.i} value={o.i}>{o.r}</option>)}
                </select>
                {locked && !ok && <span className="sm:col-span-2 text-[12px] text-danger-600">الصحيح: {p.r}</span>}
              </div>
            );
          })}
        </div>
      );

    case 'order': {
      const list: string[] = value ?? orderItems;
      const move = (from: string, to: string) => {
        const a = [...list];
        const fi = a.indexOf(from), ti = a.indexOf(to);
        if (fi < 0 || ti < 0) return;
        const [m] = a.splice(fi, 1); a.splice(ti, 0, m); onChange(a);
      };
      return (
        <div className="space-y-2">
          {list.map((x, i) => {
            const ok = locked && q.items[i] === x;
            return (
              <div key={x} draggable={!locked} onDragStart={() => setDrag(x)} onDragOver={(e) => e.preventDefault()} onDrop={() => { move(drag, x); setDrag(''); }}
                className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 ${locked ? '' : 'cursor-grab active:cursor-grabbing'}
                  ${locked ? (ok ? 'border-ok-300 bg-ok-50' : 'border-danger-300 bg-danger-50') : 'border-stone-200'}`}>
                {!locked && <Icon name="drag" className="w-4 h-4 text-stone-400 shrink-0" />}
                <span className="w-6 h-6 rounded-md bg-stone-100 grid place-items-center text-[11.5px] font-bold shrink-0">{i + 1}</span>
                <span className="text-[13px] flex-1 leading-relaxed">{x}</span>
                {locked && !ok && <span className="text-[11.5px] text-danger-600 shrink-0">الصحيح هنا: {q.items[i]}</span>}
              </div>
            );
          })}
          {!locked && <p className="text-[12px] text-ink-mute">اسحبي العناصر لترتيبها.</p>}
        </div>
      );
    }

    case 'fill':
      return (
        <div className="space-y-2.5">
          <div className="rounded-lg bg-stone-50 p-3 text-[13px] leading-[1.9] text-ink-soft">{q.preview}</div>
          {q.slots.map((s, i) => {
            const val = String(value?.[i] ?? '');
            const ok = locked && s.accept.some((a) => val.trim() && (val.includes(a) || a.includes(val.trim())));
            return (
              <div key={i} className={`rounded-lg border p-2.5 ${locked ? (ok ? 'border-ok-300 bg-ok-50' : 'border-danger-300 bg-danger-50') : 'border-stone-200'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[12px] font-bold text-ink-soft">[{s.label}]</span>
                  <span className="text-[11.5px] text-ink-mute">{s.hint}</span>
                </div>
                <Input disabled={locked} value={val} className="field-sm"
                  onChange={(e) => { const v = [...(value ?? [])]; v[i] = e.target.value; onChange(v); }} />
                {locked && !ok && <div className="text-[12px] text-danger-600 mt-1.5">من المتوقع: {s.accept[0]}</div>}
              </div>
            );
          })}
        </div>
      );
  }
}

/* ------------------------------ المحرك ------------------------------ */
export function Quiz({ questions, title, onDone, passMark = 70 }: {
  questions: Question[]; title: string; passMark?: number;
  onDone: (result: { score: number; correct: number; total: number }) => void;
}) {
  const { dispatch } = useStore();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);

  const q = questions[i];
  const isLocked = !!locked[q.id];
  const correctCount = questions.filter((x) => locked[x.id] && evaluate(x, answers[x.id])).length;
  const answeredCount = Object.keys(locked).length;

  const submit = () => {
    const ok = evaluate(q, answers[q.id]);
    setLocked({ ...locked, [q.id]: true });
    dispatch({ type: 'concept', concept: q.concept, correct: ok });
  };

  const finish = () => {
    const c = questions.filter((x) => evaluate(x, answers[x.id])).length;
    setDone(true);
    onDone({ score: Math.round((c / questions.length) * 100), correct: c, total: questions.length });
  };

  if (done) {
    const c = questions.filter((x) => evaluate(x, answers[x.id])).length;
    const score = Math.round((c / questions.length) * 100);
    const weak = questions.filter((x) => !evaluate(x, answers[x.id]));
    return (
      <Card>
        <div className="text-center py-4">
          <div className={`w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-3 ${score >= passMark ? 'bg-ok-500' : 'bg-gold-500'} text-white`}>
            <Icon name={score >= passMark ? 'award' : 'refresh'} className="w-8 h-8" />
          </div>
          <div className="text-[34px] font-bold leading-none" style={{ color: score >= passMark ? '#2F7D55' : '#B4903F' }}>{score}%</div>
          <p className="text-[14px] mt-2">{c} من {questions.length} إجابة صحيحة</p>
          <p className="text-[13px] text-ink-mute mt-1">{score >= passMark ? 'اجتزتِ الاختبار' : `حد النجاح ${passMark}% — راجعي المواضع أدناه وأعيدي المحاولة`}</p>
        </div>
        {weak.length > 0 && (
          <div className="mt-4">
            <div className="text-[13px] font-bold mb-2">مواضع تحتاج مراجعة</div>
            <ul className="space-y-1.5">
              {weak.map((x) => (
                <li key={x.id} className="flex items-start gap-2 rounded-lg bg-warn-50 p-2.5 text-[12.5px]">
                  <Icon name="refresh" className="w-4 h-4 text-warn-500 shrink-0 mt-0.5" />
                  <span>{x.review}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2 justify-center mt-5">
          <Button icon="refresh" onClick={() => { setDone(false); setI(0); setAnswers({}); setLocked({}); }}>إعادة الاختبار</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[12.5px] text-ink-mute whitespace-nowrap">سؤال {i + 1} من {questions.length}</span>
        <div className="flex-1"><Progress value={(answeredCount / questions.length) * 100} height={5} /></div>
        <span className="text-[12.5px] font-semibold whitespace-nowrap">{correctCount} صحيحة</span>
      </div>

      <Card>
        <div className="flex items-start gap-2 mb-3.5">
          <Tag tone="forest">{({ mcq: 'اختيار من متعدد', tf: 'صح / خطأ', classify: 'تصنيف', match: 'مطابقة', order: 'ترتيب', fill: 'إكمال نموذج' } as any)[q.t]}</Tag>
          <div className="flex-1" />
          <span className="text-[11px] text-ink-mute bg-stone-100 rounded px-1.5 py-0.5">{q.review}</span>
        </div>
        <p className="text-[15px] font-medium leading-relaxed mb-4">{q.q}</p>

        <QuestionView q={q} value={answers[q.id]} locked={isLocked} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />

        {isLocked && (
          <div className="mt-4 space-y-2 anim-in">
            <div className={`rounded-lg p-3.5 text-[13px] leading-[1.95] ${evaluate(q, answers[q.id]) ? 'bg-ok-50' : 'bg-danger-50'}`}>
              <strong className={evaluate(q, answers[q.id]) ? 'text-ok-500' : 'text-danger-600'}>
                {evaluate(q, answers[q.id]) ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}
              </strong>
              <span className="text-ink-soft"> — {q.why}</span>
            </div>
            {q.t === 'mcq' && q.wrongWhy && answers[q.id] !== q.correct && q.wrongWhy[answers[q.id]] && (
              <div className="rounded-lg bg-stone-50 p-3 text-[12.5px] text-ink-soft leading-relaxed">
                <strong>لماذا خيارك غير صحيح؟</strong> {q.wrongWhy[answers[q.id]]}
              </div>
            )}
            {!evaluate(q, answers[q.id]) && (
              <div className="rounded-lg bg-warn-50 p-3 text-[12.5px] leading-relaxed">
                <strong className="text-warn-500">ما يحتاج مراجعة:</strong> <span className="text-ink-soft">{q.review}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          {!isLocked ? (
            <Button variant="primary" icon="check" disabled={answers[q.id] === undefined} onClick={submit}>تأكيد الإجابة</Button>
          ) : i < questions.length - 1 ? (
            <Button variant="primary" icon="chevron" onClick={() => setI(i + 1)}>السؤال التالي</Button>
          ) : (
            <Button variant="gold" icon="award" onClick={finish}>إنهاء الاختبار</Button>
          )}
          {i > 0 && <Button icon="chevronD" onClick={() => setI(i - 1)}>السابق</Button>}
        </div>
      </Card>
    </div>
  );
}
