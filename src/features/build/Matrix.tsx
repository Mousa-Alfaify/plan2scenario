import React, { useState } from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Empty, Field, Input, Modal, Select, Tag, Textarea, toast, useConfirm, SectionTitle, Progress } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { rankHazards, isPriorityItem, uid, coverageGaps } from '../../lib/compute';
import { catName } from '../../data/categories';
import type { Hazard } from '../../store/types';
import { DemoBanner, NeedItems, NoProject, PriorityTag, ToolHeader, exportCSV } from './shared';

const blankHazard = (): Hazard => ({ id: uid('h'), name: '', geoRealism: 1, pastFrequency: 1, mgmtComplexity: 1, timeResources: 1, notes: '' });

export function Matrix({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();
  const [editing, setEditing] = useState<Hazard | null>(null);
  const [onlyPriority, setOnlyPriority] = useState(false);
  const { ask, node } = useConfirm();

  if (!project) return <NoProject />;
  if (!project.items.length) return <NeedItems what="مصفوفة التغطية" />;

  const ranked = rankHazards(project);
  const items = onlyPriority ? project.items.filter(isPriorityItem) : project.items;
  const toggle = (hId: string, iId: string) => edit((p) => {
    p.coverage[hId] = p.coverage[hId] || {};
    if (p.coverage[hId][iId]) delete p.coverage[hId][iId]; else p.coverage[hId][iId] = true;
  });
  const gaps = coverageGaps(project);
  const best = ranked[0];
  const tie = ranked.filter((r) => r.total === best?.total).length > 1;

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 4 + ملحق (ب)" title="مصفوفة تغطية المخاطر"
          sub="التغطية لا الإثارة: يُختار الخطر لأنه الأقدر على إجبار الفريق على استخدام أكبر عدد من بنود الخطة ذات الأولوية، خصوصًا غير المختبرة."
          actions={<>
            <Button icon="download" onClick={() => exportCSV(`مصفوفة-التغطية-${project.name}`, [
              ['بند الخطة المستهدف', ...project.hazards.map((h) => h.name)],
              ...project.items.map((i) => [`${i.code} — ${i.desc}`, ...project.hazards.map((h) => (project.coverage[h.id]?.[i.id] ? '✔' : '—'))]),
              ['مجموع البنود المُغطاة', ...ranked.sort((a, b) => project.hazards.findIndex((h) => h.id === a.hazard.id) - project.hazards.findIndex((h) => h.id === b.hazard.id)).map((r) => String(r.total))],
            ])}>تصدير CSV</Button>
            <Button variant="primary" icon="plus" onClick={() => setEditing(blankHazard())}>إضافة خطر مرشح</Button>
          </>} />
      )}
      <DemoBanner />

      {!project.hazards.length ? (
        <Card>
          <Empty icon="matrix" title="لا توجد مخاطر مرشحة"
            body="ضعي في الأعمدة المخاطر المرشحة من الـ HVA، وفي الصفوف بنود الخطة غير المختبرة من جدول التفكيك، وضعي علامة أينما كان الخطر يُجبر تفعيل ذلك البند (4.2)."
            action={<Button variant="primary" icon="plus" onClick={() => setEditing(blankHazard())}>إضافة خطر مرشح</Button>} />
        </Card>
      ) : (
        <>
          {/* المصفوفة */}
          <Card pad={false}>
            <div className="p-3.5 flex flex-wrap items-center gap-2 border-b border-stone-200 no-print">
              <span className="text-[13px] font-semibold">مصفوفة التغطية</span>
              <div className="flex-1" />
              <Button size="sm" variant={onlyPriority ? 'primary' : 'secondary'} icon="up" onClick={() => setOnlyPriority((v) => !v)}>البنود ذات الأولوية فقط</Button>
              {embedded && <Button size="sm" variant="primary" icon="plus" onClick={() => setEditing(blankHazard())}>خطر</Button>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 420 + project.hazards.length * 110 }}>
                <thead>
                  <tr>
                    <th className="th sticky right-0 bg-stone-50 z-10 min-w-[260px]">بند الخطة</th>
                    {project.hazards.map((h) => (
                      <th key={h.id} className="th text-center min-w-[110px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="leading-tight">{h.name}</span>
                          <div className="flex gap-0.5 no-print">
                            <button onClick={() => setEditing({ ...h })} className="p-1 rounded hover:bg-stone-200 text-ink-mute" aria-label="تعديل"><Icon name="edit" className="w-3.5 h-3.5" /></button>
                            <button onClick={() => ask(`حذف الخطر «${h.name}»؟`, () => edit((p) => {
                              p.hazards = p.hazards.filter((x) => x.id !== h.id); delete p.coverage[h.id];
                              if (p.selectedHazardId === h.id) p.selectedHazardId = '';
                              if (p.compoundWithId === h.id) p.compoundWithId = '';
                            }))} className="p-1 rounded hover:bg-danger-50 text-danger-500" aria-label="حذف"><Icon name="trash" className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="hover:bg-stone-50">
                      <td className="td sticky right-0 bg-white z-10">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[13px]">{i.code}</div>
                            <div className="text-[12.5px] text-ink-soft leading-snug">{i.desc}</div>
                            <div className="text-[11px] text-ink-mute mt-0.5">{catName(i.category)}</div>
                          </div>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            <PriorityTag item={i} />
                            {!i.testedBefore && <Tag tone="red">لم يُختبر</Tag>}
                          </div>
                        </div>
                      </td>
                      {project.hazards.map((h) => {
                        const on = !!project.coverage[h.id]?.[i.id];
                        return (
                          <td key={h.id} className="td text-center p-0">
                            <button onClick={() => toggle(h.id, i.id)} aria-pressed={on}
                              aria-label={`${h.name} — ${i.code}`}
                              className={`w-full h-full min-h-[52px] grid place-items-center transition ${on ? 'bg-ok-50 text-ok-500' : 'hover:bg-stone-100 text-stone-300'}`}>
                              {on ? <Icon name="check" className="w-5 h-5" strokeWidth={2.4} /> : <span className="text-[16px]">—</span>}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-forest-50/60 font-bold">
                    <td className="td sticky right-0 bg-forest-50 z-10">مجموع البنود المُغطاة</td>
                    {project.hazards.map((h) => {
                      const r = ranked.find((x) => x.hazard.id === h.id)!;
                      return <td key={h.id} className="td text-center text-[16px] text-forest-800">{r.total}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* نتيجة التغطية */}
          <Card>
            <SectionTitle title="نتيجة التغطية" icon="chart"
              sub="النظام يحسب ويشرح، والقرار النهائي لكِ — الدليل يوصي بالاختيار الرياضي لا بالحدس (4.2)." />
            <div className="space-y-2.5">
              {ranked.map((r, idx) => {
                const sel = project.selectedHazardId === r.hazard.id;
                return (
                  <div key={r.hazard.id} className={`rounded-xl border p-3.5 transition ${sel ? 'border-forest-400 bg-forest-50/50' : 'border-stone-200'}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg grid place-items-center text-[12.5px] font-bold shrink-0 ${idx === 0 ? 'bg-gold-500 text-white' : 'bg-stone-100 text-ink-mute'}`}>{idx + 1}</span>
                      <div className="flex-1 min-w-[160px]">
                        <div className="font-bold text-[14.5px]">{r.hazard.name}</div>
                        <div className="text-[12px] text-ink-mute mt-0.5">
                          يغطي {r.total} من {project.items.length} بندًا · {r.priorityCovered} بند أولوية · {r.untestedCovered} بند لم يُختبر
                        </div>
                      </div>
                      <div className="w-28"><Progress value={r.pct} height={6} tone={idx === 0 ? 'forest' : 'gold'} /></div>
                      <div className="text-[15px] font-bold w-12 text-center">{r.pct}%</div>
                      <Button size="sm" variant={sel ? 'primary' : 'secondary'} icon={sel ? 'check' : 'flag'}
                        onClick={() => edit((p) => { p.selectedHazardId = sel ? '' : r.hazard.id; if (!sel && !p.strategy) p.strategy = 'single'; })}>
                        {sel ? 'الخطر المختار' : 'اختيار'}
                      </Button>
                    </div>
                    {r.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pr-10">
                        {r.reasons.map((x, j) => <Tag key={j} tone="neutral" icon="check">{x}</Tag>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {tie && (
              <div className="mt-3 rounded-lg bg-warn-50 border border-warn-300/60 p-3 text-[13px] leading-relaxed">
                <strong>تعادل في عدد البنود المُغطاة.</strong> رجّحي حسب معايير 4.4: الواقعية الجغرافية والموسمية، تكرار الخطر في تمارين
                السنوات الماضية (فضّلي الأقل تكرارًا)، مستوى تعقيد الإدارة مقابل نضج الفريق، وتوفر الوقت والموارد. عوامل الترجيح مُدخلة
                في بطاقة كل خطر وتظهر أعلاه كأسباب.
              </div>
            )}

            {project.selectedHazardId && (
              <div className="mt-4 rounded-xl border border-stone-200 p-3.5">
                <div className="text-[13px] font-semibold mb-2.5">استراتيجية التغطية</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="الخيار المتبع" hint="الخيارات الثلاثة في 4.3 عند عدم تغطية خطر واحد لكل البنود">
                    <Select value={project.strategy} onChange={(e) => edit((p) => { p.strategy = e.target.value as any; })}>
                      <option value="">— اختاري —</option>
                      <option value="single">خطر واحد يغطي البنود ذات الأولوية</option>
                      <option value="compound">خطر مركّب Compound Hazard</option>
                      <option value="escalation">تصعيد داخل نفس السيناريو</option>
                      <option value="partial">تغطية جزئية + تمرين لاحق</option>
                    </Select>
                  </Field>
                  {project.strategy === 'compound' && (
                    <Field label="الخطر المتزامن" hint="يشترط الدليل أن يكون الجمع واقعيًا (4.3)">
                      <Select value={project.compoundWithId} onChange={(e) => edit((p) => { p.compoundWithId = e.target.value; })}>
                        <option value="">— اختاري —</option>
                        {project.hazards.filter((h) => h.id !== project.selectedHazardId).map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </Select>
                    </Field>
                  )}
                  <div className="sm:col-span-2">
                    <Field label="مبرر القرار" hint="يُوثَّق في وثيقة الفرضية وخطة التمارين السنوية">
                      <Textarea rows={2} value={project.strategyNote} onChange={(e) => edit((p) => { p.strategyNote = e.target.value; })}
                        placeholder="اختير … لأنه يغطي … من أصل … بنود ذات أولوية، وأُضيف تصعيد لاحق لتغطية البند المتبقي." />
                    </Field>
                  </div>
                </div>
                {gaps.length > 0 && (
                  <div className="mt-3 rounded-lg bg-danger-50 border border-danger-300/50 p-3">
                    <div className="text-[13px] font-bold text-danger-600 mb-1.5">{gaps.length} بند أولوية خارج التغطية</div>
                    <ul className="text-[12.5px] text-ink-soft space-y-1">
                      {gaps.map((g) => <li key={g.id}>• {g.code} — {g.desc}</li>)}
                    </ul>
                    <p className="text-[12px] text-ink-mute mt-2 leading-relaxed">
                      لديك ثلاثة خيارات حسب 4.3: خطر مركّب، أو تصعيد داخل السيناريو، أو تغطية جزئية موثقة مع تمرين لاحق.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}

      <HazardModal hazard={editing} onClose={() => setEditing(null)} onSave={(h) => {
        if (!h.name.trim()) { toast('اسم الخطر مطلوب', 'err'); return; }
        edit((p) => {
          const i = p.hazards.findIndex((x) => x.id === h.id);
          if (i >= 0) p.hazards[i] = h; else { p.hazards.push(h); p.coverage[h.id] = p.coverage[h.id] || {}; }
        });
        setEditing(null); toast('حُفظ الخطر المرشح');
      }} />
      {node}
    </div>
  );
}

function HazardModal({ hazard, onClose, onSave }: { hazard: Hazard | null; onClose: () => void; onSave: (h: Hazard) => void }) {
  const [d, setD] = useState<Hazard | null>(hazard);
  React.useEffect(() => setD(hazard), [hazard]);
  if (!d) return null;
  const set = (p: Partial<Hazard>) => setD({ ...d, ...p });
  const w = [
    { k: 'geoRealism', l: 'الواقعية الجغرافية والموسمية', h: 'مدى منطقية وقوع الخطر في موقع المنشأة وموسمها', o: ['ضعيفة', 'متوسطة', 'عالية'] },
    { k: 'pastFrequency', l: 'ندرة الخطر في تمارين السنوات الماضية', h: 'الدليل يفضّل الخطر الأقل تكرارًا في التمارين السابقة', o: ['تكرر كثيرًا', 'تكرر مرة', 'لم يتكرر'] },
    { k: 'mgmtComplexity', l: 'ملاءمة تعقيد الإدارة لنضج الفريق', h: 'اختاري ما يناسب نضج الفريق التدريبي الحالي', o: ['غير ملائم', 'ملائم جزئيًا', 'ملائم'] },
    { k: 'timeResources', l: 'توفر الوقت والموارد', h: 'القدرة على تنفيذ التمرين بالمستوى المطلوب', o: ['غير متوفر', 'جزئي', 'متوفر'] },
  ] as const;

  return (
    <Modal open={!!hazard} onClose={onClose} title={hazard?.name ? `تعديل الخطر: ${hazard.name}` : 'إضافة خطر مرشح'}>
      <div className="space-y-4">
        <Field label="اسم الخطر" required hint="من قائمة المخاطر المرشحة في الـ HVA">
          <Input value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="تفشٍّ وبائي داخل المنشأة" />
        </Field>
        <div className="rounded-lg bg-stone-50 p-3.5">
          <div className="text-[12.5px] font-bold mb-3">عوامل الترجيح عند التعادل <span className="text-ink-mute font-normal">— الفصل 4.4</span></div>
          <div className="space-y-3">
            {w.map((f) => (
              <Field key={f.k} label={f.l} hint={f.h}>
                <Select value={(d as any)[f.k]} onChange={(e) => set({ [f.k]: +e.target.value } as any)}>
                  {f.o.map((o, i) => <option key={i} value={i}>{o}</option>)}
                </Select>
              </Field>
            ))}
          </div>
        </div>
        <Field label="ملاحظات"><Textarea rows={2} value={d.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
      </div>
      <div className="flex gap-2 justify-end mt-5">
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="primary" icon="check" onClick={() => onSave(d)}>حفظ</Button>
      </div>
    </Modal>
  );
}
