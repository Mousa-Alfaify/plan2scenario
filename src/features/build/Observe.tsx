import React from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Empty, Input, SectionTitle, Tag, Textarea, toast } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { GRADE_DEFS } from '../../data/categories';
import { targetedItems, uid } from '../../lib/compute';
import { DemoBanner, NeedItems, NoProject, ToolHeader, exportCSV } from './shared';
import type { Grade } from '../../store/types';

export function Observe({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();

  if (!project) return <NoProject />;
  if (!project.items.length) return <NeedItems what="نموذج مراقبة الأداء" />;

  const targeted = targetedItems(project);
  const list = targeted.length ? targeted : project.items;

  const getO = (itemId: string) => project.observations.find((o) => o.itemId === itemId);
  const upd = (itemId: string, patch: any) => edit((p) => {
    let o = p.observations.find((x) => x.itemId === itemId);
    if (!o) {
      const inj = p.injects.find((j) => j.targetItemId === itemId);
      o = { id: uid('o'), itemId, injectTime: inj?.time ?? '', actualTime: '', grade: '', notes: '' };
      p.observations.push(o);
    }
    Object.assign(o, patch);
  });

  const prepareAll = () => { list.forEach((i) => { if (!getO(i.id)) upd(i.id, {}); }); toast('جُهِّز نموذج المراقبة لكل بند مستهدف'); };
  const graded = list.filter((i) => getO(i.id)?.grade).length;
  const counts = { full: 0, partial: 0, none: 0 } as Record<string, number>;
  list.forEach((i) => { const g = getO(i.id)?.grade; if (g) counts[g]++; });

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 7.3 + ملحق (د)" title="مراقبة الأداء — Observer Mode"
          sub="يُجهَّز النموذج قبل بدء التنفيذ لكل بند مستهدف، ويُملأ لحظيًا أثناء التمرين: الوقت الفعلي، درجة التنفيذ، وملاحظة المراقب."
          actions={<>
            <Button icon="check" onClick={prepareAll}>تجهيز النموذج لكل البنود</Button>
            <Button icon="download" onClick={() => exportCSV(`مراقبة-الأداء-${project.name}`, [
              ['بند الخطة', 'وقت المحفز', 'الوقت الفعلي للتنفيذ', 'مطابق للمعيار؟', 'ملاحظات المراقب'],
              ...list.map((i) => { const o = getO(i.id); return [`${i.code} — ${i.desc}`, o?.injectTime ?? '', o?.actualTime ?? '', o?.grade ? ({ full: 'كامل', partial: 'جزئي', none: 'لم يحدث' } as any)[o.grade] : '', o?.notes ?? '']; }),
            ])}>تصدير CSV</Button>
          </>} />
      )}
      <DemoBanner />

      {/* شرح الدرجات */}
      <div className="grid md:grid-cols-3 gap-3">
        {GRADE_DEFS.map((g) => (
          <div key={g.id} className={`rounded-xl2 border p-3.5 ${g.id === 'full' ? 'border-ok-300 bg-ok-50' : g.id === 'partial' ? 'border-warn-300 bg-warn-50' : 'border-danger-300/60 bg-danger-50'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[14px]">{g.label}</span>
              <span className="text-[18px] font-bold">{counts[g.id]}</span>
            </div>
            <p className="text-[12.5px] text-ink-soft leading-relaxed">{g.meaning}</p>
            <p className="text-[12px] text-ink-mute mt-2 pt-2 border-t border-black/5 leading-relaxed"><strong>الإجراء:</strong> {g.action}</p>
          </div>
        ))}
      </div>

      <Card pad={false}>
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between gap-2">
          <span className="font-semibold text-[13.5px]">نموذج مراقبة الأداء أثناء التمرين</span>
          <span className="text-[12px] text-ink-mute">{graded} من {list.length} بندًا مُقيَّم</span>
        </div>
        {list.length === 0 ? (
          <Empty icon="eye" title="لا بنود مستهدفة" body="اختاري الخطر في مصفوفة التغطية أولاً." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead><tr>
                <th className="th">بند الخطة</th><th className="th">معيار النجاح</th>
                <th className="th">وقت المحفز</th><th className="th">الوقت الفعلي للتنفيذ</th>
                <th className="th">مطابق للمعيار؟</th><th className="th">ملاحظات المراقب</th>
              </tr></thead>
              <tbody>
                {list.map((i) => {
                  const o = getO(i.id);
                  const c = project.criteria.find((x) => x.itemId === i.id);
                  return (
                    <tr key={i.id} className="hover:bg-stone-50">
                      <td className="td"><strong>{i.code}</strong> — {i.desc}</td>
                      <td className="td text-[12px] text-ink-mute max-w-[240px]">{c?.text || <span className="text-warn-500">لا معيار — صيغيه أولاً</span>}</td>
                      <td className="td" style={{ minWidth: 92 }}>
                        <Input className="field-sm text-center" dir="ltr" value={o?.injectTime ?? ''} placeholder="00:12"
                          onChange={(e) => upd(i.id, { injectTime: e.target.value })} />
                      </td>
                      <td className="td" style={{ minWidth: 92 }}>
                        <Input className="field-sm text-center" dir="ltr" value={o?.actualTime ?? ''} placeholder="00:33"
                          onChange={(e) => upd(i.id, { actualTime: e.target.value })} />
                      </td>
                      <td className="td" style={{ minWidth: 190 }}>
                        <div className="flex gap-1">
                          {(['full', 'partial', 'none'] as Grade[]).map((g) => {
                            const on = o?.grade === g;
                            const lbl = { full: 'كامل', partial: 'جزئي', none: 'لم يحدث' }[g];
                            const cls = on
                              ? g === 'full' ? 'bg-ok-500 text-white border-ok-500' : g === 'partial' ? 'bg-gold-500 text-white border-gold-500' : 'bg-danger-500 text-white border-danger-500'
                              : 'bg-white border-stone-300 text-ink-soft hover:border-forest-400';
                            return (
                              <button key={g} onClick={() => upd(i.id, { grade: on ? '' : g })}
                                className={`px-2 py-1 rounded-md border text-[11.5px] font-medium transition ${cls}`}>{lbl}</button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="td" style={{ minWidth: 200 }}>
                        <Textarea rows={2} className="field-sm" value={o?.notes ?? ''} placeholder="ملاحظة مرتبطة بالبند…"
                          onChange={(e) => upd(i.id, { notes: e.target.value })} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {graded > 0 && (
        <Card className="bg-forest-50/50 border-forest-200">
          <div className="flex items-start gap-3">
            <Icon name="clipboard" className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-[13.5px]">الخطوة التالية: الاستخلاص</div>
              <p className="text-[12.5px] text-ink-soft mt-1 leading-relaxed">
                حوّلي كل ملاحظة إلى مدخل استخلاص مرتبط ببند محدد، مع تحديد سبب الفجوة ونوع التوصية ومالكها ومهلتها (9.2 و9.3).
              </p>
            </div>
            <Button size="sm" variant="primary" icon="chevron" onClick={() => { location.hash = '#/build/aar'; }}>فتح الاستخلاص</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
