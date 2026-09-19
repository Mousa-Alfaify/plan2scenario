import React, { useState } from 'react';
import { useStore, emptyProject } from '../../store/store';
import { Button, Card, Field, Input, Modal, SectionTitle, Tag, toast, useConfirm } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { readiness, projectProgress } from '../../lib/compute';
import { exportJSON } from './shared';

const TEMPLATES = [
  { name: 'اختبار خطة مستشفى', org: 'مستشفى', plan: 'خطة الطوارئ المعتمدة' },
  { name: 'اختبار خطة مركز قيادة', org: 'مركز قيادة وسيطرة', plan: 'خطة إدارة الأزمات' },
  { name: 'اختبار خطة منشأة حكومية', org: 'منشأة حكومية', plan: 'خطة الطوارئ والإخلاء' },
];

export function Projects() {
  const { state, dispatch, go } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', org: '', planName: '' });
  const { ask, node } = useConfirm();

  const create = () => {
    if (!form.name.trim()) { toast('اسم المشروع مطلوب', 'err'); return; }
    const p = emptyProject(form.name.trim(), form.org.trim(), form.planName.trim());
    dispatch({ type: 'addProject', project: p });
    dispatch({ type: 'mode', mode: 'build' });
    setOpen(false); setForm({ name: '', org: '', planName: '' });
    toast('أُنشئ المشروع');
    go('#/build/decompose');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[21px] sm:text-[24px] font-bold">المشاريع</h1>
          <p className="text-[13.5px] text-ink-mute mt-1.5">كل مشروع يحتفظ بجدول التفكيك، مصفوفة التغطية، سجل التغطية، المحفزات، MSEL، معايير النجاح، نقطة التصعيد، نتائج المراقبة، تقرير الاستخلاص، وخطة التحسين.</p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setOpen(true)}>مشروع جديد</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.projects.map((p) => {
          const rd = readiness(p), pp = projectProgress(p);
          const active = p.id === state.activeProjectId;
          return (
            <Card key={p.id} className={active ? 'border-forest-400 ring-1 ring-forest-200' : ''}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="font-bold text-[15px] leading-snug">{p.name}</div>
                  <div className="text-[12px] text-ink-mute mt-1">{p.org || '—'}</div>
                </div>
                {p.isDemo ? <Tag tone="gold" icon="info">مثال تدريبي</Tag> : active ? <Tag tone="green" icon="check">نشط</Tag> : null}
              </div>
              <div className="grid grid-cols-3 gap-2 my-3 text-center">
                {[['بنود', p.items.length], ['محفزات', p.injects.length], ['جاهزية', `${rd.pct}%`]].map(([l, v]) => (
                  <div key={l as string} className="rounded-lg bg-stone-50 py-2">
                    <div className="text-[15px] font-bold leading-none">{v as any}</div>
                    <div className="text-[10.5px] text-ink-mute mt-1">{l as string}</div>
                  </div>
                ))}
              </div>
              <div className="text-[11.5px] text-ink-mute mb-3">{pp.done} من 7 مراحل مكتملة</div>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant={active ? 'primary' : 'secondary'} icon="chevron"
                  onClick={() => { dispatch({ type: 'setActive', id: p.id }); dispatch({ type: 'mode', mode: 'build' }); go('#/build'); }}>
                  {active ? 'فتح' : 'تفعيل'}
                </Button>
                <Button size="sm" icon="copy" onClick={() => { dispatch({ type: 'duplicateProject', id: p.id, name: 'نسخة من ' + p.name }); toast('نُسخ المشروع'); }}>نسخ</Button>
                <Button size="sm" icon="download" onClick={() => exportJSON(p.name, p)}>تصدير</Button>
                {!p.isDemo && (
                  <Button size="sm" variant="danger" icon="trash"
                    onClick={() => ask(`حذف المشروع «${p.name}» نهائيًا؟ لا يمكن التراجع.`, () => { dispatch({ type: 'deleteProject', id: p.id }); toast('حُذف المشروع'); })} />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="مشروع اختبار خطة جديد">
        <div className="space-y-4">
          <div>
            <div className="label">قوالب سريعة</div>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button key={t.name} onClick={() => setForm({ name: t.name, org: t.org, planName: t.plan })}
                  className="chip bg-white border border-stone-300 hover:border-forest-400 text-[12.5px]">{t.name}</button>
              ))}
            </div>
          </div>
          <Field label="اسم المشروع" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اختبار خطة مستشفى الملك…" /></Field>
          <Field label="الجهة / المنشأة"><Input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} /></Field>
          <Field label="اسم الخطة المعتمدة" hint="الوثيقة التي ستُفكَّك بنودها"><Input value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} placeholder="خطة الطوارئ المعتمدة 2026" /></Field>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <Button onClick={() => setOpen(false)}>إلغاء</Button>
          <Button variant="primary" icon="plus" onClick={create}>إنشاء وبدء التفكيك</Button>
        </div>
      </Modal>
      {node}
    </div>
  );
}
