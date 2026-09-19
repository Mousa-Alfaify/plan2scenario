import React from 'react';
import { useEditableProject, useStore } from '../../store/store';
import { Button, Card, Checkbox, Progress, SectionTitle, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CHECKLIST, REFERENCES } from '../../data/categories';
import { checklistAuto, readyToRun } from '../../lib/compute';
import { DemoBanner, NoProject, ToolHeader } from './shared';

export function ChecklistView({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  const { edit } = useEditableProject();
  if (!project) return <NoProject />;

  const auto = checklistAuto(project);
  const r = readyToRun(project);

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="الفصل 13.1" title="قائمة التحقق النهائية"
          sub="عشرة عناصر تُراجَع قبل تنفيذ سيناريو اختبار الخطة. العناصر التي يستطيع النظام التحقق منها تلقائيًا تُعلَّم بنفسها." />
      )}
      <DemoBanner />

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Progress value={Math.round((r.done / r.total) * 100)} label={`${r.done} / ${r.total} جاهزة`} height={10} />
          </div>
          {r.essentialsDone && r.done === r.total
            ? <Tag tone="green" icon="check">جاهز للتنفيذ</Tag>
            : r.essentialsDone ? <Tag tone="gold">العناصر الأساسية مكتملة</Tag> : <Tag tone="red" icon="alert">غير جاهز للتنفيذ</Tag>}
        </div>
        {!r.essentialsDone && (
          <p className="text-[12.5px] text-ink-mute mt-3 leading-relaxed">
            لا يُعرض المشروع كـ«جاهز للتنفيذ» قبل استكمال العناصر الأساسية المؤشّرة بعلامة إلزامي.
          </p>
        )}
      </Card>

      <Card>
        <SectionTitle title="العناصر العشرة" icon="check" />
        <div className="space-y-2">
          {CHECKLIST.map((c) => {
            const isAuto = auto[c.id];
            const on = r.state[c.id];
            return (
              <div key={c.id} className={`rounded-lg border p-3 ${on ? 'border-ok-300 bg-ok-50' : c.essential ? 'border-warn-300/70 bg-warn-50/50' : 'border-stone-200'}`}>
                <div className="flex items-start gap-2.5">
                  <div className="flex-1">
                    <Checkbox checked={on} onChange={(v) => edit((p) => { p.checklist = { ...p.checklist, [c.id]: v }; })}
                      label={<span className="flex flex-wrap items-center gap-1.5">{c.text}
                        {c.essential && <Tag tone="red">إلزامي</Tag>}
                        {isAuto && <Tag tone="green" icon="check">تحقق تلقائي</Tag>}
                      </span>} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle title="أهم المراجع" icon="book" sub="الفصل 13.2" />
        <ul className="space-y-2">
          {REFERENCES.map((r2, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Icon name="file" className="w-4 h-4 text-ink-mute shrink-0 mt-1" />
              <div><span className="lat text-[13.5px] font-medium">{r2.t}</span>{r2.d && <span className="text-[12.5px] text-ink-mute block">{r2.d}</span>}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
