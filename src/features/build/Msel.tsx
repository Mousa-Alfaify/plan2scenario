import React, { useMemo, useState } from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Empty, Input, SectionTitle, Tag, toast, useConfirm } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CAT_MAP, catName } from '../../data/categories';
import { mselBalance, minutes, uid } from '../../lib/compute';
import type { Inject } from '../../store/types';
import { DemoBanner, NeedItems, NoProject, ToolHeader, exportCSV } from './shared';
import { InjectModal, blankInject } from './Injects';

export function Msel({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();
  const [editing, setEditing] = useState<Inject | null>(null);
  const [drag, setDrag] = useState<string>('');
  const { ask, node } = useConfirm();

  if (!project) return <NoProject />;
  if (!project.items.length) return <NeedItems what="قائمة MSEL" />;

  const sorted = useMemo(() => [...project.injects].sort((a, b) => a.order - b.order), [project.injects]);
  const bal = mselBalance(project);

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    edit((p) => {
      const arr = [...p.injects].sort((a, b) => a.order - b.order);
      const fi = arr.findIndex((x) => x.id === fromId), ti = arr.findIndex((x) => x.id === toId);
      if (fi < 0 || ti < 0) return;
      const [m] = arr.splice(fi, 1); arr.splice(ti, 0, m);
      arr.forEach((x, i) => { const t = p.injects.find((y) => y.id === x.id)!; t.order = i + 1; });
    });
  };

  const sortByTime = () => edit((p) => {
    const arr = [...p.injects].sort((a, b) => {
      const ma = minutes(a.time), mb = minutes(b.time);
      if (isNaN(ma) && isNaN(mb)) return 0; if (isNaN(ma)) return 1; if (isNaN(mb)) return -1;
      return ma - mb;
    });
    arr.forEach((x, i) => { p.injects.find((y) => y.id === x.id)!.order = i + 1; });
  });

  const crit = (id: string) => project.criteria.find((c) => c.itemId === id && c.text.trim());

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 5 + ملحق (ج)" title="قائمة الأحداث الرئيسية MSEL"
          sub="الجدول الزمني الكامل للمحفزات، وكل محفز مرتبط ببند الخطة المستهدف ومعيار قياسه — وهو ما يميّز MSEL لاختبار الخطة عن MSEL العامة."
          actions={<>
            <Button icon="refresh" onClick={sortByTime}>ترتيب حسب الوقت</Button>
            <Button icon="download" onClick={() => exportCSV(`MSEL-${project.name}`, [
              ['#', 'الوقت', 'نص المحفز الكامل', 'مصدر المحفز', 'المستقبل', 'بند الخطة المستهدف', 'الفئة', 'الهدف', 'الإجراء المتوقع', 'معيار القياس', 'ملاحظات المراقب'],
              ...sorted.map((j, n) => {
                const it = project.items.find((x) => x.id === j.targetItemId);
                return [String(n + 1), j.time, j.text, j.source, j.receiver, it ? `${it.code} — ${it.desc}` : '', it ? catName(it.category) : '',
                  j.objective, j.expectedAction, crit(j.targetItemId)?.text ?? '', j.observerNotes];
              }),
            ])}>تصدير CSV</Button>
            <Button variant="primary" icon="plus" onClick={() => setEditing(blankInject(project.injects.length + 1))}>محفز</Button>
          </>} />
      )}
      <DemoBanner />

      {/* الخط الزمني */}
      {sorted.length > 0 && (
        <Card>
          <SectionTitle title="الخط الزمني" icon="clock"
            sub="التسلسل الموصى به (5.5): التفعيل والقيادة أولاً، ثم الاتصال والموارد في الوسط، ثم الاستمرارية والتعافي في الثلث الأخير." />
          <div className="relative pt-1">
            <div className="grid grid-cols-3 gap-1 mb-2 text-[11px] text-center">
              {[['الثلث الأول', 'التفعيل والقيادة', bal.phases.early], ['الثلث الأوسط', 'الاتصال والموارد', bal.phases.mid], ['الثلث الأخير', 'الاستمرارية والتعافي', bal.phases.late]].map(([a, b, c], i) => (
                <div key={i} className="rounded-lg bg-stone-50 border border-stone-200 py-1.5">
                  <div className="font-semibold text-ink-soft">{a as string}</div>
                  <div className="text-ink-mute">{b as string} · {c as number} محفز</div>
                </div>
              ))}
            </div>
            <div className="relative h-16 rounded-lg bg-gradient-to-l from-danger-50 via-warn-50 to-forest-50 border border-stone-200">
              {sorted.filter((j) => !isNaN(minutes(j.time))).map((j) => {
                const all = sorted.map((x) => minutes(x.time)).filter((x) => !isNaN(x));
                const mn = Math.min(...all), mx = Math.max(...all);
                const pct = mx === mn ? 50 : ((minutes(j.time) - mn) / (mx - mn)) * 92 + 4;
                const it = project.items.find((x) => x.id === j.targetItemId);
                const tone = it?.category ? CAT_MAP[it.category]?.phase : 'mid';
                return (
                  <button key={j.id} onClick={() => setEditing({ ...j })} title={`${j.time} — ${it?.code ?? ''}`}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group" style={{ right: `${pct}%` }}>
                    <span className={`block w-3.5 h-3.5 rounded-full border-2 border-white shadow
                      ${j.isEscalation ? 'bg-danger-500' : tone === 'early' ? 'bg-forest-600' : tone === 'late' ? 'bg-gold-500' : 'bg-info-500'}`} />
                    <span className="absolute top-5 right-1/2 translate-x-1/2 text-[10px] text-ink-mute whitespace-nowrap">{j.time}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {bal.issues.length > 0 && (
            <div className="mt-4 rounded-lg bg-warn-50 border border-warn-300/60 p-3">
              <div className="font-bold text-[13px] text-warn-500 mb-1.5">{bal.issues.length} ملاحظة على التوازن الزمني</div>
              <ul className="text-[12.5px] text-ink-soft space-y-1">{bal.issues.map((i, k) => <li key={k}>• {i.msg}</li>)}</ul>
            </div>
          )}
        </Card>
      )}

      {/* الجدول */}
      <Card pad={false}>
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between gap-2">
          <span className="font-semibold text-[13.5px]">جدول MSEL</span>
          <span className="text-[12px] text-ink-mute no-print">اسحبي الصف لإعادة الترتيب</span>
        </div>
        {sorted.length === 0 ? (
          <Empty icon="list" title="القائمة فارغة" body="أضيفي محفزات مرتبطة ببنود الخطة لبناء قائمة الأحداث الرئيسية."
            action={<Button variant="primary" icon="plus" onClick={() => setEditing(blankInject(1))}>محفز جديد</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse">
              <thead><tr>
                <th className="th w-10">#</th><th className="th">الوقت</th><th className="th min-w-[260px]">نص المحفز</th>
                <th className="th">المصدر</th><th className="th">المستقبل</th><th className="th">بند الخطة المستهدف</th>
                <th className="th">الفئة</th><th className="th">الهدف</th><th className="th">الإجراء المتوقع</th>
                <th className="th">معيار القياس</th><th className="th">ملاحظات المراقب</th><th className="th no-print"></th>
              </tr></thead>
              <tbody>
                {sorted.map((j, n) => {
                  const it = project.items.find((x) => x.id === j.targetItemId);
                  const c = crit(j.targetItemId);
                  return (
                    <tr key={j.id} draggable onDragStart={() => setDrag(j.id)} onDragOver={(e) => e.preventDefault()}
                      onDrop={() => { reorder(drag, j.id); setDrag(''); }}
                      className={`hover:bg-stone-50 ${drag === j.id ? 'opacity-40' : ''} ${j.isEscalation ? 'bg-danger-50/40' : ''}`}>
                      <td className="td text-ink-mute"><div className="flex items-center gap-1"><Icon name="drag" className="w-3.5 h-3.5 no-print" />{n + 1}</div></td>
                      <td className="td font-semibold whitespace-nowrap" dir="ltr">{j.time || '—'}</td>
                      <td className="td text-[12.5px] leading-relaxed">{j.text || '—'}{j.isEscalation && <span className="block mt-1"><Tag tone="red" icon="up">تصعيد</Tag></span>}</td>
                      <td className="td text-[12.5px] whitespace-nowrap">{j.source || '—'}</td>
                      <td className="td text-[12.5px] whitespace-nowrap">{j.receiver || '—'}</td>
                      <td className="td text-[12.5px]">{it ? <><strong>{it.code}</strong> — {it.desc}</> : <span className="text-danger-500">بلا بند</span>}</td>
                      <td className="td text-[12px] whitespace-nowrap">{it ? catName(it.category) : '—'}</td>
                      <td className="td text-[12.5px]">{j.objective || '—'}</td>
                      <td className="td text-[12.5px]">{j.expectedAction || '—'}</td>
                      <td className="td text-[12px]">{c ? c.text : <span className="text-warn-500">لا معيار</span>}</td>
                      <td className="td no-print" style={{ minWidth: 150 }}>
                        <Input className="field-sm" value={j.observerNotes} placeholder="—"
                          onChange={(e) => edit((p) => { p.injects.find((x) => x.id === j.id)!.observerNotes = e.target.value; })} />
                      </td>
                      <td className="td no-print">
                        <div className="flex gap-1">
                          <button onClick={() => setEditing({ ...j })} className="p-1.5 rounded-md hover:bg-stone-100 text-ink-mute"><Icon name="edit" className="w-4 h-4" /></button>
                          <button onClick={() => ask('حذف هذا المحفز؟', () => edit((p) => { p.injects = p.injects.filter((x) => x.id !== j.id); }))}
                            className="p-1.5 rounded-md hover:bg-danger-50 text-danger-500"><Icon name="trash" className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <InjectModal inject={editing} onClose={() => setEditing(null)} onSave={(j) => {
        edit((p) => {
          const i = p.injects.findIndex((x) => x.id === j.id);
          if (i >= 0) p.injects[i] = j; else p.injects.push({ ...j, order: p.injects.length + 1 });
        });
        setEditing(null); toast('حُفظ المحفز');
      }} />
      {node}
    </div>
  );
}
