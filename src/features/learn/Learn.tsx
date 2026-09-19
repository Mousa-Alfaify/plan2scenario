import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Progress, SectionTitle, Tag, toast } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { MODULES, MODULE_MAP } from '../../data/content';
import { QUIZZES } from '../../data/quizzes';
import { BADGE_MAP } from '../../data/badges';
import { BlockView } from './Blocks';
import { Quiz } from './Quiz';

/* ============================ قائمة الوحدات ============================ */
export function LearnList() {
  const { state, go } = useStore();
  const pg = state.progress;
  const done = MODULES.filter((m) => pg.modules[m.id]?.completed).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] sm:text-[25px] font-bold">الوحدات التعليمية</h1>
        <p className="text-[13.5px] text-ink-mute mt-1.5 max-w-2xl leading-relaxed">
          {MODULES.length} وحدة تغطي فصول الدليل كاملة. كل وحدة مقسّمة إلى شرائح تعلّم مصغّر، وتنتهي باختبار يقيس الفهم لا الحفظ.
        </p>
        <div className="mt-4 max-w-md"><Progress value={Math.round((done / MODULES.length) * 100)} label={`${done} من ${MODULES.length} وحدة مكتملة`} /></div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.map((m) => {
          const p = pg.modules[m.id];
          const seen = p?.seen.length ?? 0;
          const pct = Math.round((seen / m.slides.length) * 100);
          return (
            <button key={m.id} onClick={() => go(`#/learn/${m.id}`)}
              className="card card-pad text-right hover:border-forest-300 hover:shadow-lift transition flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <span className={`w-10 h-10 rounded-lg grid place-items-center shrink-0
                  ${p?.completed ? 'bg-forest-700 text-white' : 'bg-forest-50 text-forest-700'}`}>
                  <Icon name={m.icon} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-ink-mute">الوحدة {m.n} · {m.chapter}</div>
                  <div className="font-bold text-[14.5px] leading-snug">{m.title}</div>
                </div>
                {p?.completed && <Icon name="check" className="w-5 h-5 text-ok-500 shrink-0" />}
              </div>
              <p className="text-[12.5px] text-ink-mute leading-relaxed flex-1">{m.subtitle}</p>
              <div className="mt-3">
                <Progress value={pct} height={5} />
                <div className="flex items-center justify-between mt-2 text-[11.5px] text-ink-mute">
                  <span>{seen} / {m.slides.length} شريحة</span>
                  {p?.quiz && <Tag tone={p.quiz.best >= 70 ? 'green' : 'gold'}>الاختبار {p.quiz.best}%</Tag>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ عارض الوحدة ============================ */
export function ModuleView({ id }: { id: string }) {
  const { state, dispatch, go } = useStore();
  const m = MODULE_MAP[id];
  const [idx, setIdx] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => { setIdx(0); setShowQuiz(false); }, [id]);
  useEffect(() => {
    if (!m) return;
    const s = m.slides[idx];
    if (s) dispatch({ type: 'slideSeen', moduleId: m.id, slideId: s.id });
  }, [idx, id]);

  if (!m) return <Card>وحدة غير موجودة.</Card>;

  const prog = state.progress.modules[m.id];
  const slide = m.slides[idx];
  const questions = QUIZZES[m.id] ?? [];
  const last = idx === m.slides.length - 1;

  // التعلم التكيفي: مفاهيم هذه الوحدة التي تعثّر فيها المتعلم
  const weakConcepts = useMemo(() => {
    const cs = new Set<string>();
    questions.forEach((q) => cs.add(q.concept));
    m.slides.forEach((s) => s.blocks.forEach((b) => { if (b.k === 'check' && b.concept) cs.add(b.concept); }));
    return [...cs].filter((c) => (state.progress.conceptErrors[c] ?? 0) >= 2 && (state.progress.conceptErrors[c] ?? 0) > (state.progress.conceptMastery[c] ?? 0));
  }, [state.progress, m]);

  const nextModule = MODULES[MODULES.findIndex((x) => x.id === m.id) + 1];

  if (showQuiz) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <Button size="sm" icon="chevronD" onClick={() => setShowQuiz(false)}>رجوع للدرس</Button>
          <div className="flex-1" />
          <span className="text-[12.5px] text-ink-mute">الوحدة {m.n} — اختبار</span>
        </div>
        <h2 className="text-[19px] font-bold">اختبار: {m.title}</h2>
        <Quiz questions={questions} title={m.title} onDone={(r) => {
          dispatch({ type: 'quizDone', moduleId: m.id, result: { ...r, at: Date.now(), attempts: 0, best: r.score }, badge: m.badge });
          if (r.score >= 70) {
            dispatch({ type: 'moduleComplete', moduleId: m.id });
            toast(`اجتزتِ اختبار الوحدة ${m.n} بنسبة ${r.score}%`);
            if (m.badge && !state.progress.badges.includes(m.badge)) toast(`حصلتِ على شارة «${BADGE_MAP[m.badge].name}»`, 'warn');
          }
        }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* رأس الوحدة */}
      <div className="flex items-start gap-3">
        <button onClick={() => go('#/learn')} className="p-2 rounded-lg hover:bg-stone-100 text-ink-mute shrink-0 no-print" aria-label="رجوع">
          <Icon name="chevron" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11.5px] text-ink-mute bg-stone-100 rounded px-2 py-0.5">الوحدة {m.n}</span>
            <span className="text-[11.5px] text-ink-mute bg-stone-100 rounded px-2 py-0.5">{m.chapter}</span>
            {prog?.completed && <Tag tone="green" icon="check">مكتملة</Tag>}
          </div>
          <h1 className="text-[20px] sm:text-[23px] font-bold leading-tight">{m.title}</h1>
          <p className="text-[13.5px] text-ink-mute mt-1">{m.subtitle}</p>
        </div>
      </div>

      {/* أهداف الفصل */}
      {idx === 0 && (
        <Card className="bg-forest-50/50 border-forest-200">
          <div className="flex items-center gap-2 mb-2.5">
            <Icon name="target" className="w-4 h-4 text-forest-700" />
            <span className="text-[12.5px] font-bold text-forest-800">أهداف هذا الفصل — بنهايته ستكونين قادرة على:</span>
          </div>
          <ul className="space-y-1.5">
            {m.goals.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px] leading-relaxed">
                <Icon name="check" className="w-4 h-4 text-forest-600 shrink-0 mt-1" />{g}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* التعلم التكيفي */}
      {weakConcepts.length > 0 && idx === 0 && (
        <Card className="border-warn-300 bg-warn-50">
          <div className="flex items-start gap-3">
            <Icon name="refresh" className="w-5 h-5 text-warn-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[13.5px]">راجعي هذا الجزء</div>
              <p className="text-[12.5px] text-ink-soft mt-1 leading-relaxed">
                تعثّرتِ أكثر من مرة في مفاهيم هذه الوحدة. اقرئي الشرائح بتأنٍ وركّزي على كتل «الفكرة الأساسية» و«لماذا هذا مهم؟»
                قبل الانتقال إلى الاختبار.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* التنقل بين الشرائح */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-print pb-1">
        {m.slides.map((s, i) => (
          <button key={s.id} onClick={() => setIdx(i)}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition
              ${i === idx ? 'bg-forest-700 text-white' : prog?.seen.includes(s.id) ? 'bg-forest-50 text-forest-700' : 'bg-stone-100 text-ink-mute'}`}>
            {i + 1}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[12px] text-ink-mute shrink-0">{idx + 1} / {m.slides.length}</span>
      </div>

      {/* الشريحة */}
      <div key={slide.id} className="space-y-4 anim-in">
        <h2 className="text-[17px] sm:text-[19px] font-bold">{slide.title}</h2>
        {slide.blocks.map((b, i) => <BlockView key={i} b={b} />)}
      </div>

      {/* التنقل السفلي */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200 no-print">
        <Button icon="chevronD" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>السابقة</Button>
        {!last ? (
          <Button variant="primary" icon="chevron" onClick={() => setIdx(idx + 1)}>الشريحة التالية</Button>
        ) : questions.length ? (
          <Button variant="gold" icon="award" onClick={() => setShowQuiz(true)}>ابدأ اختبار الوحدة ({questions.length} سؤال)</Button>
        ) : (
          <Button variant="primary" icon="check" onClick={() => {
            dispatch({ type: 'moduleComplete', moduleId: m.id });
            toast('أُكملت الوحدة');
            if (nextModule) go(`#/learn/${nextModule.id}`); else go('#/learn');
          }}>إنهاء الوحدة</Button>
        )}
        <div className="flex-1" />
        {prog?.quiz && <Tag tone={prog.quiz.best >= 70 ? 'green' : 'gold'}>أفضل نتيجة {prog.quiz.best}%</Tag>}
        {last && nextModule && <Button icon="chevron" onClick={() => go(`#/learn/${nextModule.id}`)}>الوحدة التالية</Button>}
      </div>
    </div>
  );
}
