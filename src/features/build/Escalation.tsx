import React from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Checkbox, Field, Input, SectionTitle, Tag, Textarea, toast } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { coverageGaps, targetedItems } from '../../lib/compute';
import { DemoBanner, NeedItems, NoProject, ToolHeader } from './shared';

const CHECKS = [
  { k: 'justified', q: 'هل التصعيد مبرر ضمن منطق الخطر المختار؟', hint: 'لا حدث عشوائي غير مرتبط بالسيناريو' },
  { k: 'targetsUntested', q: 'هل يستهدف بندًا/بنودًا لم تُفعَّل بعد رغم أنها ضمن أهداف التمرين؟', hint: 'تصعيد بلا بند مستهدف = إثارة بلا هدف (الخطأ السادس في الفصل 12)' },
  { k: 'prePlanned', q: 'هل هو مُدرج في وثيقة الفرضية مسبقًا؟', hint: 'لا يُترك للارتجال أثناء التنفيذ' },
  { k: 'hasStopPoint', q: 'هل له نقطة توقف واضحة؟', hint: 'إن تجاوز الفريق قدرته الفعلية على الاستيعاب' },
  { k: 'withinCapacity', q: 'هل يبقى ضمن قدرة المشاركين على الاستيعاب؟', hint: 'لا يتجاوز قدرة الفريق بشكل يُفقد التمرين قيمته' },
] as const;

export function Escalation({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();

  if (!project) return <NoProject />;
  if (!project.items.length) return <NeedItems what="نقطة التصعيد" />;

  const e = project.escalation;
  const gaps = coverageGaps(project);
  const targeted = targetedItems(project);
  const notActivated = project.items.filter((i) => !project.injects.some((j) => j.targetItemId === i.id && !j.isEscalation));
  const passed = Object.values(e.checks).filter(Boolean).length;
  const set = (patch: any) => edit((p) => { Object.assign(p.escalation, patch); });
  const setCheck = (k: string, v: boolean) => edit((p) => { (p.escalation.checks as any)[k] = v; });

  const compose = () => {
    const targets = e.targetItemIds.map((id) => project.items.find((x) => x.id === id)).filter(Boolean);
    const names = targets.map((t) => `«${t!.desc}»`).join(' و');
    const txt = `الساعة ${e.time || '[الوقت]'} — تصعيد: ${e.event || '[الحدث]'}${names ? ` — يهدف لإجبار تفعيل بند ${names} الذي لم يُفعَّل بعد.` : '.'}`;
    set({ text: txt });
    toast('صيغ نص التصعيد');
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 8" title="نقطة التصعيد النهائية — Escalation Builder"
          sub="بعض بنود الخطة لا تُفعَّل إلا عند تجاوز حد معين من الضغط. نقطة التصعيد المقصودة قرب الثلث الأخير ترفع مستوى الحدث بشكل واقعي بما يكفي لتجاوز تلك العتبة." />
      )}
      <DemoBanner />

      {gaps.length > 0 && !e.enabled && (
        <div className="rounded-xl2 border border-danger-300/60 bg-danger-50 p-4">
          <div className="flex items-start gap-2.5">
            <Icon name="alert" className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[13.5px] text-danger-600">{gaps.length} بند أولوية خارج تغطية الخطر المختار</div>
              <p className="text-[12.5px] text-ink-soft mt-1 leading-relaxed">
                نقطة التصعيد أحد الخيارات الثلاثة في 4.3 لمعالجة هذه الفجوة. البنود: {gaps.map((g) => g.code).join('، ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-bold text-[15px]">تفعيل نقطة التصعيد</div>
            <p className="text-[12.5px] text-ink-mute mt-0.5">إن كان الخطر المختار يغطي كل البنود ذات الأولوية فقد لا تحتاجين تصعيدًا.</p>
          </div>
          <Button variant={e.enabled ? 'primary' : 'secondary'} icon={e.enabled ? 'check' : 'plus'}
            onClick={() => set({ enabled: !e.enabled })}>{e.enabled ? 'مُفعَّلة' : 'تفعيل'}</Button>
        </div>
      </Card>

      {e.enabled && (
        <>
          <Card>
            <SectionTitle title="معايير تصعيد سليم" icon="check" sub={`الفصل 8.2 — ${passed} من ${CHECKS.length} معايير مستوفاة`} />
            <div className="space-y-3">
              {CHECKS.map((c) => (
                <div key={c.k} className={`rounded-lg border p-3 ${(e.checks as any)[c.k] ? 'border-ok-300 bg-ok-50' : 'border-stone-200'}`}>
                  <Checkbox checked={(e.checks as any)[c.k]} onChange={(v) => setCheck(c.k, v)} label={c.q} hint={c.hint} />
                </div>
              ))}
            </div>
            {passed < CHECKS.length && (
              <p className="text-[12.5px] text-warn-500 mt-3 leading-relaxed">
                لن يُعتبر التصعيد مكتملاً في حساب جاهزية السيناريو حتى تُستوفى المعايير كاملة.
              </p>
            )}
          </Card>

          <Card>
            <SectionTitle title="صياغة حدث التصعيد" icon="up" />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="وقت التصعيد" required hint="قرب الثلث الأخير من السيناريو (8.1)">
                <Input value={e.time} onChange={(e2) => set({ time: e2.target.value })} placeholder="01:15" dir="ltr" className="text-center" />
              </Field>
              <Field label="البنود المستهدفة" required hint="البنود التي لم تُفعَّل بعد رغم أنها ضمن أهداف التمرين (8.2)">
                <div className="rounded-lg border border-stone-300 bg-white p-2 max-h-40 overflow-auto space-y-1.5">
                  {(notActivated.length ? notActivated : project.items).map((i) => (
                    <Checkbox key={i.id} checked={e.targetItemIds.includes(i.id)}
                      onChange={(v) => set({ targetItemIds: v ? [...e.targetItemIds, i.id] : e.targetItemIds.filter((x) => x !== i.id) })}
                      label={<span className="text-[12.5px]"><strong>{i.code}</strong> — {i.desc}</span>} />
                  ))}
                </div>
              </Field>
              <div className="sm:col-span-2">
                <Field label="الحدث" required hint="ارتفاع واقعي في مستوى الضغط يتجاوز عتبة تفعيل البند">
                  <Textarea rows={2} value={e.event} onChange={(e2) => set({ event: e2.target.value })}
                    placeholder="ورود بلاغ بارتفاع عدد الإصابات من 15 إلى 28 حالة خلال 20 دقيقة، مع حالتين حرجتين تتجاوزان القدرة الاستيعابية الحالية" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="نقطة التوقف" required hint="المعيار الرابع في 8.2: متى يوقف المتحكم التصعيد">
                  <Textarea rows={2} value={e.stopPoint} onChange={(e2) => set({ stopPoint: e2.target.value })}
                    placeholder="يوقف المتحكم التصعيد إذا تجاوز عدد الحالات قدرة الفريق على المتابعة، ويُوثَّق سبب الإيقاف." />
                </Field>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-forest-200 bg-forest-50/40 p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[12.5px] font-bold">نص التصعيد</span>
                <Button size="sm" icon="spark" onClick={compose}>صياغة تلقائية</Button>
              </div>
              <Textarea rows={3} value={e.text} onChange={(e2) => set({ text: e2.target.value })}
                placeholder="الساعة 01:15 — تصعيد: …" />
            </div>

            <div className="mt-3 rounded-lg bg-stone-50 p-3.5">
              <div className="text-[12px] font-bold mb-1.5">مثال الدليل (8.3)</div>
              <p className="text-[13px] leading-[1.9] text-ink-soft">
                الساعة 01:15 — تصعيد: ورود بلاغ بارتفاع عدد الإصابات من 15 إلى 28 حالة خلال 20 دقيقة، مع حالتين حرجتين تتجاوزان
                القدرة الاستيعابية الحالية — يهدف لإجبار تفعيل بند طلب المساعدة المتبادلة الذي لم يُفعَّل بعد.
              </p>
            </div>

            {e.text.trim() && e.targetItemIds.length > 0 && (
              <div className="mt-3">
                <Button icon="plus" onClick={() => edit((p) => {
                  const exists = p.injects.find((j) => j.isEscalation);
                  const payload = {
                    time: p.escalation.time, event: p.escalation.event, text: p.escalation.text,
                    targetItemId: p.escalation.targetItemIds[0] ?? '', isEscalation: true, bypassable: 'no' as const,
                    objective: 'إجبار تفعيل بند لم يُفعَّل بعد',
                  };
                  if (exists) Object.assign(exists, payload);
                  else p.injects.push({
                    id: 'esc-' + Date.now().toString(36), order: p.injects.length + 1, source: 'المتحكم',
                    receiver: '', channel: 'بلاغ', data: '', decision: '', expectedAction: '', observerNotes: '', ...payload,
                  } as any);
                  toast('أُدرج محفز التصعيد في MSEL');
                })}>إدراج التصعيد في قائمة MSEL</Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
