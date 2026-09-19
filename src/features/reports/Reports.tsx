import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Button, Card, SectionTitle, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CATEGORIES, GAP_CAUSES, REC_TYPES, STAGES, catName } from '../../data/categories';
import { autoStages, coverageGaps, priorityOf, rankHazards, readiness, readyToRun, targetedItems, auditProject, nItems, nHazards } from '../../lib/compute';
import { NoProject, exportCSV } from '../build/shared';
import type { Project } from '../../store/types';

const PRIO: any = { 'very-high': 'عالية جدًا', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
const GRADE: any = { full: 'كامل', partial: 'جزئي', none: 'لم يحدث' };

const REPORTS = [
  { id: 'decompose', label: 'تقرير تفكيك الخطة', icon: 'grid', ref: 'الفصل 3 + ملحق أ' },
  { id: 'matrix', label: 'تقرير مصفوفة التغطية', icon: 'matrix', ref: 'الفصل 4 + ملحق ب' },
  { id: 'msel', label: 'تقرير MSEL', icon: 'list', ref: 'الفصل 5 + ملحق ج' },
  { id: 'observe', label: 'تقرير المراقبة', icon: 'eye', ref: 'الفصل 7.3 + ملحق د' },
  { id: 'aar', label: 'تقرير الاستخلاص', icon: 'clipboard', ref: 'الفصل 9' },
  { id: 'improve', label: 'خطة التحسين', icon: 'route', ref: 'الفصل 9.3' },
  { id: 'history', label: 'تقرير التغطية التراكمية', icon: 'history', ref: 'الفصل 6 + ملحق هـ' },
  { id: 'full', label: 'تقرير المشروع الكامل', icon: 'file', ref: 'الدليل كاملاً' },
];

function Head({ p, title, ref_ }: { p: Project; title: string; ref_: string }) {
  return (
    <div className="border-b-2 border-forest-700 pb-4 mb-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11.5px] text-ink-mute">{p.org || 'منشأة'} · {p.planName || 'خطة الطوارئ المعتمدة'}</div>
          <h2 className="text-[20px] font-bold mt-1">{title}</h2>
          <div className="text-[12.5px] text-ink-mute mt-1">{p.name}</div>
        </div>
        <div className="text-left text-[11.5px] text-ink-mute shrink-0">
          <div>{new Date().toLocaleDateString('ar-SA')}</div>
          <div className="mt-0.5">المرجع: {ref_}</div>
          {p.isDemo && <div className="mt-1"><Tag tone="gold">مثال تدريبي</Tag></div>}
        </div>
      </div>
    </div>
  );
}

function T({ cols, rows }: { cols: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200">
      <table className="w-full border-collapse" style={{ minWidth: cols.length * 110 }}>
        <thead><tr>{cols.map((c) => <th key={c} className="th">{c}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map((r, i) => (
          <tr key={i} className="hover:bg-stone-50">{r.map((c, j) => <td key={j} className="td">{c}</td>)}</tr>
        )) : <tr><td className="td text-ink-mute text-center" colSpan={cols.length}>لا بيانات</td></tr>}</tbody>
      </table>
    </div>
  );
}

function Body({ id, p }: { id: string; p: Project }) {
  const ranked = rankHazards(p);
  const targeted = targetedItems(p);
  const rd = readiness(p);
  const chk = readyToRun(p);
  const st = autoStages(p);
  const il = (x: string) => { const it = p.items.find((i) => i.id === x); return it ? `${it.code} — ${it.desc}` : '—'; };

  const sections: Record<string, React.ReactNode> = {
    decompose: (
      <>
        <p className="text-[13px] text-ink-soft leading-[1.9] mb-4">
          فُككت الخطة إلى {nItems(p.items.length)} قابلة للاختبار وموزعة على الفئات السبع.
          البنود غير المختبرة سابقًا: {p.items.filter((i) => !i.testedBefore).length}.
          {p.items.length < 15 && ' ملاحظة: العدد أقل من 15 بندًا، والدليل (3.5) يتوقع 25–45 بندًا لخطة متوسطة.'}
        </p>
        <T cols={['رقم البند', 'الوصف المختصر للإجراء', 'الفئة', 'المسؤول حسب الخطة', 'هل اختُبر سابقًا؟', 'آخر اختبار', 'الأولوية']}
          rows={p.items.map((i) => [i.code, i.desc, catName(i.category), i.owner || '—', i.testedBefore ? 'نعم' : 'لا', i.lastTested || 'لم يُختبر', PRIO[priorityOf(i)]])} />
        <div className="mt-4">
          <div className="text-[13px] font-bold mb-2">التوزيع على الفئات السبع</div>
          <T cols={['الفئة', 'عدد البنود']} rows={CATEGORIES.map((c) => [c.name, String(p.items.filter((i) => i.category === c.id).length)])} />
        </div>
      </>
    ),
    matrix: (
      <>
        <p className="text-[13px] text-ink-soft leading-[1.9] mb-4">
          قُيّم {nHazards(p.hazards.length)} من المخاطر المرشحة مقابل {nItems(p.items.length)}. معيار الاختيار هو التغطية لا الإثارة (4.1).
          {p.selectedHazardId && ` الخطر المختار: ${p.hazards.find((h) => h.id === p.selectedHazardId)?.name}.`}
          {p.strategyNote && ` ${p.strategyNote}`}
        </p>
        <T cols={['بند الخطة المستهدف', ...p.hazards.map((h) => h.name)]}
          rows={[...p.items.map((i) => [`${i.code} — ${i.desc}`, ...p.hazards.map((h) => (p.coverage[h.id]?.[i.id] ? '✔' : '—'))]),
          ['مجموع البنود المُغطاة', ...p.hazards.map((h) => String(ranked.find((r) => r.hazard.id === h.id)?.total ?? 0))]]} />
        <div className="mt-4">
          <div className="text-[13px] font-bold mb-2">ترتيب المرشحين</div>
          <T cols={['الخطر', 'البنود المُغطاة', 'نسبة التغطية', 'بنود أولوية', 'بنود لم تُختبر']}
            rows={ranked.map((r) => [r.hazard.name, String(r.total), `${r.pct}%`, String(r.priorityCovered), String(r.untestedCovered)])} />
        </div>
        {coverageGaps(p).length > 0 && (
          <div className="mt-4 rounded-lg bg-danger-50 border border-danger-300/50 p-3.5">
            <div className="text-[13px] font-bold text-danger-600 mb-1.5">بنود أولوية خارج التغطية</div>
            <ul className="text-[12.5px] space-y-1">{coverageGaps(p).map((g) => <li key={g.id}>• {g.code} — {g.desc}</li>)}</ul>
          </div>
        )}
      </>
    ),
    msel: (
      <>
        <p className="text-[13px] text-ink-soft leading-[1.9] mb-4">
          {p.injects.length} محفزًا، منها {p.injects.filter((j) => j.isEscalation).length} محفز تصعيد.
          كل محفز مرتبط ببند الخطة المستهدف — وهو ما يميّز MSEL لاختبار الخطة عن MSEL العامة (ملحق ج).
        </p>
        <T cols={['#', 'الوقت', 'نص المحفز الكامل', 'المصدر', 'المستقبل', 'بند الخطة المستهدف', 'الفئة', 'الإجراء المتوقع', 'معيار القياس']}
          rows={[...p.injects].sort((a, b) => a.order - b.order).map((j, n) => {
            const it = p.items.find((x) => x.id === j.targetItemId);
            const c = p.criteria.find((x) => x.itemId === j.targetItemId);
            return [String(n + 1), j.time || '—', j.text || '—', j.source || '—', j.receiver || '—', it ? `${it.code} — ${it.desc}` : '—', it ? catName(it.category) : '—', j.expectedAction || '—', c?.text || '—'];
          })} />
        {p.escalation.enabled && (
          <div className="mt-4 rounded-lg bg-stone-50 p-3.5">
            <div className="text-[13px] font-bold mb-1.5">نقطة التصعيد ({p.escalation.time})</div>
            <p className="text-[13px] leading-[1.9]">{p.escalation.text}</p>
            {p.escalation.stopPoint && <p className="text-[12.5px] text-ink-mute mt-2"><strong>نقطة التوقف:</strong> {p.escalation.stopPoint}</p>}
          </div>
        )}
      </>
    ),
    observe: (
      <>
        <p className="text-[13px] text-ink-soft leading-[1.9] mb-4">
          نتائج مراقبة {nItems(p.observations.filter((o) => o.grade).length)}: كامل {p.observations.filter((o) => o.grade === 'full').length} ·
          جزئي {p.observations.filter((o) => o.grade === 'partial').length} · لم يحدث {p.observations.filter((o) => o.grade === 'none').length}.
        </p>
        <T cols={['بند الخطة', 'معيار النجاح', 'وقت المحفز', 'الوقت الفعلي', 'مطابق للمعيار؟', 'ملاحظات المراقب']}
          rows={p.observations.map((o) => [il(o.itemId), p.criteria.find((c) => c.itemId === o.itemId)?.text || '—', o.injectTime || '—', o.actualTime || '—', GRADE[o.grade] || '—', o.notes || '—'])} />
      </>
    ),
    aar: (
      <>
        <p className="text-[13px] text-ink-soft leading-[1.9] mb-4">
          كل ملاحظة مرتبطة ببند محدد في الخطة. عمود «نوع التوصية» هو المخرج الأهم لأي جهة اعتماد، إذ يثبت أن التمرين أداة تحسين فعلية للخطة (9.2).
        </p>
        <T cols={['بند الخطة', 'درجة التنفيذ', 'سبب الفجوة (إن وُجدت)', 'موضع المشكلة', 'نوع التوصية']}
          rows={p.aar.map((a) => [il(a.itemId), GRADE[a.grade] || '—', a.gapReason || '—', GAP_CAUSES.find((g) => g.id === a.gapCause)?.label || '—', REC_TYPES.find((r) => r.id === a.recType)?.label || '—'])} />
        <div className="mt-4 rounded-lg bg-stone-50 p-3.5">
          <div className="text-[13px] font-bold mb-1.5">نقاط القوة المحفوظة</div>
          {p.aar.filter((a) => a.recType === 'strength').length
            ? <ul className="text-[12.5px] space-y-1">{p.aar.filter((a) => a.recType === 'strength').map((a) => <li key={a.id}>• {a.recText || il(a.itemId)}</li>)}</ul>
            : <p className="text-[12.5px] text-ink-mute">لم تُسجَّل نقاط قوة.</p>}
        </div>
      </>
    ),
    improve: (
      <>
        <p className="text-[13px] text-ink-soft leading-[1.9] mb-4">
          لكل توصية مسؤول ومهلة زمنية وحالة تنفيذ — لا تُترك عامة بلا مالك (9.3).
          تُدرج حالة تنفيذ هذه التوصيات في افتتاحية تقرير التمرين القادم لإثبات الاستمرارية.
        </p>
        <T cols={['بند الخطة', 'نوع التوصية', 'نص التوصية', 'المسؤول', 'تاريخ الاستحقاق', 'الحالة', 'ملاحظات المتابعة']}
          rows={p.aar.filter((a) => a.recType && !['no-action'].includes(a.recType)).map((a) => [
            il(a.itemId), REC_TYPES.find((r) => r.id === a.recType)?.label || '—', a.recText || '—', a.owner || '—', a.due || '—',
            ({ open: 'مفتوحة', 'in-progress': 'قيد التنفيذ', done: 'منجزة', overdue: 'متأخرة' } as any)[a.status], a.followUp || '—'])} />
      </>
    ),
    history: (
      <>
        <p className="text-[13px] text-ink-soft leading-[1.9] mb-4">
          السجل التراكمي يُحدَّث بعد كل تمرين ويُرجع إليه عند اختيار بنود الاختبار القادمة، تجنبًا لتكرار البنود «السهلة» (6.1 و6.2).
        </p>
        <T cols={['بند الخطة', 'آخر مرة اختُبر', 'عدد مرات الاختبار (3 سنوات)', 'الحساسية', 'التعقيد', 'الأولوية القادمة']}
          rows={[...p.items].sort((a, b) => (PRIO[priorityOf(b)] > PRIO[priorityOf(a)] ? 1 : -1)).map((i) => [
            `${i.code} — ${i.desc}`, i.lastTested || 'لم يُختبر', String(i.testCount3y),
            ['', 'منخفضة', 'متوسطة', 'عالية'][i.sensitivity], ['', 'بسيط', 'متوسط', 'معقّد'][i.complexity], PRIO[priorityOf(i)]])} />
      </>
    ),
    full: (
      <div className="space-y-7">
        <section>
          <h3 className="text-[15px] font-bold mb-2 pb-1.5 border-b border-stone-200">1. ملخص تنفيذي</h3>
          <p className="text-[13px] text-ink-soft leading-[2]">
            يوثّق هذا التقرير مشروع اختبار خطة «{p.planName || 'الطوارئ المعتمدة'}» في {p.org || 'المنشأة'} وفق منهجية التصميم العكسي
            (Backward Design) الواردة في دليل «كيف نكتب سيناريو لاختبار خطط الكوارث».
            فُككت الخطة إلى {nItems(p.items.length)} قابلة للاختبار، منها {p.items.filter((i) => !i.testedBefore).length} لم تُختبر سابقًا.
            {p.selectedHazardId && ` اختير الخطر «${p.hazards.find((h) => h.id === p.selectedHazardId)?.name}» بناءً على مصفوفة تغطية فعلية لا بالحدس.`}
            صُمم {p.injects.length} محفزًا مرتبطًا ببنود محددة، و{p.criteria.filter((c) => c.text.trim()).length} معيار نجاح قابل للقياس.
            بلغت جاهزية السيناريو {rd.pct}%، واكتملت {STAGES.filter((s) => st[s.id] === 'done').length} من 7 مراحل،
            وقائمة التحقق النهائية {chk.done} من {chk.total}.
          </p>
        </section>
        {['decompose', 'history', 'matrix', 'msel', 'observe', 'aar', 'improve'].map((k, i) => (
          <section key={k}>
            <h3 className="text-[15px] font-bold mb-3 pb-1.5 border-b border-stone-200">
              {i + 2}. {REPORTS.find((r) => r.id === k)!.label}
            </h3>
            <Body id={k} p={p} />
          </section>
        ))}
        <section>
          <h3 className="text-[15px] font-bold mb-3 pb-1.5 border-b border-stone-200">9. جاهزية السيناريو وقائمة التحقق</h3>
          <T cols={['المعيار', 'النتيجة', 'الملاحظة']} rows={rd.parts.map((x) => [x.label, `${x.score} / ${x.max}`, x.why])} />
        </section>
      </div>
    ),
  };
  return <>{sections[id]}</>;
}

export function Reports() {
  const { project } = useStore();
  const [sel, setSel] = useState('');
  if (!project) return <NoProject />;

  const cur = REPORTS.find((r) => r.id === sel);

  if (cur) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 no-print">
          <Button size="sm" icon="chevron" onClick={() => setSel('')}>كل التقارير</Button>
          <div className="flex-1" />
          <Button size="sm" icon="print" onClick={() => window.print()}>طباعة / حفظ PDF</Button>
        </div>
        <Card>
          <Head p={project} title={cur.label} ref_={cur.ref} />
          <Body id={cur.id} p={project} />
          <div className="mt-8 pt-4 border-t border-stone-200 text-[11px] text-ink-mute space-y-1">
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-between">
              <span>المرجع المنهجي: «كيف نكتب سيناريو لاختبار خطط الكوارث» — د. روعة الفرج — إصدار 2026</span>
              <span>{cur.ref}</span>
            </div>
            <div>أُعد هذا التقرير عبر «أكاديمية سيناريو اختبار خطط الكوارث» — فكرة المشروع والموقع: أ. موسى الفيفي، هيئة الهلال الأحمر السعودي</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] sm:text-[25px] font-bold">مركز التقارير</h1>
        <p className="text-[13.5px] text-ink-mute mt-1.5 max-w-2xl leading-relaxed">
          تقارير رسمية جاهزة للطباعة أو الحفظ كـ PDF، مبنية من بيانات مشروعك «{project.name}».
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REPORTS.map((r) => (
          <button key={r.id} onClick={() => setSel(r.id)} className="card card-pad text-right hover:border-forest-300 hover:shadow-lift transition">
            <span className={`w-10 h-10 rounded-lg grid place-items-center mb-3 ${r.id === 'full' ? 'bg-forest-700 text-white' : 'bg-forest-50 text-forest-700'}`}><Icon name={r.icon} /></span>
            <div className="font-bold text-[13.5px] leading-snug">{r.label}</div>
            <div className="text-[11.5px] text-ink-mute mt-1">{r.ref}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
