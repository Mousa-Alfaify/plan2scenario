import React, { useState } from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Empty, Field, Input, SectionTitle, Select, Tag, toast } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { GRADE_DEFS } from '../../data/categories';
import { targetedItems, uid } from '../../lib/compute';
import { DemoBanner, NeedItems, NoProject, ToolHeader, exportCSV } from './shared';

export function composeCriterion(c: { action: string; duration: string; startPoint: string; responsible: string; mandatorySteps: string }) {
  if (!c.action.trim()) return '';
  return `${c.action} يجب أن يتم خلال ${c.duration || '[المدة الزمنية]'} من ${c.startPoint || '[نقطة البداية]'}، بواسطة ${c.responsible || '[الجهة المسؤولة]'}، متضمنًا ${c.mandatorySteps || '[الخطوات الإلزامية]'}.`;
}

export function Criteria({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();
  const [open, setOpen] = useState<string>('');

  if (!project) return <NoProject />;
  if (!project.items.length) return <NeedItems what="معايير النجاح" />;

  const targeted = targetedItems(project);
  const list = targeted.length ? targeted : project.items;

  const getC = (itemId: string) => project.criteria.find((c) => c.itemId === itemId);
  const upd = (itemId: string, patch: any) => edit((p) => {
    let c = p.criteria.find((x) => x.itemId === itemId);
    if (!c) { c = { id: uid('c'), itemId, action: '', duration: '', startPoint: '', responsible: '', mandatorySteps: '', text: '' }; p.criteria.push(c); }
    Object.assign(c, patch);
    c.text = composeCriterion(c);
  });

  const done = list.filter((i) => getC(i.id)?.text.trim()).length;

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 7" title="معايير النجاح والفشل — Success Criteria Builder"
          sub="الحكم الثنائي (نجح/فشل) يفقد معلومات مهمة. لكل بند مستهدف معيار مكوَّن من: هل نُفِّذ الإجراء؟ وهل نُفِّذ ضمن المعيار الزمني/الإجرائي الذي تحدده الخطة نفسها؟"
          actions={<Button icon="download" onClick={() => exportCSV(`معايير-النجاح-${project.name}`, [
            ['بند الخطة', 'الإجراء', 'المدة الزمنية', 'نقطة البداية', 'الجهة المسؤولة', 'الخطوات الإلزامية', 'المعيار الكامل'],
            ...list.map((i) => { const c = getC(i.id); return [`${i.code} — ${i.desc}`, c?.action ?? '', c?.duration ?? '', c?.startPoint ?? '', c?.responsible ?? '', c?.mandatorySteps ?? '', c?.text ?? '']; }),
          ])}>تصدير CSV</Button>} />
      )}
      <DemoBanner />

      <Card className="bg-forest-50/50 border-forest-200">
        <div className="text-[12.5px] font-bold mb-2">القالب الموحد (7.2)</div>
        <p className="text-[14px] leading-[2]">
          <span className="bg-white rounded px-1.5 py-0.5 border border-stone-200">الإجراء</span> يجب أن يتم خلال
          <span className="bg-white rounded px-1.5 py-0.5 border border-stone-200 mx-1">المدة الزمنية المحددة بالخطة</span> من
          <span className="bg-white rounded px-1.5 py-0.5 border border-stone-200 mx-1">نقطة البداية</span>، بواسطة
          <span className="bg-white rounded px-1.5 py-0.5 border border-stone-200 mx-1">الجهة المسؤولة حسب الخطة</span>، متضمنًا
          <span className="bg-white rounded px-1.5 py-0.5 border border-stone-200 mr-1">الخطوات الإلزامية</span>.
        </p>
      </Card>

      <div className="flex items-center gap-3 text-[13px]">
        <span className="font-semibold">{done} من {list.length} بندًا له معيار</span>
        <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div className="h-full bg-forest-600" style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} />
        </div>
      </div>

      {list.length === 0 ? (
        <Card><Empty icon="ruler" title="لا بنود مستهدفة" body="اختاري الخطر في مصفوفة التغطية لتحديد البنود المستهدفة." /></Card>
      ) : (
        <div className="space-y-2.5">
          {list.map((i) => {
            const c = getC(i.id);
            const isOpen = open === i.id;
            return (
              <Card key={i.id} pad={false} className={c?.text.trim() ? '' : 'border-warn-300'}>
                <button onClick={() => setOpen(isOpen ? '' : i.id)} className="w-full text-right px-4 py-3.5 flex items-start gap-3 hover:bg-stone-50">
                  <Icon name="chevronD" className={`w-4 h-4 text-ink-mute mt-1 shrink-0 transition-transform ${isOpen ? '' : 'rotate-90'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><Tag tone="forest">{i.code}</Tag>{c?.text.trim() ? <Tag tone="green" icon="check">مكتمل</Tag> : <Tag tone="gold">بلا معيار</Tag>}</div>
                    <div className="text-[13.5px] font-medium">{i.desc}</div>
                    {c?.text.trim() && <p className="text-[12.5px] text-ink-soft mt-1.5 leading-relaxed">{c.text}</p>}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-stone-100 pt-4 anim-in">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="الإجراء" required hint="ما الفعل المطلوب — يُستمد من وصف البند">
                        <Input value={c?.action ?? ''} onChange={(e) => upd(i.id, { action: e.target.value })} placeholder={i.desc.split(' خلال')[0]} />
                      </Field>
                      <Field label="المدة الزمنية المحددة بالخطة" required hint="تُستمد من الخطة نفسها لا من اجتهاد المصمم">
                        <Input value={c?.duration ?? ''} onChange={(e) => upd(i.id, { duration: e.target.value })} placeholder="15 دقيقة" />
                      </Field>
                      <Field label="نقطة البداية" required hint="اللحظة التي تبدأ منها المدة">
                        <Input value={c?.startPoint ?? ''} onChange={(e) => upd(i.id, { startPoint: e.target.value })} placeholder="إعلان حالة الطوارئ" />
                      </Field>
                      <Field label="الجهة المسؤولة حسب الخطة" required>
                        <Input value={c?.responsible ?? ''} onChange={(e) => upd(i.id, { responsible: e.target.value })} placeholder={i.owner || 'رئيس فريق الطوارئ أو من ينوب عنه'} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="الخطوات الإلزامية" required hint="ما الذي يجب أن يتضمنه التنفيذ ليُعتبر كاملاً">
                          <Input value={c?.mandatorySteps ?? ''} onChange={(e) => upd(i.id, { mandatorySteps: e.target.value })} placeholder="حضور ممثلي الأقسام الخمسة الأساسية" />
                        </Field>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-forest-50/60 border border-forest-200 p-3">
                      <div className="text-[12px] font-bold mb-1.5">المعيار المُولَّد</div>
                      <p className="text-[13.5px] leading-[1.95]">{composeCriterion(c ?? { action: '', duration: '', startPoint: '', responsible: '', mandatorySteps: '' }) || 'املئي الحقول أعلاه…'}</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <SectionTitle title="تصنيف درجة التنفيذ" icon="ruler" sub="الفصل 7.4 — ثلاث درجات بدل الحكم الثنائي" />
        <div className="grid md:grid-cols-3 gap-3">
          {GRADE_DEFS.map((g) => (
            <div key={g.id} className={`rounded-xl border p-3.5 ${g.id === 'full' ? 'border-ok-300 bg-ok-50' : g.id === 'partial' ? 'border-warn-300 bg-warn-50' : 'border-danger-300/60 bg-danger-50'}`}>
              <div className="font-bold text-[14px] mb-1.5">{g.label}</div>
              <p className="text-[12.5px] text-ink-soft leading-relaxed">{g.meaning}</p>
              <div className="mt-2.5 pt-2.5 border-t border-black/5">
                <div className="text-[11px] font-semibold text-ink-mute mb-0.5">الإجراء المطلوب لاحقًا</div>
                <p className="text-[12.5px] leading-relaxed">{g.action}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
