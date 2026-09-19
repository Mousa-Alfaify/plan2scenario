import React from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Progress, Ring, SectionTitle, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { STAGES } from '../../data/categories';
import { auditProject, autoStages, coverageGaps, isPriorityItem, readiness, readyToRun, targetedItems } from '../../lib/compute';
import { DemoBanner, NoProject } from './shared';

export function BuildHome() {
  const { project, go } = useStore();
  if (!project) return <NoProject />;

  const rd = readiness(project);
  const st = autoStages(project);
  const chk = readyToRun(project);
  const issues = auditProject(project);
  const crit = issues.filter((i) => i.level === 'critical').length;
  const targeted = targetedItems(project);

  const tiles = [
    { l: 'بنود الخطة', v: project.items.length, r: '#/build/decompose', i: 'grid' },
    { l: 'بنود لم تُختبر', v: project.items.filter((i) => !i.testedBefore).length, r: '#/build/history', i: 'history' },
    { l: 'بنود مستهدفة', v: targeted.length, r: '#/build/matrix', i: 'matrix' },
    { l: 'المحفزات', v: project.injects.length, r: '#/build/msel', i: 'bolt' },
    { l: 'معايير النجاح', v: project.criteria.filter((c) => c.text.trim()).length, r: '#/build/criteria', i: 'ruler' },
    { l: 'ملاحظات مقيَّمة', v: project.observations.filter((o) => o.grade).length, r: '#/build/observe', i: 'eye' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-[21px] sm:text-[24px] font-bold leading-tight">{project.name}</h1>
            {project.isDemo && <Tag tone="gold" icon="info">مثال تدريبي</Tag>}
          </div>
          <p className="text-[13.5px] text-ink-mute">{project.org || 'بدون جهة محددة'}{project.planName ? ` · ${project.planName}` : ''}</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button icon="shield" onClick={() => go('#/build/audit')}>دقّق مشروعي</Button>
          <Button icon="print" onClick={() => go('#/reports')}>التقارير</Button>
          <Button variant="primary" icon="route" onClick={() => go('#/build/pipeline')}>المراحل السبع</Button>
        </div>
      </div>

      <DemoBanner />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionTitle title="جاهزية السيناريو" icon="chart"
            sub="Scenario Readiness Score — محسوب من معايير الدليل لا رقمًا عشوائيًا" />
          <div className="flex flex-wrap items-center gap-6">
            <Ring value={rd.pct} size={116} stroke={10} sub={`${rd.score}/${rd.max}`} />
            <div className="flex-1 min-w-[240px] space-y-2">
              {rd.parts.map((p) => (
                <div key={p.key} className="flex items-center gap-2.5">
                  <span className="text-[12px] text-ink-soft w-[160px] shrink-0 truncate">{p.label}</span>
                  <div className="flex-1"><Progress value={Math.round((p.score / p.max) * 100)} height={5}
                    tone={p.score === p.max ? 'forest' : p.score === 0 ? 'red' : 'gold'} /></div>
                  <span className="text-[11.5px] text-ink-mute w-10 text-left">{p.score}/{p.max}</span>
                </div>
              ))}
            </div>
          </div>
          {rd.gaps.length > 0 && (
            <div className="mt-4 rounded-lg bg-stone-50 p-3.5">
              <div className="text-[12.5px] font-bold mb-2">أسباب نقص الجاهزية</div>
              <ul className="space-y-1.5">
                {rd.gaps.slice(0, 4).map((g) => (
                  <li key={g.key} className="text-[12.5px] text-ink-soft flex items-start gap-2">
                    <Icon name="chevron" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-ink-mute" />{g.why}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className={crit ? 'border-danger-300' : 'border-ok-300'}>
            <SectionTitle title="حالة التدقيق" icon="shield" />
            <div className="flex items-center gap-3">
              <div className={`text-[32px] font-bold leading-none ${crit ? 'text-danger-600' : 'text-ok-500'}`}>{crit}</div>
              <div className="text-[13px] text-ink-soft">مشكلة حرجة<br /><span className="text-ink-mute text-[12px]">{issues.filter((i) => i.level === 'warning').length} تحذير · {issues.filter((i) => i.level === 'rec').length} توصية</span></div>
            </div>
            <Button size="sm" className="w-full mt-3" icon="shield" onClick={() => go('#/build/audit')}>فتح المدقق</Button>
          </Card>

          <Card>
            <SectionTitle title="قائمة التحقق" icon="check" />
            <Progress value={Math.round((chk.done / chk.total) * 100)} label={`${chk.done} / ${chk.total} جاهزة`} />
            <div className="mt-3">
              {chk.essentialsDone && chk.done === chk.total
                ? <Tag tone="green" icon="check">جاهز للتنفيذ</Tag>
                : <Tag tone={chk.essentialsDone ? 'gold' : 'red'}>{chk.essentialsDone ? 'العناصر الأساسية مكتملة' : 'غير جاهز للتنفيذ'}</Tag>}
            </div>
            <Button size="sm" className="w-full mt-3" onClick={() => go('#/build/checklist')}>مراجعة القائمة</Button>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <button key={t.l} onClick={() => go(t.r)} className="card card-pad text-right hover:border-forest-300 hover:shadow-lift transition">
            <div className="flex items-center justify-between mb-2">
              <Icon name={t.i} className="w-4 h-4 text-ink-mute" />
              <span className="text-[24px] font-bold leading-none">{t.v}</span>
            </div>
            <div className="text-[12px] text-ink-mute">{t.l}</div>
          </button>
        ))}
      </div>

      <Card>
        <SectionTitle title="المراحل السبع" icon="route" sub="الفصل 10 — من الخطة إلى السيناريو"
          action={<Button size="sm" onClick={() => go('#/build/pipeline')}>عرض التفاصيل</Button>} />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STAGES.map((s) => {
            const state = st[s.id] ?? 'todo';
            return (
              <button key={s.id} onClick={() => go(s.route)}
                className={`rounded-xl border p-3 text-right transition hover:shadow-card
                  ${state === 'done' ? 'border-ok-300 bg-ok-50' : state === 'doing' ? 'border-warn-300 bg-warn-50' : 'border-stone-200'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-ink-mute">{s.n}</span>
                  <span className={`text-[14px] font-bold ${state === 'done' ? 'text-ok-500' : state === 'doing' ? 'text-gold-600' : 'text-stone-300'}`}>
                    {state === 'done' ? '✔' : state === 'doing' ? '◐' : '○'}
                  </span>
                </div>
                <div className="text-[12px] font-semibold leading-snug">{s.name}</div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
