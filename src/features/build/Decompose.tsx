import React, { useMemo, useState } from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Checkbox, Empty, Field, Input, Modal, Select, Tag, Textarea, toast, useConfirm, SectionTitle } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CATEGORIES, catName } from '../../data/categories';
import { priorityOf, priorityScore, uid } from '../../lib/compute';
import type { PlanItem } from '../../store/types';
import { DemoBanner, NoProject, PriorityTag, ToolHeader, exportCSV } from './shared';

const blank = (): PlanItem => ({
  id: uid('i'), code: '', desc: '', category: '', owner: '', testedBefore: false,
  lastTested: '', testCount3y: 0, sensitivity: 2, complexity: 2, hardToTest: false, notes: '', createdAt: Date.now(),
});

export function Decompose({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [onlyUntested, setOnlyUntested] = useState(false);
  const [sortPriority, setSortPriority] = useState(false);
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const { ask, node } = useConfirm();

  const rows = useMemo(() => {
    if (!project) return [];
    let r = project.items.filter((i) =>
      (!q || `${i.code} ${i.desc} ${i.owner} ${i.notes}`.includes(q)) &&
      (!cat || i.category === cat) &&
      (!onlyUntested || !i.testedBefore));
    if (sortPriority) r = [...r].sort((a, b) => priorityScore(b) - priorityScore(a));
    return r;
  }, [project, q, cat, onlyUntested, sortPriority]);

  if (!project) return <NoProject />;
  const n = project.items.length;

  const save = (it: PlanItem) => {
    if (!it.code.trim() || !it.desc.trim()) { toast('رقم البند والوصف مطلوبان', 'err'); return; }
    edit((p) => {
      const idx = p.items.findIndex((x) => x.id === it.id);
      if (idx >= 0) p.items[idx] = it; else p.items.push(it);
    });
    setEditing(null);
    toast('حُفظ البند في جدول التفكيك');
  };

  const remove = (it: PlanItem) => ask(`حذف البند ${it.code}؟ سيُحذف معه ارتباطه بالمحفزات والمعايير.`, () => {
    edit((p) => {
      p.items = p.items.filter((x) => x.id !== it.id);
      p.injects = p.injects.map((j) => (j.targetItemId === it.id ? { ...j, targetItemId: '' } : j));
      p.criteria = p.criteria.filter((c) => c.itemId !== it.id);
      p.observations = p.observations.filter((o) => o.itemId !== it.id);
      p.aar = p.aar.filter((a) => a.itemId !== it.id);
      Object.keys(p.coverage).forEach((h) => { delete p.coverage[h][it.id]; });
    });
    toast('حُذف البند');
  });

  const dist = CATEGORIES.map((c) => ({ c, n: project.items.filter((i) => i.category === c.id).length }));

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 3 + ملحق (أ)" title="مختبر تفكيك الخطة"
          sub="حوّلي خطة الطوارئ إلى وحدات صغيرة قابلة للاختبار المنفرد، كل وحدة تصف «من يفعل ماذا، وكيف، ومتى»."
          actions={<>
            <Button icon="download" onClick={() => exportCSV(`جدول-التفكيك-${project.name}`, [
              ['رقم البند', 'الوصف المختصر للإجراء', 'الفئة', 'المسؤول حسب الخطة', 'هل اختُبر سابقًا؟', 'آخر اختبار', 'مرات الاختبار/3 سنوات', 'الأولوية', 'ملاحظات'],
              ...project.items.map((i) => [i.code, i.desc, catName(i.category), i.owner, i.testedBefore ? 'نعم' : 'لا', i.lastTested || 'لم يُختبر', String(i.testCount3y), priorityOf(i), i.notes]),
            ])}>تصدير CSV</Button>
            <Button variant="primary" icon="plus" onClick={() => setEditing(blank())}>إضافة بند</Button>
          </>} />
      )}
      <DemoBanner />

      {/* مؤشر الحجم — 3.5 */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card>
          <div className="text-[12.5px] text-ink-mute">إجمالي البنود</div>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-[28px] font-bold leading-none">{n}</span>
            <span className="text-[12px] text-ink-mute mb-1">المدى المتوقع 25–45</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div className={`h-full rounded-full ${n >= 25 ? 'bg-ok-500' : n >= 15 ? 'bg-gold-500' : 'bg-danger-500'}`} style={{ width: `${Math.min(100, (n / 45) * 100)}%` }} />
          </div>
          {n > 0 && n < 15 && <p className="text-[11.5px] text-danger-600 mt-2 leading-relaxed">أقل من 15 بندًا — راجعي الخطة، غالبًا فاتك تفكيك إجراءات مركّبة إلى وحدات أصغر (3.5).</p>}
        </Card>
        <Card>
          <div className="text-[12.5px] text-ink-mute">لم تُختبر سابقًا</div>
          <div className="text-[28px] font-bold leading-none mt-1">{project.items.filter((i) => !i.testedBefore).length}</div>
          <p className="text-[11.5px] text-ink-mute mt-2">البنود المؤشرة بـ«لا» هي أولويتك في اختيار الخطر ولحظات التفعيل (3.4).</p>
        </Card>
        <Card>
          <div className="text-[12.5px] text-ink-mute mb-2">التوزيع على الفئات السبع</div>
          <div className="space-y-1">
            {dist.map(({ c, n: cn }) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="text-[11px] text-ink-mute w-[92px] truncate">{c.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-forest-500 rounded-full" style={{ width: `${n ? (cn / Math.max(...dist.map((d) => d.n), 1)) * 100 : 0}%` }} />
                </div>
                <span className={`text-[11px] w-4 text-left ${cn === 0 ? 'text-danger-500 font-bold' : 'text-ink-mute'}`}>{cn}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* أدوات التصفية */}
      <Card pad={false}>
        <div className="p-3.5 flex flex-wrap items-center gap-2 border-b border-stone-200 no-print">
          <div className="relative flex-1 min-w-[180px]">
            <Icon name="search" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في البنود…" className="pr-9 field-sm" />
          </div>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="field-sm w-auto">
            <option value="">كل الفئات</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
          </Select>
          <Button size="sm" variant={onlyUntested ? 'primary' : 'secondary'} icon="flag" onClick={() => setOnlyUntested((v) => !v)}>لم يُختبر</Button>
          <Button size="sm" variant={sortPriority ? 'primary' : 'secondary'} icon="up" onClick={() => setSortPriority((v) => !v)}>ترتيب بالأولوية</Button>
          {embedded && <Button size="sm" variant="primary" icon="plus" onClick={() => setEditing(blank())}>إضافة بند</Button>}
        </div>

        {rows.length === 0 ? (
          <Empty icon="grid" title={n === 0 ? 'ابدئي بإدخال أول بند' : 'لا نتائج مطابقة'}
            body={n === 0 ? 'اقرئي الخطة قسمًا قسمًا، وضعي إشارة عند كل جملة تصف «من يفعل ماذا، وكيف، ومتى» — هذه هي وحدة الاختبار (3.3).' : 'جرّبي تعديل البحث أو التصفية.'}
            action={n === 0 ? <Button variant="primary" icon="plus" onClick={() => setEditing(blank())}>إضافة بند</Button> : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead><tr>
                <th className="th">رقم البند</th>
                <th className="th">الوصف المختصر للإجراء</th>
                <th className="th">الفئة</th>
                <th className="th">المسؤول حسب الخطة</th>
                <th className="th">اختُبر سابقًا؟</th>
                <th className="th">آخر اختبار</th>
                <th className="th">الأولوية</th>
                <th className="th">ملاحظات</th>
                <th className="th no-print"></th>
              </tr></thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} className="hover:bg-stone-50">
                    <td className="td font-semibold whitespace-nowrap">{i.code}</td>
                    <td className="td min-w-[220px]">{i.desc}{i.hardToTest && <span className="block mt-1"><Tag tone="gold" icon="info">يصعب اختباره كاملاً</Tag></span>}</td>
                    <td className="td whitespace-nowrap">{i.category ? catName(i.category) : <span className="text-danger-500">بلا فئة</span>}</td>
                    <td className="td whitespace-nowrap">{i.owner || '—'}</td>
                    <td className="td">{i.testedBefore ? <Tag tone="green">نعم</Tag> : <Tag tone="red">لا</Tag>}</td>
                    <td className="td whitespace-nowrap">{i.lastTested || 'لم يُختبر'}</td>
                    <td className="td"><PriorityTag item={i} /></td>
                    <td className="td text-[12.5px] text-ink-mute max-w-[160px]">{i.notes || '—'}</td>
                    <td className="td no-print">
                      <div className="flex gap-1">
                        <button onClick={() => setEditing({ ...i })} className="p-1.5 rounded-md hover:bg-stone-100 text-ink-mute" aria-label="تعديل"><Icon name="edit" className="w-4 h-4" /></button>
                        <button onClick={() => remove(i)} className="p-1.5 rounded-md hover:bg-danger-50 text-danger-500" aria-label="حذف"><Icon name="trash" className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows.length > 0 && <div className="px-3.5 py-2.5 text-[12px] text-ink-mute border-t border-stone-200">{rows.length} من {n} بندًا</div>}
      </Card>

      <ItemModal item={editing} onClose={() => setEditing(null)} onSave={save} />
      {node}
    </div>
  );
}

function ItemModal({ item, onClose, onSave }: { item: PlanItem | null; onClose: () => void; onSave: (i: PlanItem) => void }) {
  const [d, setD] = useState<PlanItem | null>(item);
  React.useEffect(() => setD(item), [item]);
  if (!d) return null;
  const set = (patch: Partial<PlanItem>) => setD({ ...d, ...patch });

  return (
    <Modal open={!!item} onClose={onClose} title={item?.code ? `تعديل البند ${item.code}` : 'إضافة بند إلى جدول التفكيك'} wide>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="رقم البند بالخطة" required hint="مثال: 4.1.3 — كما هو مكتوب في وثيقة الخطة المعتمدة">
          <Input value={d.code} onChange={(e) => set({ code: e.target.value })} placeholder="4.1.3" />
        </Field>
        <Field label="الفئة" required hint="الفئات السبع في جدول 3.2 من الدليل">
          <Select value={d.category} onChange={(e) => set({ category: e.target.value as any })}>
            <option value="">— اختاري الفئة —</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="الوصف المختصر للإجراء" required hint="يجب أن يصف: من يفعل ماذا، وكيف، ومتى (3.3)">
            <Textarea rows={2} value={d.desc} onChange={(e) => set({ desc: e.target.value })} placeholder="تفعيل غرفة العمليات خلال 15 دقيقة من الإعلان" />
          </Field>
        </div>
        <Field label="المسؤول حسب الخطة" hint="المسؤول كما تنص عليه الخطة، لا حسب الواقع التشغيلي">
          <Input value={d.owner} onChange={(e) => set({ owner: e.target.value })} placeholder="رئيس فريق الطوارئ" />
        </Field>
        <Field label="آخر اختبار" hint="سنة آخر اختبار، أو اتركيه فارغًا إن لم يُختبر مطلقًا">
          <Input value={d.lastTested} onChange={(e) => set({ lastTested: e.target.value })} placeholder="2024 أو: لم يُختبر" />
        </Field>
        <Field label="عدد مرات الاختبار خلال 3 سنوات" hint="عمود في سجل التغطية التراكمي (6.2)">
          <Input type="number" min={0} value={d.testCount3y} onChange={(e) => set({ testCount3y: Math.max(0, +e.target.value || 0) })} />
        </Field>
        <Field label="حساسية البند" hint="أثره على سلامة المرضى إن فشل — أحد عوامل معادلة الأولوية (6.3)">
          <Select value={d.sensitivity} onChange={(e) => set({ sensitivity: +e.target.value as any })}>
            <option value={1}>منخفضة</option><option value={2}>متوسطة</option><option value={3}>عالية</option>
          </Select>
        </Field>
        <Field label="درجة التعقيد" hint="عامل ثالث في معادلة الأولوية (6.3)">
          <Select value={d.complexity} onChange={(e) => set({ complexity: +e.target.value as any })}>
            <option value={1}>بسيط</option><option value={2}>متوسط</option><option value={3}>معقّد</option>
          </Select>
        </Field>
        <div className="space-y-3 pt-1">
          <Checkbox checked={d.testedBefore} onChange={(v) => set({ testedBefore: v })} label="هل اختُبر سابقًا؟" hint="عمود يوجّه اختيار الخطر ولحظات التفعيل (3.4)" />
          <Checkbox checked={d.hardToTest} onChange={(v) => set({ hardToTest: v })} label="بند «يصعب» اختباره بالكامل" hint="يُختبر جزؤه الإجرائي عبر تمرين مكتبي مع توثيق جزئية الاختبار (6.4)" />
        </div>
        <div className="sm:col-span-2">
          <Field label="ملاحظات"><Textarea rows={2} value={d.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-stone-50 p-3 text-[12.5px] text-ink-soft">
        <strong>الأولوية المحسوبة:</strong> {['very-high', 'high', 'medium', 'low'].includes(priorityOf(d)) && (
          <span className="mr-1">{({ 'very-high': 'عالية جدًا', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' } as any)[priorityOf(d)]}</span>
        )}
        <span className="text-ink-mute"> — تُحسب من المدة منذ آخر اختبار + الحساسية + التعقيد (6.3).</span>
      </div>
      <div className="flex gap-2 justify-end mt-5">
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="primary" icon="check" onClick={() => onSave(d)}>حفظ البند</Button>
      </div>
    </Modal>
  );
}
