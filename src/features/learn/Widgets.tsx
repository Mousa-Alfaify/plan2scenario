import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Input, Tag, Progress, toast, Accordion, SectionTitle } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CATEGORIES, COMMON_MISTAKES, GLOSSARY, GRADE_DEFS, REFERENCES, STAGES } from '../../data/categories';
import { CLASSIFY_ITEMS, DECISION_TREE, ERROR_CASES, PATH_CASES, SEQUENCE_ITEMS } from '../../data/labs';
import { XP } from '../../data/badges';

import { Decompose } from '../build/Decompose';
import { Matrix } from '../build/Matrix';
import { History } from '../build/History';
import { Injects } from '../build/Injects';
import { Msel } from '../build/Msel';
import { Criteria } from '../build/Criteria';
import { Observe } from '../build/Observe';
import { Escalation } from '../build/Escalation';
import { Aar } from '../build/Aar';
import { Pipeline } from '../build/Pipeline';
import { ChecklistView } from '../build/Checklist';
import { Simulation } from '../labs/Simulation';

/* ========================= خريطة رحلة الدليل ========================= */
function JourneyMap() {
  const { go, dispatch } = useStore();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {STAGES.map((s) => (
        <button key={s.id} onClick={() => { dispatch({ type: 'mode', mode: 'build' }); go(s.route); }}
          className="rounded-xl border border-stone-200 p-3 text-right hover:border-forest-300 hover:bg-forest-50/40 transition">
          <div className="w-6 h-6 rounded-md bg-forest-50 text-forest-700 grid place-items-center text-[11.5px] font-bold mb-1.5">{s.n}</div>
          <div className="text-[12px] font-semibold leading-snug">{s.name}</div>
          <div className="text-[10.5px] text-ink-mute mt-1">{s.ref}</div>
        </button>
      ))}
    </div>
  );
}

/* ========================= الفئات السبع ========================= */
function SevenCategories() {
  const [sel, setSel] = useState(CATEGORIES[0].id);
  const c = CATEGORIES.find((x) => x.id === sel)!;
  return (
    <div className="grid md:grid-cols-[210px_1fr] gap-3">
      <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible">
        {CATEGORIES.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)}
            className={`shrink-0 md:shrink text-right px-3 py-2.5 rounded-lg text-[13px] font-medium transition flex items-center gap-2
              ${sel === x.id ? 'bg-forest-700 text-white' : 'bg-white border border-stone-200 hover:border-forest-300'}`}>
            <span className={`w-5 h-5 rounded-md grid place-items-center text-[11px] font-bold shrink-0 ${sel === x.id ? 'bg-white/20' : 'bg-forest-50 text-forest-700'}`}>{x.n}</span>
            <span className="whitespace-nowrap md:whitespace-normal">{x.name}</span>
          </button>
        ))}
      </div>
      <Card className="anim-in" key={c.id}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-forest-700 text-white grid place-items-center font-bold">{c.n}</span>
          <h4 className="font-bold text-[16px]">{c.name}</h4>
        </div>
        <div className="space-y-3">
          <div><div className="text-[11.5px] font-bold text-ink-mute mb-1">التعريف</div><p className="text-[13.5px] leading-relaxed">{c.definition}</p></div>
          <div><div className="text-[11.5px] font-bold text-ink-mute mb-1">الأسئلة التي تكشف بنود الاختبار</div><p className="text-[13.5px] leading-relaxed">{c.questions}</p></div>
          <div><div className="text-[11.5px] font-bold text-ink-mute mb-1">ما الذي يُقاس</div><p className="text-[13.5px] leading-relaxed">{c.measure}</p></div>
          <div className="rounded-lg bg-forest-50/60 border border-forest-200 p-3">
            <div className="text-[11.5px] font-bold text-forest-800 mb-1">مثال محفز (5.2)</div>
            <p className="text-[13px] leading-relaxed">{c.injectExample}</p>
            <p className="text-[12px] text-ink-mute mt-1.5">ما يجبر الفريق على فعله: {c.injectForces}</p>
          </div>
          <div className="text-[12px] text-ink-mute">
            الموضع الزمني الموصى به في السيناريو (5.5): {c.phase === 'early' ? 'الثلث الأول' : c.phase === 'mid' ? 'الثلث الأوسط' : 'الثلث الأخير'}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ========================= عدّاد البنود غير المختبرة ========================= */
function UntestedCounter() {
  const [n, setN] = useState('');
  const v = parseInt(n, 10);
  return (
    <Card>
      <p className="text-[13.5px] leading-relaxed mb-3">
        افتحي خطة الطوارئ في منشأتك، وعدّي بندًا رئيسيًا فيها لم يُختبر في آخر تمرينين نُفذا. أدخلي الرقم:
      </p>
      <div className="flex gap-2 items-center">
        <Input type="number" min={0} value={n} onChange={(e) => setN(e.target.value)} className="w-28 text-center" placeholder="0" />
        <span className="text-[13px] text-ink-mute">بندًا</span>
      </div>
      {!isNaN(v) && n !== '' && (
        <div className={`mt-3 rounded-lg p-3.5 text-[13.5px] leading-[1.9] anim-in
          ${v === 0 ? 'bg-ok-50 text-ok-500' : v <= 3 ? 'bg-warn-50 text-warn-500' : 'bg-danger-50 text-danger-600'}`}>
          {v === 0
            ? <><strong>ممتاز.</strong> <span className="text-ink-soft">إن كان هذا دقيقًا فخطتك تحت تدقيق منتظم. راجعي سجل التغطية التراكمي (6.2) للتأكد أن التغطية موزعة لا مكررة على نفس البنود «السهلة».</span></>
            : v <= 3
              ? <><strong>{v} بنود دون اختبار.</strong> <span className="text-ink-soft">ابدئي بالمسار العكسي واستهدفي هذه البنود تحديدًا في التمرين القادم.</span></>
              : <><strong>{v} بندًا دون اختبار.</strong> <span className="text-ink-soft">هذا الرقم هو أول مؤشر على حاجتك لهذا الدليل (2.3). قد يحتاج الأمر أكثر من تمرين واحد — خططي تغطية موزعة في خطة التمارين السنوية (4.3).</span></>}
        </div>
      )}
    </Card>
  );
}

/* ========================= اختيار المسار ========================= */
function PathChooser() {
  const { dispatch } = useStore();
  const [ans, setAns] = useState<Record<string, string>>({});
  const done = Object.keys(ans).length === PATH_CASES.length;
  const score = PATH_CASES.filter((c) => ans[c.id] === c.answer).length;
  React.useEffect(() => { if (done) dispatch({ type: 'lab', id: 'path-chooser', score: Math.round((score / PATH_CASES.length) * 100) }); }, [done]);
  return (
    <div className="space-y-2.5">
      {PATH_CASES.map((c) => {
        const a = ans[c.id];
        const ok = a === c.answer;
        return (
          <Card key={c.id} className={a ? (ok ? 'border-ok-300' : 'border-danger-300') : ''}>
            <p className="text-[13.5px] leading-relaxed mb-3">{c.text}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={a === 'traditional' ? (ok ? 'primary' : 'danger') : 'secondary'} disabled={!!a}
                onClick={() => setAns({ ...ans, [c.id]: 'traditional' })}>المسار التقليدي (خطر ← سيناريو)</Button>
              <Button size="sm" variant={a === 'backward' ? (ok ? 'primary' : 'danger') : 'secondary'} disabled={!!a}
                onClick={() => setAns({ ...ans, [c.id]: 'backward' })}>المسار العكسي (خطة ← سيناريو)</Button>
            </div>
            {a && (
              <div className={`mt-3 rounded-lg p-3 text-[12.5px] leading-relaxed anim-in ${ok ? 'bg-ok-50' : 'bg-danger-50'}`}>
                <strong className={ok ? 'text-ok-500' : 'text-danger-600'}>{ok ? 'صحيح' : 'غير صحيح'}</strong>
                <span className="text-ink-soft"> — {c.why}</span>
              </div>
            )}
          </Card>
        );
      })}
      {done && <div className="rounded-lg bg-forest-50 border border-forest-200 p-3.5 text-[13.5px]"><strong>النتيجة: {score} من {PATH_CASES.length}</strong></div>}
    </div>
  );
}

/* ========================= سحب وإفلات التصنيف ========================= */
function DragClassify() {
  const { dispatch } = useStore();
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [drag, setDrag] = useState('');
  const [checked, setChecked] = useState(false);
  const pool = CLASSIFY_ITEMS.filter((i) => !placed[i.id]);
  const correct = CLASSIFY_ITEMS.filter((i) => placed[i.id] === i.cat).length;
  const all = Object.keys(placed).length === CLASSIFY_ITEMS.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-ink-mute">اسحبي كل بند إلى فئته الصحيحة ({Object.keys(placed).length}/{CLASSIFY_ITEMS.length})</span>
        <div className="flex-1" />
        {all && !checked && <Button size="sm" variant="primary" icon="check" onClick={() => { setChecked(true); dispatch({ type: 'lab', id: 'drag-classify', score: Math.round((correct / CLASSIFY_ITEMS.length) * 100) }); }}>تحقق</Button>}
        {(Object.keys(placed).length > 0) && <Button size="sm" icon="refresh" onClick={() => { setPlaced({}); setChecked(false); }}>إعادة</Button>}
      </div>

      {pool.length > 0 && (
        <Card pad={false}>
          <div className="p-3 flex flex-wrap gap-2">
            {pool.map((i) => (
              <div key={i.id} draggable onDragStart={() => setDrag(i.id)} onDragEnd={() => setDrag('')}
                className="cursor-grab active:cursor-grabbing rounded-lg bg-white border border-stone-300 px-3 py-2 text-[12.5px] shadow-sm hover:border-forest-400 flex items-center gap-1.5">
                <Icon name="drag" className="w-3.5 h-3.5 text-stone-400" />{i.text}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {CATEGORIES.map((c) => {
          const mine = CLASSIFY_ITEMS.filter((i) => placed[i.id] === c.id);
          return (
            <div key={c.id} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) { setPlaced({ ...placed, [drag]: c.id }); setDrag(''); } }}
              className="rounded-xl border-2 border-dashed border-stone-300 bg-white p-2.5 min-h-[110px] hover:border-forest-400 transition">
              <div className="text-[12px] font-bold text-ink-soft mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-forest-50 text-forest-700 grid place-items-center text-[10.5px]">{c.n}</span>{c.name}
              </div>
              <div className="space-y-1.5">
                {mine.map((i) => {
                  const ok = i.cat === c.id;
                  return (
                    <div key={i.id} onClick={() => { const p = { ...placed }; delete p[i.id]; setPlaced(p); setChecked(false); }}
                      className={`rounded-md px-2 py-1.5 text-[11.5px] cursor-pointer leading-snug
                        ${checked ? (ok ? 'bg-ok-50 text-ok-500 border border-ok-300' : 'bg-danger-50 text-danger-600 border border-danger-300') : 'bg-stone-50 border border-stone-200'}`}>
                      {i.text}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {checked && (
        <div className={`rounded-lg p-3.5 text-[13.5px] anim-in ${correct === CLASSIFY_ITEMS.length ? 'bg-ok-50 text-ok-500' : 'bg-warn-50 text-warn-500'}`}>
          <strong>{correct} من {CLASSIFY_ITEMS.length} صحيحة.</strong>
          <span className="text-ink-soft"> {correct === CLASSIFY_ITEMS.length ? 'تصنيف مطابق لجدول 3.2 بالكامل.' : 'البنود المظللة بالأحمر في الفئة الخاطئة — اضغطي عليها لإرجاعها وإعادة المحاولة.'}</span>
        </div>
      )}
    </div>
  );
}

/* ========================= أمثلة المحفزات ========================= */
function InjectExamples() {
  return (
    <Accordion items={CATEGORIES.map((c) => ({
      id: c.id,
      title: <span className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-forest-50 text-forest-700 grid place-items-center text-[11px] font-bold">{c.n}</span>{c.name}</span>,
      body: (
        <div className="space-y-2.5 pr-7">
          <div className="rounded-lg bg-stone-50 p-3">
            <div className="text-[11.5px] font-bold text-ink-mute mb-1">مثال المحفز</div>
            <p className="text-[13.5px] leading-relaxed">{c.injectExample}</p>
          </div>
          <div className="rounded-lg bg-forest-50/60 border border-forest-200 p-3">
            <div className="text-[11.5px] font-bold text-forest-800 mb-1">ما الذي يجبر الفريق على فعله</div>
            <p className="text-[13.5px] leading-relaxed">{c.injectForces}</p>
          </div>
        </div>
      ),
    }))} />
  );
}

/* ========================= ترتيب المحفزات ========================= */
function SequenceSort() {
  const { dispatch } = useStore();
  const [order, setOrder] = useState(() => [...SEQUENCE_ITEMS].sort(() => Math.random() - 0.5));
  const [drag, setDrag] = useState('');
  const [checked, setChecked] = useState(false);
  const correctOrder = [...SEQUENCE_ITEMS].sort((a, b) => a.phase - b.phase);
  const ok = order.every((x, i) => x.phase === correctOrder[i].phase);

  const move = (from: string, to: string) => {
    const a = [...order];
    const fi = a.findIndex((x) => x.id === from), ti = a.findIndex((x) => x.id === to);
    if (fi < 0 || ti < 0) return;
    const [m] = a.splice(fi, 1); a.splice(ti, 0, m); setOrder(a); setChecked(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-mute">اسحبي المحفزات لترتيبها زمنيًا حسب قاعدة 5.5: التفعيل والقيادة أولاً، ثم الاتصال والموارد، ثم الاستمرارية والتعافي.</p>
      <div className="space-y-2">
        {order.map((x, i) => (
          <div key={x.id} draggable onDragStart={() => setDrag(x.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => { move(drag, x.id); setDrag(''); }}
            className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 cursor-grab active:cursor-grabbing
              ${checked ? (x.phase === correctOrder[i].phase ? 'border-ok-300 bg-ok-50' : 'border-danger-300 bg-danger-50') : 'border-stone-200'}`}>
            <Icon name="drag" className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="w-6 h-6 rounded-md bg-stone-100 grid place-items-center text-[11.5px] font-bold shrink-0">{i + 1}</span>
            <span className="text-[13px] flex-1">{x.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="primary" icon="check" onClick={() => { setChecked(true); dispatch({ type: 'lab', id: 'sequence-sort', score: ok ? 100 : 50 }); }}>تحقق</Button>
        <Button size="sm" icon="refresh" onClick={() => { setOrder([...SEQUENCE_ITEMS].sort(() => Math.random() - 0.5)); setChecked(false); }}>خلط</Button>
      </div>
      {checked && (
        <div className={`rounded-lg p-3.5 text-[13.5px] leading-relaxed anim-in ${ok ? 'bg-ok-50 text-ok-500' : 'bg-danger-50 text-danger-600'}`}>
          <strong>{ok ? 'ترتيب صحيح' : 'الترتيب غير مطابق'}</strong>
          <span className="text-ink-soft"> — التفعيل والقيادة أولاً لأنها شرط مسبق لبقية الاستجابة، ثم الاتصال والموارد في المنتصف، وتُترك الاستمرارية والتعافي للثلث الأخير حيث يكون الضغط التراكمي في ذروته، وهذا يضمن اختبارها في ظروف واقعية لا مصطنعة (5.5).</span>
        </div>
      )}
    </div>
  );
}

/* ========================= شجرة القرار ========================= */
function DecisionTree() {
  const [node, setNode] = useState(DECISION_TREE.start);
  const [path, setPath] = useState<string[]>([]);
  const isResult = node.startsWith('r_');
  const q = (DECISION_TREE.nodes as any)[node];
  const r = (DECISION_TREE.results as any)[node];
  const tone = { ok: 'border-ok-300 bg-ok-50', info: 'border-info-300/60 bg-info-50', warn: 'border-warn-300 bg-warn-50', danger: 'border-danger-300/60 bg-danger-50' } as any;

  return (
    <div className="space-y-3">
      {path.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {path.map((p, i) => <Tag key={i} tone="neutral">{p}</Tag>)}
        </div>
      )}
      {!isResult ? (
        <Card>
          <p className="text-[15px] font-medium leading-relaxed mb-4">{q.q}</p>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => { setPath([...path, 'نعم']); setNode(q.yes); }}>نعم</Button>
            <Button onClick={() => { setPath([...path, 'لا']); setNode(q.no); }}>لا</Button>
          </div>
        </Card>
      ) : (
        <Card className={tone[r.tone]}>
          <div className="flex items-start gap-3">
            <Icon name="flag" className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[15px]">{r.title}</div>
              <p className="text-[13.5px] leading-[1.9] mt-1.5 text-ink-soft">{r.body}</p>
            </div>
          </div>
          <Button size="sm" icon="refresh" className="mt-4" onClick={() => { setNode(DECISION_TREE.start); setPath([]); }}>إعادة</Button>
        </Card>
      )}
    </div>
  );
}

/* ========================= جدول الأخطاء + عيادة الأخطاء ========================= */
function MistakesTable() {
  return (
    <div className="overflow-x-auto rounded-xl2 border border-stone-200 bg-white">
      <table className="w-full min-w-[520px] border-collapse">
        <thead><tr><th className="th">الخطأ</th><th className="th">لماذا يُخل بهدف اختبار الخطة</th></tr></thead>
        <tbody>
          {COMMON_MISTAKES.map((m) => (
            <tr key={m.id} className="hover:bg-stone-50">
              <td className="td font-semibold">{m.mistake}</td>
              <td className="td text-ink-soft">{m.why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorClinic() {
  const { dispatch } = useStore();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState('');
  const [score, setScore] = useState(0);
  const c = ERROR_CASES[i];
  const answered = !!pick;
  const ok = pick === c.answer;

  const next = () => {
    if (i === ERROR_CASES.length - 1) {
      dispatch({ type: 'lab', id: 'error-clinic', score: Math.round(((score + (ok ? 1 : 0)) / ERROR_CASES.length) * 100) });
      toast(`انتهت العيادة: ${score + (ok ? 1 : 0)} من ${ERROR_CASES.length}`);
      setI(0); setPick(''); setScore(0);
    } else { if (ok) setScore(score + 1); setI(i + 1); setPick(''); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[12.5px] text-ink-mute">الحالة {i + 1} من {ERROR_CASES.length}</span>
        <div className="flex-1"><Progress value={((i) / ERROR_CASES.length) * 100} height={5} /></div>
        <span className="text-[12.5px] font-semibold">{score} صحيحة</span>
      </div>
      <Card>
        <div className="rounded-lg bg-stone-50 p-3.5 mb-4">
          <div className="text-[11.5px] font-bold text-ink-mute mb-1.5">الحالة</div>
          <p className="text-[14px] leading-[1.9]">{c.scenario}</p>
        </div>
        <p className="text-[14px] font-semibold mb-2.5">ما الخطأ هنا؟</p>
        <div className="space-y-2">
          {COMMON_MISTAKES.map((m) => {
            const state = !answered ? 'idle' : m.id === c.answer ? 'right' : m.id === pick ? 'wrong' : 'dim';
            return (
              <button key={m.id} disabled={answered} onClick={() => { setPick(m.id); dispatch({ type: 'concept', concept: 'common-mistakes', correct: m.id === c.answer }); }}
                className={`w-full text-right px-3.5 py-2.5 rounded-lg border text-[13.5px] transition
                  ${state === 'idle' ? 'border-stone-200 hover:border-forest-400 hover:bg-forest-50/40'
                  : state === 'right' ? 'border-ok-300 bg-ok-50' : state === 'wrong' ? 'border-danger-300 bg-danger-50' : 'border-stone-200 opacity-50'}`}>
                {m.mistake}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-3 space-y-2 anim-in">
            <div className={`rounded-lg p-3.5 text-[13px] leading-[1.9] ${ok ? 'bg-ok-50' : 'bg-danger-50'}`}>
              <strong className={ok ? 'text-ok-500' : 'text-danger-600'}>{ok ? 'تشخيص صحيح' : 'تشخيص غير صحيح'}</strong>
              <span className="text-ink-soft"> — {c.explain}</span>
            </div>
            <div className="rounded-lg bg-stone-50 p-3 text-[12.5px] text-ink-soft leading-relaxed">
              <strong>أثره حسب الفصل 12:</strong> {COMMON_MISTAKES.find((m) => m.id === c.answer)!.why}
            </div>
            <Button variant="primary" icon="chevron" onClick={next}>{i === ERROR_CASES.length - 1 ? 'إنهاء العيادة' : 'الحالة التالية'}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ========================= معاني الدرجات + المراجع + المسرد ========================= */
function GradeDefs() {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      {GRADE_DEFS.map((g) => (
        <div key={g.id} className={`rounded-xl2 border p-4 ${g.id === 'full' ? 'border-ok-300 bg-ok-50' : g.id === 'partial' ? 'border-warn-300 bg-warn-50' : 'border-danger-300/60 bg-danger-50'}`}>
          <div className="font-bold text-[15px] mb-1.5">{g.label}</div>
          <p className="text-[13px] text-ink-soft leading-relaxed">{g.meaning}</p>
          <div className="mt-3 pt-3 border-t border-black/5">
            <div className="text-[11px] font-bold text-ink-mute mb-1">الإجراء المطلوب لاحقًا</div>
            <p className="text-[12.5px] leading-relaxed">{g.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReferencesList() {
  return (
    <ul className="space-y-2.5">
      {REFERENCES.map((r, i) => (
        <li key={i} className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-3">
          <Icon name="book" className="w-4 h-4 text-ink-mute shrink-0 mt-1" />
          <div><span className="lat text-[13.5px] font-medium">{r.t}</span>{r.d && <span className="block text-[12.5px] text-ink-mute mt-0.5">{r.d}</span>}</div>
        </li>
      ))}
    </ul>
  );
}

function Glossary() {
  return (
    <Accordion items={GLOSSARY.map((g) => ({
      id: g.term,
      title: <span className="flex flex-wrap items-center gap-2"><span className="lat font-semibold">{g.term}</span><span className="text-ink-mute text-[13px]">{g.ar}</span></span>,
      body: <p className="text-[13.5px] leading-[1.9] text-ink-soft pr-7">{g.def}</p>,
    }))} />
  );
}

/* ============================== السجل ============================== */
const REGISTRY: Record<string, React.ComponentType<any>> = {
  'journey-map': JourneyMap,
  'seven-categories': SevenCategories,
  'untested-counter': UntestedCounter,
  'path-chooser': PathChooser,
  'drag-classify': DragClassify,
  'inject-examples': InjectExamples,
  'sequence-sort': SequenceSort,
  'decision-tree': DecisionTree,
  'mistakes-table': MistakesTable,
  'error-clinic': ErrorClinic,
  'grade-defs': GradeDefs,
  'references': ReferencesList,
  'glossary': Glossary,
  'simulation': Simulation,
  // أدوات وضع التطبيق مدمجة داخل الدرس
  'decompose-lab': Decompose,
  'matrix-builder': Matrix,
  'coverage-history': History,
  'inject-builder': Injects,
  'msel-builder': Msel,
  'criteria-builder': Criteria,
  'observer-mode': Observe,
  'escalation-builder': Escalation,
  'aar-tool': Aar,
  'pipeline': Pipeline,
  'checklist': ChecklistView,
};

export function Widget({ id }: { id: string }) {
  const C = REGISTRY[id];
  if (!C) return <div className="rounded-lg bg-stone-50 p-3 text-[13px] text-ink-mute">عنصر غير معروف: {id}</div>;
  return <C embedded />;
}
