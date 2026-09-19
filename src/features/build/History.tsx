import React, { useMemo } from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Input, SectionTitle, Select, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { priorityOf, priorityScore, nItems } from '../../lib/compute';
import { PRIORITY_LABEL, catName } from '../../data/categories';
import { DemoBanner, NeedItems, NoProject, ToolHeader, exportCSV } from './shared';

export function History({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();

  if (!project) return <NoProject />;
  if (!project.items.length) return <NeedItems what="سجل التغطية التراكمي" />;

  const rows = useMemo(() => [...project.items].sort((a, b) => priorityScore(b) - priorityScore(a)), [project.items]);
  const never = rows.filter((i) => !i.testedBefore);
  const year = new Date().getFullYear();
  const stale = rows.filter((i) => {
    const y = parseInt(i.lastTested, 10);
    return i.testedBefore && y && year - y >= 3;
  });
  const vh = rows.filter((i) => priorityOf(i) === 'very-high');

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 6 + ملحق (هـ)" title="سجل التغطية التراكمي"
          sub="حدّثي هذا السجل بعد كل تمرين، وارجعي إليه عند اختيار بنود الاختبار للتمرين القادم — لتجنّب تكرار البنود «السهلة» وإهمال البنود الحرجة."
          actions={<Button icon="download" onClick={() => exportCSV(`سجل-التغطية-${project.name}`, [
            ['بند الخطة', 'آخر مرة اختُبر', 'عدد مرات الاختبار (3 سنوات)', 'الحساسية', 'التعقيد', 'الأولوية القادمة'],
            ...rows.map((i) => [`${i.code} — ${i.desc}`, i.lastTested || 'لم يُختبر', String(i.testCount3y),
              ['', 'منخفضة', 'متوسطة', 'عالية'][i.sensitivity], ['', 'بسيط', 'متوسط', 'معقّد'][i.complexity], PRIORITY_LABEL[priorityOf(i)]]),
          ])}>تصدير CSV</Button>} />
      )}
      <DemoBanner />

      {/* التنبيهات */}
      {(never.length > 0 || stale.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {never.length > 0 && (
            <div className="rounded-xl2 border border-danger-300/60 bg-danger-50 p-4">
              <div className="flex items-center gap-2 mb-2"><Icon name="alert" className="w-4 h-4 text-danger-600" />
                <span className="font-bold text-[13.5px] text-danger-600">{never.length} بند لم يُختبر مطلقًا</span></div>
              <ul className="text-[12.5px] text-ink-soft space-y-1 max-h-32 overflow-auto">
                {never.slice(0, 8).map((i) => <li key={i.id}>• {i.code} — {i.desc}</li>)}
              </ul>
              <p className="text-[12px] text-ink-mute mt-2 leading-relaxed">
                البند الذي لم يُختبر مطلقًا ويرتبط بسلامة المرضى مباشرة يجب أن يتصدر قائمة كل تمرين قادم حتى يُختبر (6.3).
              </p>
            </div>
          )}
          {stale.length > 0 && (
            <div className="rounded-xl2 border border-warn-300 bg-warn-50 p-4">
              <div className="flex items-center gap-2 mb-2"><Icon name="clock" className="w-4 h-4 text-warn-500" />
                <span className="font-bold text-[13.5px] text-warn-500">{stale.length} بند لم يُختبر منذ فترة طويلة</span></div>
              <ul className="text-[12.5px] text-ink-soft space-y-1 max-h-32 overflow-auto">
                {stale.slice(0, 8).map((i) => <li key={i.id}>• {i.code} — آخر اختبار {i.lastTested}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <Card className="bg-gold-300/10 border-gold-300">
        <div className="flex items-start gap-3">
          <Icon name="flag" className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[13.5px]">قاعدة ثابتة من الدليل (6.2)</div>
            <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
              كل تمرين يجب أن يستهدف <strong>بندًا واحدًا على الأقل بأولوية «عالية جدًا»</strong> من هذا السجل.
              {vh.length > 0 ? ` لديك حاليًا ${nItems(vh.length)} بهذه الأولوية.` : ' لا توجد بنود بهذه الأولوية حاليًا.'}
            </p>
          </div>
        </div>
      </Card>

      <Card pad={false}>
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
          <span className="font-semibold text-[13.5px]">السجل — مرتَّب تنازليًا حسب الأولوية</span>
          <span className="text-[12px] text-ink-mute">{rows.length} بندًا</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead><tr>
              <th className="th">بند الخطة</th>
              <th className="th">الفئة</th>
              <th className="th">آخر مرة اختُبر</th>
              <th className="th">عدد مرات الاختبار (3 سنوات)</th>
              <th className="th">مستوى الحساسية</th>
              <th className="th">درجة التعقيد</th>
              <th className="th">الأولوية القادمة</th>
            </tr></thead>
            <tbody>
              {rows.map((i) => {
                const p = priorityOf(i);
                return (
                  <tr key={i.id} className="hover:bg-stone-50">
                    <td className="td"><span className="font-semibold">{i.code}</span> — {i.desc}</td>
                    <td className="td text-[12.5px] whitespace-nowrap">{catName(i.category)}</td>
                    <td className="td no-print" style={{ minWidth: 120 }}>
                      <Input className="field-sm" value={i.lastTested} placeholder="لم يُختبر"
                        onChange={(e) => edit((pr) => { const t = pr.items.find((x) => x.id === i.id)!; t.lastTested = e.target.value; t.testedBefore = !!e.target.value && !/لم/.test(e.target.value); })} />
                    </td>
                    <td className="td no-print" style={{ minWidth: 90 }}>
                      <Input className="field-sm" type="number" min={0} value={i.testCount3y}
                        onChange={(e) => edit((pr) => { pr.items.find((x) => x.id === i.id)!.testCount3y = Math.max(0, +e.target.value || 0); })} />
                    </td>
                    <td className="td no-print" style={{ minWidth: 110 }}>
                      <Select className="field-sm" value={i.sensitivity}
                        onChange={(e) => edit((pr) => { pr.items.find((x) => x.id === i.id)!.sensitivity = +e.target.value as any; })}>
                        <option value={1}>منخفضة</option><option value={2}>متوسطة</option><option value={3}>عالية</option>
                      </Select>
                    </td>
                    <td className="td no-print" style={{ minWidth: 110 }}>
                      <Select className="field-sm" value={i.complexity}
                        onChange={(e) => edit((pr) => { pr.items.find((x) => x.id === i.id)!.complexity = +e.target.value as any; })}>
                        <option value={1}>بسيط</option><option value={2}>متوسط</option><option value={3}>معقّد</option>
                      </Select>
                    </td>
                    <td className="td">
                      <Tag tone={p === 'very-high' ? 'red' : p === 'high' ? 'gold' : p === 'medium' ? 'blue' : 'neutral'}>{PRIORITY_LABEL[p]}</Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-[12px] text-ink-mute border-t border-stone-200 leading-relaxed">
          الأولوية تُحسب بمعادلة مبسطة تجمع: طول المدة منذ آخر اختبار + حساسية البند (أثره على سلامة المرضى إن فشل) + تعقيده (6.3).
        </div>
      </Card>

      <Card>
        <SectionTitle title="البنود التي «يصعب» اختبارها" icon="info"
          sub="الحل ليس تجاهلها، بل اختبار الجزء الإجرائي منها (اتخاذ القرار والتواصل) عبر تمرين مكتبي أو وظيفي، مع توثيق أن الاختبار جزئي لا كامل (6.4)." />
        {project.items.filter((i) => i.hardToTest).length ? (
          <ul className="space-y-1.5">
            {project.items.filter((i) => i.hardToTest).map((i) => (
              <li key={i.id} className="flex items-start gap-2 text-[13px]">
                <Icon name="flag" className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                <span><strong>{i.code}</strong> — {i.desc}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-[13px] text-ink-mute">لم تُوسم أي بنود بأنها يصعب اختبارها. فعّلي الخانة في مختبر التفكيك عند الحاجة.</p>}
      </Card>
    </div>
  );
}
