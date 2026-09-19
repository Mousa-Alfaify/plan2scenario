import React, { useState } from 'react';
import { useStore, emptyProject } from '../../store/store';
import { Button, Card, Progress, SectionTitle, Tag, toast } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { FINAL_KNOWLEDGE } from '../../data/quizzes';
import { Quiz } from '../learn/Quiz';
import { STAGES } from '../../data/categories';
import { auditProject, autoStages, coverageGaps, isPriorityItem, readiness, targetedItems, uid, nItems } from '../../lib/compute';
import { MODULES } from '../../data/content';
import type { Project } from '../../store/types';

/* خطة طوارئ افتراضية مختصرة للمشروع العملي */
const CASE_PLAN = [
  { code: '2.1.1', desc: 'إعلان حالة الطوارئ عند تأكد بلاغين مستقلين خلال 5 دقائق', owner: 'مدير المناوبة', cat: 'التفعيل والإعلان' },
  { code: '2.3.4', desc: 'تفعيل غرفة العمليات خلال 20 دقيقة من الإعلان بحضور ممثلي 4 أقسام', owner: 'رئيس فريق الطوارئ', cat: 'القيادة والتنظيم' },
  { code: '2.3.7', desc: 'تفعيل تسلسل التفويض البديل عند غياب رئيس الفريق ونائبه', owner: 'مدير المنشأة', cat: 'القيادة والتنظيم' },
  { code: '3.1.2', desc: 'إبلاغ جميع الأقسام عبر النداء الآلي خلال 10 دقائق، والقناة البديلة عند تعطله', owner: 'مشغّل غرفة التحكم', cat: 'الاتصال الداخلي' },
  { code: '3.4.1', desc: 'إبلاغ الدفاع المدني خلال 15 دقيقة من التصنيف بالقالب الرسمي', owner: 'منسق الاتصال الخارجي', cat: 'الاتصال الخارجي' },
  { code: '3.4.5', desc: 'عدم إصدار أي تصريح إعلامي قبل استكمال تسلسل الإبلاغ الرسمي', owner: 'المتحدث الرسمي', cat: 'الاتصال الخارجي' },
  { code: '4.2.3', desc: 'طلب إمدادات طارئة من المستودع المركزي عند نفاد 70% من المخزون', owner: 'مدير المستودعات', cat: 'إدارة الموارد' },
  { code: '4.5.1', desc: 'طلب المساعدة المتبادلة من منشأة مجاورة عند تجاوز الطاقة 85%', owner: 'مدير العمليات', cat: 'إدارة الموارد' },
  { code: '5.1.1', desc: 'تنفيذ الإخلاء الجزئي للطابق المتأثر خلال 30 دقيقة', owner: 'مسؤول السلامة', cat: 'الإجراءات التشغيلية' },
  { code: '5.3.2', desc: 'تشغيل بروتوكول الفرز الطبي عند استقبال أكثر من 10 إصابات', owner: 'رئيس الطوارئ الطبية', cat: 'الإجراءات التشغيلية' },
  { code: '6.1.1', desc: 'تفعيل خطة استمرارية الأعمال لقسم المختبر خلال 45 دقيقة من انقطاع الخدمة', owner: 'مدير المختبر', cat: 'الاستمرارية والتعافي' },
  { code: '6.2.4', desc: 'التحول للنظام الورقي البديل عند انقطاع النظام الإلكتروني أكثر من ساعة', owner: 'مسؤول تقنية المعلومات', cat: 'الاستمرارية والتعافي' },
];

const CASE_NOTE = [
  'سجل التمارين: اختُبر الإخلاء الجزئي والفرز الطبي في 2024 و2025 (مرتان لكل منهما).',
  'لم يُختبر: التفويض البديل، المساعدة المتبادلة، استمرارية المختبر، النظام الورقي البديل.',
  'مخاطر الـ HVA المرشحة: حريق في جناح، تفشٍّ وبائي، انقطاع كهرباء ممتد، هجوم سيبراني.',
];

export function Final() {
  const { state, dispatch, go } = useStore();
  const [tab, setTab] = useState<'k' | 'p'>('k');
  const f = state.progress.final;
  const proj = state.projects.find((p) => p.id === f.projectId);

  const grade = (p: Project) => {
    const parts: { key: string; label: string; score: number; max: number; notes: string[] }[] = [];
    const targeted = targetedItems(p);
    const push = (key: string, label: string, score: number, max: number, notes: string[]) => parts.push({ key, label, score, max, notes });

    // 1 التفكيك
    {
      const n = p.items.length, notes: string[] = [];
      let s = n >= 12 ? 10 : n >= 8 ? 7 : n >= 4 ? 4 : n > 0 ? 2 : 0;
      if (n < 12) notes.push(`أدخلتِ ${nItems(n)} من أصل 12 في الخطة المعطاة.`);
      const uncat = p.items.filter((i) => !i.category).length;
      if (uncat) { s = Math.max(0, s - 2); notes.push(`${nItems(uncat)} بلا فئة — التصنيف ضمن الفئات السبع شرط (3.2).`); }
      push('decompose', 'تفكيك الخطة وتصنيف البنود', s, 10, notes);
    }
    // 2 الأولويات
    {
      const vh = p.items.filter((i) => !i.testedBefore).length;
      const notes: string[] = [];
      const s = vh >= 3 ? 10 : vh > 0 ? 6 : 0;
      if (!vh) notes.push('لم تُعلَّم أي بنود بأنها غير مختبرة — راجعي سجل التمارين في نص الحالة (6.2).');
      push('priority', 'تحديد الأولويات من سجل التغطية', s, 10, notes);
    }
    // 3 المصفوفة
    {
      const notes: string[] = [];
      let s = 0;
      if (p.hazards.length >= 3) s += 7; else if (p.hazards.length) { s += 3; notes.push('الدليل يقارن عدة مخاطر مرشحة من الـ HVA (4.2).'); }
      else notes.push('لم تُضف مخاطر مرشحة.');
      if (p.selectedHazardId) s += 8; else notes.push('لم يُختر الخطر بناءً على المصفوفة (13.1).');
      push('matrix', 'مصفوفة التغطية واختيار الخطر', s, 15, notes);
    }
    // 4 المحفزات
    {
      const notes: string[] = [];
      const withInj = targeted.filter((i) => p.injects.some((j) => j.targetItemId === i.id)).length;
      let s = targeted.length ? Math.round((withInj / targeted.length) * 15) : 0;
      const bypass = p.injects.filter((j) => j.bypassable === 'yes').length;
      if (bypass) { s = Math.max(0, s - bypass * 2); notes.push(`${bypass} محفزًا يمكن تجاوزه دون تنفيذ البند — يحتاج إعادة تصميم (5.1).`); }
      const noText = p.injects.filter((j) => j.text.trim().length < 40).length;
      if (noText) notes.push(`${noText} محفزًا بلا نص جاهز كافٍ (5.3 و5.4).`);
      if (targeted.length && withInj < targeted.length) notes.push(`${nItems(targeted.length - withInj)} ضمن البنود المستهدفة بلا محفز.`);
      push('injects', 'تصميم المحفزات', s, 15, notes);
    }
    // 5 MSEL
    {
      const notes: string[] = [];
      const timed = p.injects.filter((j) => j.time).length;
      let s = p.injects.length ? Math.round((timed / p.injects.length) * 10) : 0;
      const orphan = p.injects.filter((j) => !j.targetItemId).length;
      if (orphan) { s = Math.max(0, s - 3); notes.push(`${orphan} محفزًا بلا بند مستهدف — العمود الذي يميّز MSEL لاختبار الخطة (ملحق ج).`); }
      if (!p.injects.length) notes.push('لم تُبنَ قائمة MSEL.');
      push('msel', 'قائمة MSEL وتسلسلها الزمني', s, 10, notes);
    }
    // 6 التصعيد
    {
      const notes: string[] = [];
      const need = coverageGaps(p).length > 0 || p.strategy === 'escalation';
      let s = 0;
      if (!need) { s = 10; notes.push('الخطر المختار يغطي البنود ذات الأولوية — التصعيد غير مطلوب.'); }
      else if (p.escalation.enabled) {
        s = 4;
        if (p.escalation.targetItemIds.length) s += 3; else notes.push('تصعيد بلا بند مستهدف — الخطأ السادس في الفصل 12.');
        if (Object.values(p.escalation.checks).every(Boolean)) s += 3; else notes.push('لم تُستوفَ معايير التصعيد السليم الأربعة (8.2).');
      } else notes.push('توجد بنود أولوية غير مغطاة ولا نقطة تصعيد (4.3 + 8.1).');
      push('escalation', 'نقطة التصعيد', s, 10, notes);
    }
    // 7 المعايير
    {
      const notes: string[] = [];
      const withC = targeted.filter((i) => p.criteria.some((c) => c.itemId === i.id && c.text.trim())).length;
      const s = targeted.length ? Math.round((withC / targeted.length) * 15) : 0;
      if (targeted.length && withC < targeted.length) notes.push(`${nItems(targeted.length - withC)} ضمن البنود المستهدفة بلا معيار نجاح بالقالب الموحد (7.2).`);
      push('criteria', 'معايير النجاح', s, 15, notes);
    }
    // 8 المراقبة
    {
      const notes: string[] = [];
      const g = p.observations.filter((o) => o.grade).length;
      const s = targeted.length ? Math.min(10, Math.round((g / targeted.length) * 10)) : 0;
      if (!g) notes.push('لم تُسجَّل نتائج مراقبة (7.3).');
      push('observe', 'تقييم النتائج بنموذج المراقبة', s, 10, notes);
    }
    // 9 الاستخلاص
    {
      const notes: string[] = [];
      let s = 0;
      const linked = p.aar.filter((a) => a.itemId).length;
      const typed = p.aar.filter((a) => a.recType).length;
      const owned = p.aar.filter((a) => ['no-action', 'strength'].includes(a.recType) || (a.owner.trim() && a.due.trim())).length;
      if (p.aar.length) {
        s = Math.round((linked / p.aar.length) * 5 + (typed / p.aar.length) * 5 + (owned / p.aar.length) * 5);
        if (linked < p.aar.length) notes.push('توجد توصيات غير مرتبطة ببند محدد (9.2 + الفصل 12).');
        if (typed < p.aar.length) notes.push('توجد توصيات بلا تصنيف نوع — المخرج الأهم لجهة الاعتماد (9.2).');
        if (owned < p.aar.length) notes.push('توجد توصيات بلا مالك أو مهلة (9.3).');
      } else notes.push('لم يُعد تقرير استخلاص.');
      push('aar', 'الاستخلاص وخطة التحسين', s, 15, notes);
    }

    const total = Math.round((parts.reduce((a, b) => a + b.score, 0) / parts.reduce((a, b) => a + b.max, 0)) * 100);
    return { total, sections: parts, at: Date.now() };
  };

  const startProject = () => {
    const p = emptyProject('المشروع العملي — الاختبار النهائي', 'منشأة صحية افتراضية', 'خطة الطوارئ المعطاة في الاختبار');
    dispatch({ type: 'addProject', project: p });
    dispatch({ type: 'mode', mode: 'build' });
    toast('أُنشئ مشروع الاختبار — ابدئي بتفكيك الخطة');
    go('#/build/decompose');
  };

  const submit = () => {
    const p = state.projects.find((x) => x.id === state.activeProjectId);
    if (!p) { toast('لا يوجد مشروع نشط', 'err'); return; }
    if (p.isDemo) { toast('لا يمكن تسليم المشروع التجريبي — أنشئي مشروعك', 'err'); return; }
    const report = grade(p);
    dispatch({ type: 'finalProject', report, projectId: p.id });
    toast(`سُلِّم المشروع — النتيجة ${report.total}%`);
  };

  const allModulesDone = MODULES.filter((m) => state.progress.modules[m.id]?.completed).length;
  const k = f.knowledge?.score ?? 0;
  const pScore = f.report?.total ?? 0;
  const passed = k >= 70 && pScore >= 70;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] sm:text-[25px] font-bold">الاختبار النهائي</h1>
        <p className="text-[13.5px] text-ink-mute mt-1.5 max-w-2xl leading-relaxed">
          جزآن: اختبار معرفي يغطي فصول الدليل، ومشروع عملي تبنين فيه سيناريو اختبار خطة كاملاً لخطة طوارئ افتراضية.
          يُشترط 70% في كل جزء للحصول على شارة «خبير اختبار خطط الطوارئ».
        </p>
      </div>

      {allModulesDone < MODULES.length && (
        <Card className="border-warn-300 bg-warn-50">
          <div className="flex items-start gap-3">
            <Icon name="info" className="w-5 h-5 text-warn-500 shrink-0 mt-0.5" />
            <p className="text-[13px] leading-relaxed">
              أكملتِ {allModulesDone} من {MODULES.length} وحدة. يمكنك خوض الاختبار الآن، لكن يُنصح بإكمال الوحدات أولاً.
            </p>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { id: 'k' as const, t: 'الجزء الأول — اختبار معرفي', s: `${FINAL_KNOWLEDGE.length} سؤالاً`, v: f.knowledge ? `${k}%` : '—', i: 'book' },
          { id: 'p' as const, t: 'الجزء الثاني — مشروع عملي', s: '11 خطوة تطبيقية', v: f.report ? `${pScore}%` : '—', i: 'tools' },
        ].map((x) => (
          <button key={x.id} onClick={() => setTab(x.id)}
            className={`card card-pad text-right transition ${tab === x.id ? 'border-forest-400 ring-1 ring-forest-200' : 'hover:border-forest-300'}`}>
            <div className="flex items-start gap-3">
              <span className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${tab === x.id ? 'bg-forest-700 text-white' : 'bg-forest-50 text-forest-700'}`}><Icon name={x.i} /></span>
              <div className="flex-1">
                <div className="font-bold text-[14.5px]">{x.t}</div>
                <div className="text-[12px] text-ink-mute mt-0.5">{x.s}</div>
              </div>
              <div className="text-[20px] font-bold" style={{ color: x.v === '—' ? '#A8A8A0' : parseInt(x.v) >= 70 ? '#2F7D55' : '#B4903F' }}>{x.v}</div>
            </div>
          </button>
        ))}
      </div>

      {passed && (
        <Card className="border-gold-300 bg-gold-300/10">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-gold-500 text-white grid place-items-center shrink-0"><Icon name="award" className="w-7 h-7" /></span>
            <div>
              <div className="font-bold text-[16px]">خبير اختبار خطط الطوارئ</div>
              <p className="text-[13px] text-ink-soft mt-1">اجتزتِ الجزأين — الاختبار المعرفي {k}% والمشروع العملي {pScore}%.</p>
            </div>
          </div>
        </Card>
      )}

      {tab === 'k' ? (
        <Card>
          <SectionTitle title="الجزء الأول — اختبار معرفي" icon="book" sub={`${FINAL_KNOWLEDGE.length} سؤالاً من كل فصول الدليل`} />
          <Quiz questions={FINAL_KNOWLEDGE} title="الاختبار النهائي" passMark={70}
            onDone={(r) => {
              dispatch({ type: 'finalKnowledge', result: { ...r, at: Date.now(), attempts: 1, best: r.score } });
              toast(`الاختبار المعرفي: ${r.score}%`);
            }} />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <SectionTitle title="الحالة: خطة طوارئ افتراضية مختصرة" icon="file"
              sub="اقرئي الخطة والمعطيات، ثم نفّذي الخطوات الإحدى عشرة في أدوات وضع التطبيق." />
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full min-w-[620px] border-collapse">
                <thead><tr><th className="th">رقم البند</th><th className="th">نص البند</th><th className="th">المسؤول</th><th className="th">الفئة المتوقعة</th></tr></thead>
                <tbody>
                  {CASE_PLAN.map((c) => (
                    <tr key={c.code} className="hover:bg-stone-50">
                      <td className="td font-semibold whitespace-nowrap">{c.code}</td>
                      <td className="td">{c.desc}</td>
                      <td className="td text-[12.5px] whitespace-nowrap">{c.owner}</td>
                      <td className="td text-[12.5px] whitespace-nowrap text-ink-mute">{c.cat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-lg bg-stone-50 p-3.5">
              <div className="text-[12.5px] font-bold mb-1.5">معطيات إضافية</div>
              <ul className="space-y-1">{CASE_NOTE.map((n, i) => <li key={i} className="text-[12.5px] text-ink-soft">• {n}</li>)}</ul>
            </div>
          </Card>

          <Card>
            <SectionTitle title="المطلوب" icon="list" />
            <ol className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {['تفكيك الخطة إلى بنود', 'تصنيف البنود ضمن الفئات السبع', 'تحديد البنود ذات الأولوية', 'اختيار الخطر بمصفوفة التغطية',
                'إنشاء Coverage Matrix كاملة', 'تصميم Injects لكل بند مستهدف', 'بناء MSEL مرتبة زمنيًا', 'تصميم Escalation عند الحاجة',
                'وضع Success Criteria بالقالب الموحد', 'تقييم النتائج بنموذج المراقبة', 'إعداد After Action Review وخطة تحسين'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px]">
                  <span className="w-5 h-5 rounded-md bg-forest-50 text-forest-700 grid place-items-center text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</span>{t}
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2 mt-5">
              <Button variant="primary" icon="plus" onClick={startProject}>إنشاء مشروع الاختبار</Button>
              <Button icon="tools" onClick={() => { dispatch({ type: 'mode', mode: 'build' }); go('#/build'); }}>فتح وضع التطبيق</Button>
              <Button variant="gold" icon="check" onClick={submit}>تسليم المشروع الحالي للتقييم</Button>
            </div>
            <p className="text-[12px] text-ink-mute mt-3">يُقيَّم المشروع النشط حاليًا: «{state.projects.find((p) => p.id === state.activeProjectId)?.name ?? '—'}»</p>
          </Card>

          {f.report && (
            <Card>
              <SectionTitle title="تقرير التقييم التفصيلي" icon="chart"
                sub={`المشروع المُقيَّم: ${proj?.name ?? '—'} · ${new Date(f.report.at).toLocaleDateString('ar')}`} />
              <div className="flex items-center gap-4 mb-5">
                <div className="text-[40px] font-bold leading-none" style={{ color: pScore >= 70 ? '#2F7D55' : '#B4903F' }}>{pScore}%</div>
                <div className="flex-1"><Progress value={pScore} height={10} tone={pScore >= 70 ? 'forest' : 'gold'} /></div>
                <Tag tone={pScore >= 70 ? 'green' : 'gold'}>{pScore >= 70 ? 'ناجح' : 'يحتاج تحسين'}</Tag>
              </div>
              <div className="space-y-2.5">
                {f.report.sections.map((s) => (
                  <div key={s.key} className="rounded-xl border border-stone-200 p-3.5">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`w-7 h-7 rounded-md grid place-items-center text-[11.5px] font-bold text-white
                        ${s.score === s.max ? 'bg-ok-500' : s.score === 0 ? 'bg-danger-500' : 'bg-gold-500'}`}>{s.score}</span>
                      <span className="font-semibold text-[13.5px] flex-1">{s.label}</span>
                      <span className="text-[12px] text-ink-mute">{s.score} / {s.max}</span>
                    </div>
                    {s.notes.length > 0 && (
                      <ul className="space-y-1 pr-9">
                        {s.notes.map((n, i) => <li key={i} className="text-[12.5px] text-ink-soft leading-relaxed">• {n}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
