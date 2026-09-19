import React from 'react';
import { useStore } from '../../store/store';
import { Button, Card, SectionTitle, Tag, Progress } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { STAGES } from '../../data/categories';
import { autoStages, projectProgress, readiness, readyToRun } from '../../lib/compute';
import { DemoBanner, NoProject, ToolHeader } from './shared';

const MARK = { done: { i: '✔', c: 'bg-ok-500 text-white', l: 'مكتمل' }, doing: { i: '◐', c: 'bg-gold-500 text-white', l: 'قيد العمل' }, todo: { i: '○', c: 'bg-stone-200 text-stone-500', l: 'لم يبدأ' } };

export function Pipeline({ embedded }: { embedded?: boolean }) {
  const { project, go } = useStore();
  if (!project) return <NoProject />;

  const st = autoStages(project);
  const pp = projectProgress(project);
  const rd = readiness(project);
  const chk = readyToRun(project);

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 10" title="من الخطة إلى السيناريو"
          sub="النموذج الموحّد الذي يجمع خلاصة الفصول 3 إلى 9 في أداة عمل واحدة — سبع مراحل لكل منها مخرج محدد." />
      )}
      <DemoBanner />

      <div className="grid sm:grid-cols-3 gap-3">
        <Card><div className="text-[12.5px] text-ink-mute">المراحل المكتملة</div>
          <div className="text-[28px] font-bold leading-none mt-1">{pp.done}<span className="text-[15px] text-ink-mute"> / {pp.total}</span></div>
          <div className="mt-2.5"><Progress value={pp.pct} height={6} /></div></Card>
        <Card><div className="text-[12.5px] text-ink-mute">جاهزية السيناريو</div>
          <div className="text-[28px] font-bold leading-none mt-1" style={{ color: rd.pct >= 75 ? '#2F7D55' : rd.pct >= 45 ? '#B4903F' : '#B4472F' }}>{rd.pct}%</div>
          <div className="text-[12px] text-ink-mute mt-1.5">{rd.score} من {rd.max} نقطة</div></Card>
        <Card><div className="text-[12.5px] text-ink-mute">قائمة التحقق النهائية</div>
          <div className="text-[28px] font-bold leading-none mt-1">{chk.done}<span className="text-[15px] text-ink-mute"> / {chk.total}</span></div>
          <div className="mt-2">{chk.essentialsDone ? <Tag tone="green" icon="check">العناصر الأساسية مكتملة</Tag> : <Tag tone="gold">عناصر أساسية ناقصة</Tag>}</div></Card>
      </div>

      <Card>
        <SectionTitle title="المراحل السبع" icon="route" sub="اضغطي على أي مرحلة للانتقال إلى أداتها" />
        <div className="space-y-2.5">
          {STAGES.map((s, idx) => {
            const state = st[s.id] ?? 'todo';
            const m = MARK[state];
            return (
              <button key={s.id} onClick={() => go(s.route)}
                className="w-full text-right rounded-xl border border-stone-200 p-3.5 hover:border-forest-300 hover:bg-forest-50/30 transition">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className={`w-8 h-8 rounded-lg grid place-items-center font-bold text-[14px] ${m.c}`}>{m.i}</span>
                    {idx < STAGES.length - 1 && <span className="w-px h-6 bg-stone-200 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11.5px] text-ink-mute">{s.n}</span>
                      <span className="font-bold text-[14.5px]">{s.name}</span>
                      <Tag tone={state === 'done' ? 'green' : state === 'doing' ? 'gold' : 'neutral'}>{m.l}</Tag>
                      <span className="text-[11px] text-ink-mute bg-stone-100 rounded px-1.5 py-0.5">{s.ref}</span>
                    </div>
                    <p className="text-[13px] text-ink-soft mt-1.5 leading-relaxed">{s.doing}</p>
                    <p className="text-[12px] text-ink-mute mt-1"><strong>المخرج:</strong> {s.out}</p>
                  </div>
                  <Icon name="chevron" className="w-5 h-5 text-ink-mute shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
        {!chk.essentialsDone && (
          <div className="mt-4 rounded-lg bg-warn-50 border border-warn-300/60 p-3 text-[13px] leading-relaxed">
            <strong>المشروع غير جاهز للتنفيذ بعد.</strong> لا يُعتبر المشروع مكتملاً حتى تنتهي المراحل المطلوبة وتُستوفى
            العناصر الأساسية في قائمة التحقق النهائية (13.1).
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="أسباب نقص الجاهزية" icon="info" sub="Scenario Readiness Score محسوب من معايير واضحة لا رقم عشوائي" />
        {rd.gaps.length === 0 ? (
          <div className="rounded-lg bg-ok-50 p-3.5 text-[13.5px] text-ok-500"><strong>الجاهزية مكتملة.</strong> كل معايير الجاهزية مستوفاة.</div>
        ) : (
          <div className="space-y-2">
            {rd.parts.map((p) => (
              <div key={p.key} className="flex items-start gap-3 rounded-lg border border-stone-200 p-3">
                <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold
                  ${p.score === p.max ? 'bg-ok-500 text-white' : p.score === 0 ? 'bg-danger-500 text-white' : 'bg-gold-500 text-white'}`}>
                  {p.score === p.max ? '✔' : p.score === 0 ? '✕' : '◐'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[13.5px]">{p.label}</span>
                    <span className="text-[12px] text-ink-mute">{p.score} / {p.max}</span>
                  </div>
                  <p className="text-[12.5px] text-ink-soft mt-1 leading-relaxed">{p.why}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
