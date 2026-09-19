import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Button, Card, SectionTitle, Tag, toast, arCount } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { auditProject, type AuditIssue } from '../../lib/compute';
import { DemoBanner, NoProject, ToolHeader } from './shared';
import { XP } from '../../data/badges';

const LEVELS = [
  { id: 'critical', label: 'مشكلات حرجة', tone: 'border-danger-300/60 bg-danger-50', dot: 'bg-danger-500', icon: 'alert' },
  { id: 'warning', label: 'تحذيرات', tone: 'border-warn-300 bg-warn-50', dot: 'bg-gold-500', icon: 'flag' },
  { id: 'rec', label: 'توصيات تحسين', tone: 'border-info-300/60 bg-info-50', dot: 'bg-info-500', icon: 'info' },
] as const;

export function AuditTool({ embedded }: { embedded?: boolean }) {
  const { project, go, dispatch } = useStore();
  const [ran, setRan] = useState(false);
  const [issues, setIssues] = useState<AuditIssue[]>([]);

  if (!project) return <NoProject />;

  const run = () => {
    const res = auditProject(project);
    setIssues(res); setRan(true);
    dispatch({ type: 'xp', amount: XP.auditRun });
    toast(`اكتمل التدقيق: ${arCount(res.length, 'ملاحظة واحدة', 'ملاحظتان', 'ملاحظات', 'ملاحظة')}`);
  };

  const count = (l: string) => issues.filter((i) => i.level === l).length;

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="تدقيق" title="دقّق مشروعي"
          sub="فحص آلي لمشروعك مقابل قواعد الدليل: بند بلا محفز، محفز بلا بند، محفز عام، بند بلا معيار، تصعيد بلا هدف، تكرار البنود السهلة، تجاهل بند عالي الأولوية، MSEL غير متوازن، وتوصيات بلا مالك أو مهلة."
          actions={<Button variant="primary" icon="shield" onClick={run}>{ran ? 'إعادة التدقيق' : 'دقّق مشروعي'}</Button>} />
      )}
      <DemoBanner />

      {embedded && <Button variant="primary" icon="shield" onClick={run}>{ran ? 'إعادة التدقيق' : 'دقّق مشروعي'}</Button>}

      {!ran ? (
        <Card>
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-xl bg-forest-50 text-forest-700 grid place-items-center mx-auto mb-4"><Icon name="shield" className="w-7 h-7" /></div>
            <p className="font-semibold text-[15px]">جاهز للتدقيق</p>
            <p className="text-[13px] text-ink-mute mt-1.5 max-w-lg mx-auto leading-relaxed">
              سيفحص النظام مشروعك مقابل الأخطاء الستة في الفصل 12 وقواعد الفصول 3 إلى 9، ويخرج بثلاثة مستويات:
              مشكلات حرجة، تحذيرات، وتوصيات تحسين.
            </p>
            <Button variant="primary" icon="shield" className="mt-5" onClick={run}>ابدأ التدقيق</Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((l) => (
              <Card key={l.id} className={count(l.id) ? l.tone : ''}>
                <div className="flex items-center gap-2 mb-1"><span className={`w-2.5 h-2.5 rounded-full ${l.dot}`} /><span className="text-[12.5px] text-ink-soft">{l.label}</span></div>
                <div className="text-[28px] font-bold leading-none">{count(l.id)}</div>
              </Card>
            ))}
          </div>

          {issues.length === 0 ? (
            <Card className="border-ok-300 bg-ok-50">
              <div className="flex items-center gap-3">
                <Icon name="check" className="w-6 h-6 text-ok-500" />
                <div><div className="font-bold text-[15px]">لا ملاحظات</div>
                  <p className="text-[13px] text-ink-soft mt-0.5">مشروعك مطابق لقواعد الدليل في كل الفحوص المطبّقة.</p></div>
              </div>
            </Card>
          ) : LEVELS.map((l) => {
            const list = issues.filter((i) => i.level === l.id);
            if (!list.length) return null;
            return (
              <Card key={l.id}>
                <SectionTitle title={l.label} icon={l.icon} sub={arCount(list.length, 'ملاحظة واحدة', 'ملاحظتان', 'ملاحظات', 'ملاحظة')} />
                <div className="space-y-2">
                  {list.map((i, n) => (
                    <div key={n} className={`rounded-lg border p-3.5 ${l.tone}`}>
                      <div className="flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full ${l.dot} shrink-0 mt-2`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[13.5px]">{i.title}</span>
                            <span className="text-[11px] text-ink-mute bg-white/70 border border-stone-200 rounded px-1.5 py-0.5">المصدر {i.ref}</span>
                          </div>
                          <p className="text-[12.5px] text-ink-soft mt-1.5 leading-relaxed">{i.detail}</p>
                        </div>
                        {i.route && <Button size="sm" icon="chevron" className="shrink-0 no-print" onClick={() => go(i.route!)}>معالجة</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
