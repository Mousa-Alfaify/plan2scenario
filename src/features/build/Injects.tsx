import React, { useState } from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Checkbox, Empty, Field, Input, Modal, SectionTitle, Select, Tag, Textarea, toast, useConfirm } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CATEGORIES, CAT_MAP, catName } from '../../data/categories';
import { targetedItems, uid } from '../../lib/compute';
import type { Inject } from '../../store/types';
import { DemoBanner, NeedItems, NoProject, ToolHeader, itemLabel } from './shared';

export const blankInject = (order: number): Inject => ({
  id: uid('j'), order, time: '', source: '', receiver: '', channel: '', event: '', data: '', decision: '',
  targetItemId: '', text: '', bypassable: '', isEscalation: false, objective: '', expectedAction: '', observerNotes: '',
});

/** صياغة نص المحفز بنفس منهج الدليل (5.4) */
export function composeInjectText(j: Inject): string {
  const parts: string[] = [];
  const head = [j.time ? `الساعة ${j.time}` : '', j.receiver ? `يُسلَّم لـ${j.receiver}` : ''].filter(Boolean).join(' — ');
  const body: string[] = [];
  if (j.source) body.push(`${j.channel || 'بلاغ'} من ${j.source}:`);
  if (j.event) body.push(j.event + '.');
  if (j.data) body.push(j.data + '.');
  if (j.decision) body.push(`${j.decision}${/[؟.]$/.test(j.decision) ? '' : '.'}`);
  if (head) parts.push(head + ':');
  parts.push(`«${body.join(' ')}»`);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function Injects({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();
  const [editing, setEditing] = useState<Inject | null>(null);
  const { ask, node } = useConfirm();

  if (!project) return <NoProject />;
  if (!project.items.length) return <NeedItems what="تصميم المحفزات" />;

  const targeted = targetedItems(project);
  const missing = targeted.filter((i) => !project.injects.some((j) => j.targetItemId === i.id));
  const flagged = project.injects.filter((j) => j.bypassable === 'yes');

  const save = (j: Inject) => {
    if (!j.targetItemId) { toast('بند الخطة المستهدف مطلوب', 'err'); return; }
    const text = j.text.trim() || composeInjectText(j);
    edit((p) => {
      const i = p.injects.findIndex((x) => x.id === j.id);
      const v = { ...j, text };
      if (i >= 0) p.injects[i] = v; else p.injects.push({ ...v, order: p.injects.length + 1 });
    });
    setEditing(null); toast('حُفظ المحفز');
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 5" title="بانِي المحفزات — Inject Builder"
          sub="القاعدة الذهبية: المحفز لا «يذكّر» الفريق ببند الخطة، بل يخلق ظرفًا لا يمكن تجاوزه دون استخدام ذلك البند تحديدًا."
          actions={<Button variant="primary" icon="plus" onClick={() => setEditing(blankInject(project.injects.length + 1))}>محفز جديد</Button>} />
      )}
      <DemoBanner />

      {flagged.length > 0 && (
        <div className="rounded-xl2 border border-danger-300/60 bg-danger-50 p-4">
          <div className="flex items-center gap-2 mb-1.5"><Icon name="alert" className="w-4 h-4 text-danger-600" />
            <span className="font-bold text-[13.5px] text-danger-600">{flagged.length} محفز يحتاج إعادة تصميم</span></div>
          <p className="text-[12.5px] text-ink-soft leading-relaxed">
            أجبتِ بـ«نعم» على سؤال الفحص: الفريق يستطيع تجاوز هذه المحفزات دون تنفيذ البند المستهدف. أعيدي تصميمها (5.1).
          </p>
        </div>
      )}

      {missing.length > 0 && (
        <Card className="border-warn-300 bg-warn-50">
          <div className="flex items-start gap-3">
            <Icon name="flag" className="w-5 h-5 text-warn-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-[13.5px]">{missing.length} بند مستهدف بلا محفز</div>
              <p className="text-[12.5px] text-ink-soft mt-1 mb-2.5">كل بند مستهدف يحتاج محفزًا واحدًا على الأقل يفرض تنفيذه.</p>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((i) => (
                  <button key={i.id} onClick={() => setEditing({ ...blankInject(project.injects.length + 1), targetItemId: i.id })}
                    className="chip bg-white border border-stone-300 hover:border-forest-400 text-[12px]">
                    <Icon name="plus" className="w-3.5 h-3.5" />{i.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {project.injects.length === 0 ? (
        <Card>
          <Empty icon="bolt" title="لا توجد محفزات بعد"
            body="اختاري بندًا مستهدفًا وصيغي محفزًا يخلق ظرفًا لا يمكن تجاوزه دون تنفيذه، بنص جاهز يُسلَّم للمشارك (5.4)."
            action={<Button variant="primary" icon="plus" onClick={() => setEditing(blankInject(1))}>محفز جديد</Button>} />
        </Card>
      ) : (
        <div className="space-y-3">
          {[...project.injects].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map((j) => {
            const it = project.items.find((x) => x.id === j.targetItemId);
            return (
              <Card key={j.id} className={j.bypassable === 'yes' ? 'border-danger-300' : ''}>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="shrink-0 text-center">
                    <div className="w-14 h-14 rounded-xl bg-forest-50 text-forest-800 grid place-items-center font-bold text-[14px]">{j.time || '—'}</div>
                    {j.isEscalation && <div className="mt-1.5"><Tag tone="red" icon="up">تصعيد</Tag></div>}
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Tag tone="forest">{it ? it.code : 'بلا بند'}</Tag>
                      {it?.category && <Tag tone="neutral">{catName(it.category)}</Tag>}
                      {j.bypassable === 'no' && <Tag tone="green" icon="check">يفرض البند</Tag>}
                      {j.bypassable === 'yes' && <Tag tone="red" icon="alert">يمكن تجاوزه</Tag>}
                      {j.bypassable === '' && <Tag tone="gold">لم يُفحص</Tag>}
                    </div>
                    <p className="text-[13.5px] leading-[1.9] text-ink">{j.text || <span className="text-ink-mute">— لا نص جاهز —</span>}</p>
                    {it && <p className="text-[12px] text-ink-mute mt-1.5">البند المستهدف: {it.desc}</p>}
                    {j.expectedAction && <p className="text-[12px] text-ink-mute mt-0.5">الإجراء المتوقع: {j.expectedAction}</p>}
                  </div>
                  <div className="flex gap-1 no-print">
                    <button onClick={() => setEditing({ ...j })} className="p-2 rounded-lg hover:bg-stone-100 text-ink-mute"><Icon name="edit" className="w-4 h-4" /></button>
                    <button onClick={() => ask('حذف هذا المحفز؟', () => edit((p) => { p.injects = p.injects.filter((x) => x.id !== j.id); }))}
                      className="p-2 rounded-lg hover:bg-danger-50 text-danger-500"><Icon name="trash" className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <InjectModal inject={editing} onClose={() => setEditing(null)} onSave={save} />
      {node}
    </div>
  );
}

export function InjectModal({ inject, onClose, onSave }: { inject: Inject | null; onClose: () => void; onSave: (j: Inject) => void }) {
  const { project } = useStore();
  const [d, setD] = useState<Inject | null>(inject);
  const [auto, setAuto] = useState(true);
  React.useEffect(() => { setD(inject); setAuto(!inject?.text); }, [inject]);
  if (!d || !project) return null;
  const set = (p: Partial<Inject>) => setD({ ...d, ...p });
  const preview = auto ? composeInjectText(d) : d.text;
  const it = project.items.find((x) => x.id === d.targetItemId);
  const cat = it?.category ? CAT_MAP[it.category] : undefined;

  return (
    <Modal open={!!inject} onClose={onClose} title={inject?.text ? 'تعديل المحفز' : 'محفز جديد'} wide>
      <div className="space-y-4">
        <Field label="بند الخطة المستهدف" required hint="الدليل يوصي باستهداف بند رئيسي واحد (لا أكثر من بندين) لسهولة القياس (5.3)">
          <Select value={d.targetItemId} onChange={(e) => set({ targetItemId: e.target.value })}>
            <option value="">— اختاري البند —</option>
            {project.items.map((i) => <option key={i.id} value={i.id}>{i.code} — {i.desc}</option>)}
          </Select>
        </Field>

        {cat && (
          <div className="rounded-lg bg-forest-50/60 border border-forest-200 p-3 text-[12.5px] leading-relaxed">
            <strong>مثال الدليل لفئة «{cat.name}» (5.2):</strong> {cat.injectExample}
            <div className="text-ink-mute mt-1">ما يجبر الفريق على فعله: {cat.injectForces}</div>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="وقت المحفز" hint="محدد بزمن دقيق مرتبط بالجدول الزمني العام (5.3)"><Input value={d.time} onChange={(e) => set({ time: e.target.value })} placeholder="00:35" dir="ltr" className="text-center" /></Field>
          <Field label="الشخص/الجهة المُرسِلة"><Input value={d.source} onChange={(e) => set({ source: e.target.value })} placeholder="مسؤول المستودع" /></Field>
          <Field label="المستقبل"><Input value={d.receiver} onChange={(e) => set({ receiver: e.target.value })} placeholder="مدير العمليات" /></Field>
        </div>

        <Field label="وسيلة المحفز" hint="رسالة، مكالمة، تقرير — للمحفز صيغة نصية جاهزة تُقدَّم للمشاركين (5.3)">
          <Select value={d.channel} onChange={(e) => set({ channel: e.target.value })}>
            <option value="">— اختاري —</option>
            {['مكالمة', 'رسالة', 'تقرير', 'بلاغ هاتفي', 'بريد إلكتروني', 'اتصال إعلامي', 'تقرير مخبري', 'بلاغ فني'].map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>

        <Field label="الحدث" required><Textarea rows={2} value={d.event} onChange={(e) => set({ event: e.target.value })} placeholder="كمية أكياس الدم من الفئة O سالب أوشكت على النفاد" /></Field>
        <Field label="البيانات المتاحة" hint="الأرقام والمعطيات التي يبني عليها الفريق قراره"><Textarea rows={2} value={d.data} onChange={(e) => set({ data: e.target.value })} placeholder="والحمل الحالي 82% من الطاقة الاستيعابية القصوى" /></Field>
        <Field label="القرار المطلوب"><Input value={d.decision} onChange={(e) => set({ decision: e.target.value })} placeholder="القرار مطلوب الآن" /></Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="الهدف من المحفز"><Input value={d.objective} onChange={(e) => set({ objective: e.target.value })} placeholder="اختبار بند طلب الدعم عند تجاوز 80%" /></Field>
          <Field label="الإجراء المتوقع"><Input value={d.expectedAction} onChange={(e) => set({ expectedAction: e.target.value })} placeholder="تفعيل طلب دعم كوادر من منشأة مجاورة" /></Field>
        </div>

        {/* نص المحفز */}
        <div className="rounded-xl border border-forest-200 bg-forest-50/40 p-3.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[12.5px] font-bold">نص المحفز الكامل <span className="text-ink-mute font-normal">— بمنهج 5.4</span></span>
            <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
              <input type="checkbox" checked={auto} onChange={(e) => { setAuto(e.target.checked); if (e.target.checked) set({ text: '' }); }} />
              صياغة تلقائية
            </label>
          </div>
          {auto ? (
            <p className="text-[13.5px] leading-[1.95] bg-white rounded-lg p-3 border border-stone-200 min-h-[64px]">{preview || 'املئي الحقول أعلاه لتوليد النص…'}</p>
          ) : (
            <Textarea rows={3} value={d.text} onChange={(e) => set({ text: e.target.value })} placeholder="الساعة 00:35 — يُسلَّم لمدير العمليات: «…»" />
          )}
        </div>

        {/* فحص القاعدة الذهبية */}
        <div className="rounded-xl border border-stone-200 p-3.5">
          <div className="text-[13px] font-bold mb-1">فحص القاعدة الذهبية (5.1)</div>
          <p className="text-[13px] text-ink-soft mb-2.5">هل يستطيع الفريق تجاوز هذا المحفز دون تنفيذ البند المستهدف؟</p>
          <div className="flex gap-2">
            <Button size="sm" variant={d.bypassable === 'no' ? 'primary' : 'secondary'} onClick={() => set({ bypassable: 'no' })}>لا — يفرض البند</Button>
            <Button size="sm" variant={d.bypassable === 'yes' ? 'danger' : 'secondary'} onClick={() => set({ bypassable: 'yes' })}>نعم — يمكن تجاوزه</Button>
          </div>
          {d.bypassable === 'yes' && (
            <div className="mt-3 rounded-lg bg-danger-50 border border-danger-300/60 p-3 text-[13px] leading-relaxed anim-in">
              <strong className="text-danger-600">المحفز يحتاج إعادة تصميم.</strong>
              <span className="text-ink-soft"> إذا كان الفريق قادرًا على تجاوز المحفز بحل بديل غير موثق بالخطة، فهو لا يختبر البند. أعيدي صياغة الظرف بحيث لا يوجد مخرج إلا استخدام البند المستهدف (5.1 و5.3).</span>
            </div>
          )}
          {d.bypassable === 'no' && (
            <div className="mt-3 rounded-lg bg-ok-50 p-3 text-[13px] text-ok-500 anim-in">
              <strong>محفز سليم.</strong> <span className="text-ink-soft">تأكدي أيضًا من واقعيته ضمن سياق الخطر المختار وعدم إقحامه تعسفيًا (5.3).</span>
            </div>
          )}
        </div>

        <Checkbox checked={d.isEscalation} onChange={(v) => set({ isEscalation: v })}
          label="هذا محفز تصعيد" hint="يُدرج قرب الثلث الأخير ويستهدف بندًا لم يُفعَّل بعد (8.1 و8.2)" />
      </div>

      <div className="flex gap-2 justify-end mt-5">
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="primary" icon="check" onClick={() => onSave({ ...d, text: auto ? composeInjectText(d) : d.text })}>حفظ المحفز</Button>
      </div>
    </Modal>
  );
}
