import React from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Empty, Field, Input, SectionTitle, Select, Tag, Textarea, toast, useConfirm } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { GAP_CAUSES, REC_TYPES } from '../../data/categories';
import { uid } from '../../lib/compute';
import { DemoBanner, NeedItems, NoProject, ToolHeader, exportCSV } from './shared';
import type { AarEntry } from '../../store/types';

const recLabel = (id: string) => REC_TYPES.find((r) => r.id === id)?.label ?? '—';

export function Aar({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();
  const { ask, node } = useConfirm();

  if (!project) return <NoProject />;
  if (!project.items.length) return <NeedItems what="تقرير الاستخلاص" />;

  const upd = (id: string, patch: Partial<AarEntry>) => edit((p) => {
    const a = p.aar.find((x) => x.id === id); if (a) Object.assign(a, patch);
  });

  const addFromObservations = () => edit((p) => {
    let added = 0;
    p.observations.filter((o) => o.grade).forEach((o) => {
      if (p.aar.some((a) => a.itemId === o.itemId)) return;
      p.aar.push({
        id: uid('a'), itemId: o.itemId, grade: o.grade as any, gapReason: o.grade === 'full' ? '' : o.notes,
        gapCause: o.grade === 'full' ? '' : '', recType: o.grade === 'full' ? 'strength' : '',
        recText: o.grade === 'full' ? 'نقطة قوة تُحفظ: التنفيذ ضمن المعيار.' : '', owner: '', due: '', status: 'open', followUp: '',
      });
      added++;
    });
    toast(added ? `أُضيف ${added} مدخل استخلاص من نتائج المراقبة` : 'كل الملاحظات المقيَّمة مُدرجة بالفعل');
  });

  const addBlank = () => edit((p) => p.aar.push({
    id: uid('a'), itemId: '', grade: '', gapReason: '', gapCause: '', recType: '', recText: '', owner: '', due: '', status: 'open', followUp: '',
  }));

  const openRecs = project.aar.filter((a) => a.recType && !['no-action', 'strength'].includes(a.recType));

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 9 + ملحق (د)" title="الاستخلاص وخطة التحسين"
          sub="السؤال المحوري: هل كشف التمرين أن نص الخطة نفسه بحاجة لتعديل، أم أن الخطة سليمة والفجوة في التدريب أو الموارد؟ هذا التمييز يحدد نوع التوصية."
          actions={<>
            <Button icon="plus" onClick={addFromObservations}>توليد من نتائج المراقبة</Button>
            <Button icon="download" onClick={() => exportCSV(`الاستخلاص-${project.name}`, [
              ['بند الخطة', 'درجة التنفيذ', 'سبب الفجوة', 'موضع المشكلة', 'نوع التوصية', 'نص التوصية', 'المسؤول', 'تاريخ الاستحقاق', 'الحالة', 'ملاحظات المتابعة'],
              ...project.aar.map((a) => {
                const it = project.items.find((x) => x.id === a.itemId);
                return [it ? `${it.code} — ${it.desc}` : '', a.grade ? ({ full: 'كامل', partial: 'جزئي', none: 'لم يحدث' } as any)[a.grade] : '',
                  a.gapReason, GAP_CAUSES.find((g) => g.id === a.gapCause)?.label ?? '', recLabel(a.recType), a.recText, a.owner, a.due,
                  ({ open: 'مفتوحة', 'in-progress': 'قيد التنفيذ', done: 'منجزة', overdue: 'متأخرة' } as any)[a.status], a.followUp];
              }),
            ])}>تصدير CSV</Button>
            <Button variant="primary" icon="plus" onClick={addBlank}>مدخل جديد</Button>
          </>} />
      )}
      <DemoBanner />

      <Card className="bg-gold-300/10 border-gold-300">
        <div className="flex items-start gap-3">
          <Icon name="flag" className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
          <p className="text-[13px] leading-[1.95]">
            <strong>عمود «نوع التوصية» هو المخرج الأهم لأي جهة اعتماد</strong> — فهو يثبت أن التمرين لم يكن نشاطًا شكليًا،
            بل أداة تحسين فعلية للخطة (9.2). ولا تُترك أي توصية عامة بلا مالك ومهلة (9.3).
          </p>
        </div>
      </Card>

      {project.aar.length === 0 ? (
        <Card>
          <Empty icon="clipboard" title="لا مدخلات استخلاص بعد"
            body="ولّدي المدخلات تلقائيًا من نتائج المراقبة، أو أضيفي مدخلاً يدويًا. كل مدخل يجب أن يرتبط ببند محدد في الخطة."
            action={<div className="flex gap-2 justify-center"><Button variant="primary" icon="plus" onClick={addFromObservations}>توليد من المراقبة</Button><Button icon="plus" onClick={addBlank}>مدخل يدوي</Button></div>} />
        </Card>
      ) : (
        <div className="space-y-3">
          {project.aar.map((a, n) => {
            const it = project.items.find((x) => x.id === a.itemId);
            const needsOwner = a.recType && !['no-action', 'strength'].includes(a.recType);
            return (
              <Card key={a.id} className={!a.itemId ? 'border-danger-300' : ''}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-md bg-stone-100 text-ink-mute grid place-items-center text-[11.5px] font-bold">{n + 1}</span>
                    {it ? <Tag tone="forest">{it.code}</Tag> : <Tag tone="red">بلا بند</Tag>}
                    {a.grade && <Tag tone={a.grade === 'full' ? 'green' : a.grade === 'partial' ? 'gold' : 'red'}>{({ full: 'كامل', partial: 'جزئي', none: 'لم يحدث' } as any)[a.grade]}</Tag>}
                    {a.recType && <Tag tone={a.recType === 'strength' ? 'green' : a.recType === 'plan-edit' ? 'red' : 'blue'}>{recLabel(a.recType)}</Tag>}
                  </div>
                  <button onClick={() => ask('حذف هذا المدخل؟', () => edit((p) => { p.aar = p.aar.filter((x) => x.id !== a.id); }))}
                    className="p-1.5 rounded-md hover:bg-danger-50 text-danger-500 no-print"><Icon name="trash" className="w-4 h-4" /></button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="بند الخطة" required>
                    <Select value={a.itemId} onChange={(e) => upd(a.id, { itemId: e.target.value })}>
                      <option value="">— اختاري البند —</option>
                      {project.items.map((i) => <option key={i.id} value={i.id}>{i.code} — {i.desc}</option>)}
                    </Select>
                  </Field>
                  <Field label="درجة التنفيذ">
                    <Select value={a.grade} onChange={(e) => upd(a.id, { grade: e.target.value as any })}>
                      <option value="">—</option><option value="full">كامل</option><option value="partial">جزئي</option><option value="none">لم يحدث</option>
                    </Select>
                  </Field>
                  <Field label="موضع المشكلة" hint="السؤال المحوري في 9.1: هل الفجوة في نص الخطة أم في التدريب أم الموارد؟">
                    <Select value={a.gapCause} onChange={(e) => upd(a.id, { gapCause: e.target.value as any })}>
                      <option value="">—</option>
                      {GAP_CAUSES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </Select>
                  </Field>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="سبب الفجوة (إن وُجدت)">
                      <Textarea rows={2} value={a.gapReason} onChange={(e) => upd(a.id, { gapReason: e.target.value })}
                        placeholder="غموض في معيار «من يُفعِّل» عند غياب المسؤول الأول" />
                    </Field>
                  </div>
                  <Field label="نوع التوصية" required hint="المخرج الأهم لأي جهة اعتماد (9.2)">
                    <Select value={a.recType} onChange={(e) => upd(a.id, { recType: e.target.value as any })}>
                      <option value="">— اختاري —</option>
                      {REC_TYPES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </Select>
                  </Field>
                  <Field label="المسؤول عن الإجراء" required={!!needsOwner} hint="لا تُترك التوصية عامة بلا مالك (9.3)">
                    <Input value={a.owner} onChange={(e) => upd(a.id, { owner: e.target.value })} placeholder="رئيس فريق الطوارئ" />
                  </Field>
                  <Field label="تاريخ الاستحقاق" required={!!needsOwner}>
                    <Input type="date" value={a.due} onChange={(e) => upd(a.id, { due: e.target.value })} dir="ltr" />
                  </Field>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="نص التوصية" hint="مرتبطة ببند محدد لا عامة — تجنّبي «تحسين التواصل» (الخطأ الخامس في الفصل 12)">
                      <Textarea rows={2} value={a.recText} onChange={(e) => upd(a.id, { recText: e.target.value })}
                        placeholder="تعديل البند 4.1.3 لتحديد نائب ثانٍ صراحة عند غياب الأول والنائب الأول معًا" />
                    </Field>
                  </div>
                  <Field label="الحالة">
                    <Select value={a.status} onChange={(e) => upd(a.id, { status: e.target.value as any })}>
                      <option value="open">مفتوحة</option><option value="in-progress">قيد التنفيذ</option>
                      <option value="done">منجزة</option><option value="overdue">متأخرة</option>
                    </Select>
                  </Field>
                  <div className="sm:col-span-1 lg:col-span-2">
                    <Field label="ملاحظات المتابعة"><Input value={a.followUp} onChange={(e) => upd(a.id, { followUp: e.target.value })} /></Field>
                  </div>
                </div>

                {a.recType && (
                  <p className="text-[12px] text-ink-mute mt-3 pt-3 border-t border-stone-100 leading-relaxed">
                    {REC_TYPES.find((r) => r.id === a.recType)?.hint}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {openRecs.length > 0 && (
        <Card>
          <SectionTitle title="خطة التحسين" icon="route" sub="التوصيات التي تحتاج متابعة — مع مالك ومهلة وحالة (9.3)" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse">
              <thead><tr><th className="th">البند</th><th className="th">التوصية</th><th className="th">النوع</th><th className="th">المسؤول</th><th className="th">المهلة</th><th className="th">الحالة</th></tr></thead>
              <tbody>
                {openRecs.map((a) => {
                  const it = project.items.find((x) => x.id === a.itemId);
                  return (
                    <tr key={a.id} className="hover:bg-stone-50">
                      <td className="td whitespace-nowrap">{it?.code ?? '—'}</td>
                      <td className="td text-[12.5px]">{a.recText || '—'}</td>
                      <td className="td text-[12.5px] whitespace-nowrap">{recLabel(a.recType)}</td>
                      <td className="td text-[12.5px] whitespace-nowrap">{a.owner || <span className="text-danger-500">بلا مالك</span>}</td>
                      <td className="td text-[12.5px] whitespace-nowrap" dir="ltr">{a.due || <span className="text-danger-500">بلا مهلة</span>}</td>
                      <td className="td"><Tag tone={a.status === 'done' ? 'green' : a.status === 'overdue' ? 'red' : 'blue'}>
                        {({ open: 'مفتوحة', 'in-progress': 'قيد التنفيذ', done: 'منجزة', overdue: 'متأخرة' } as any)[a.status]}</Tag></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-ink-mute mt-3 leading-relaxed">
            أدرجي حالة تنفيذ توصيات التمرين السابق في افتتاحية تقرير التمرين الحالي — لإثبات الاستمرارية (9.3).
          </p>
        </Card>
      )}
      {node}
    </div>
  );
}
