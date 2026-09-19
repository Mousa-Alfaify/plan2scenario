import React from 'react';
import { useStore } from '../../store/store';
import { Card, SectionTitle, Tag, Progress } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CATEGORIES } from '../../data/categories';
import { categoryDistribution, coverageGaps, isPriorityItem, mselBalance, rankHazards, targetedItems, priorityOf } from '../../lib/compute';
import { DemoBanner, NoProject, ToolHeader } from './shared';

function Bars({ data, max }: { data: { label: string; value: number; tone?: string }[]; max?: number }) {
  const m = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-[12px] text-ink-soft w-[120px] shrink-0 truncate">{d.label}</span>
          <div className="flex-1 h-5 rounded-md bg-stone-100 overflow-hidden relative">
            <div className={`h-full rounded-md transition-[width] duration-500 ${d.tone ?? 'bg-forest-500'}`} style={{ width: `${(d.value / m) * 100}%` }} />
          </div>
          <span className="text-[12.5px] font-bold w-7 text-left">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Analytics({ embedded }: { embedded?: boolean }) {
  const { project } = useStore();
  if (!project) return <NoProject />;

  const items = project.items;
  const tested = items.filter((i) => i.testedBefore).length;
  const untested = items.length - tested;
  const priority = items.filter(isPriorityItem).length;
  const targeted = targetedItems(project);
  const gaps = coverageGaps(project);
  const dist = categoryDistribution(project);
  const ranked = rankHazards(project);
  const sel = ranked.find((r) => r.hazard.id === project.selectedHazardId);
  const bal = mselBalance(project);
  const injWithCriterion = project.injects.filter((j) => project.criteria.some((c) => c.itemId === j.targetItemId && c.text.trim())).length;

  const kpis = [
    { l: 'إجمالي بنود الخطة', v: items.length, s: 'المدى المتوقع 25–45 (3.5)' },
    { l: 'البنود المختبرة سابقًا', v: tested, s: `${items.length ? Math.round((tested / items.length) * 100) : 0}% من الإجمالي` },
    { l: 'البنود غير المختبرة', v: untested, s: 'أولويتك في اختيار الخطر (3.4)' },
    { l: 'البنود عالية الأولوية', v: priority, s: 'عالية + عالية جدًا (6.3)' },
    { l: 'عدد المحفزات', v: project.injects.length, s: `${project.injects.filter((j) => j.isEscalation).length} محفز تصعيد` },
    { l: 'محفزات بمعيار قياس', v: injWithCriterion, s: project.injects.length ? `${Math.round((injWithCriterion / project.injects.length) * 100)}% من المحفزات` : '—' },
  ];

  return (
    <div className="space-y-4">
      {!embedded && (
        <ToolHeader chapter="تحليل" title="لوحة تحليل المشروع"
          sub="قراءة كمية لحالة مشروعك: التغطية، التوزيع على الفئات السبع، وارتباط المحفزات بمعايير القياس." />
      )}
      <DemoBanner />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map((k) => (
          <Card key={k.l}>
            <div className="text-[12.5px] text-ink-mute">{k.l}</div>
            <div className="text-[27px] font-bold leading-none mt-1">{k.v}</div>
            <div className="text-[11.5px] text-ink-mute mt-1.5">{k.s}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="نسبة التغطية" icon="matrix" sub="حسب الخطر المختار في مصفوفة التغطية" />
          {sel ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-[34px] font-bold leading-none text-forest-700">{sel.pct}%</div>
                <div className="flex-1">
                  <Progress value={sel.pct} height={10} />
                  <div className="text-[12px] text-ink-mute mt-1.5">
                    «{sel.hazard.name}» يغطي {sel.total} من {items.length} بندًا · منها {sel.priorityCovered} بند أولوية و{sel.untestedCovered} بند لم يُختبر
                  </div>
                </div>
              </div>
              <Bars data={ranked.map((r) => ({ label: r.hazard.name, value: r.total, tone: r.hazard.id === project.selectedHazardId ? 'bg-forest-600' : 'bg-stone-300' }))} />
            </>
          ) : <p className="text-[13px] text-ink-mute">لم يُختر خطر بعد — افتحي مصفوفة التغطية.</p>}
        </Card>

        <Card>
          <SectionTitle title="توزيع البنود على الفئات السبع" icon="grid" sub="الفئات الفارغة مؤشر على تفكيك ناقص (3.2)" />
          <Bars data={dist.map((d) => ({ label: d.cat.name, value: d.count, tone: d.count === 0 ? 'bg-danger-300' : 'bg-forest-500' }))} />
          {dist.some((d) => d.count === 0) && (
            <p className="text-[12px] text-danger-600 mt-3 leading-relaxed">
              {dist.filter((d) => d.count === 0).length} فئة بلا بنود: {dist.filter((d) => d.count === 0).map((d) => d.cat.name).join('، ')} — راجعي الخطة، غالبًا فاتك تفكيك هذه الأقسام.
            </p>
          )}
        </Card>

        <Card>
          <SectionTitle title="توازن MSEL زمنيًا" icon="clock" sub="التسلسل الموصى به في 5.5" />
          <Bars data={[
            { label: 'الثلث الأول', value: bal.phases.early, tone: 'bg-forest-600' },
            { label: 'الثلث الأوسط', value: bal.phases.mid, tone: 'bg-info-500' },
            { label: 'الثلث الأخير', value: bal.phases.late, tone: 'bg-gold-500' },
          ]} />
          {bal.issues.length > 0 && <p className="text-[12px] text-warn-500 mt-3">{bal.issues.length} محفز خارج الثلث الموصى به لفئته.</p>}
        </Card>

        <Card>
          <SectionTitle title="Coverage Gaps" icon="alert" sub="بنود ذات أولوية خارج تغطية الخطر المختار" />
          {gaps.length === 0 ? (
            <div className="rounded-lg bg-ok-50 p-3.5 text-[13.5px] text-ok-500">
              {project.selectedHazardId ? 'لا توجد فجوات — الخطر المختار يغطي كل البنود ذات الأولوية.' : 'اختاري الخطر أولاً لحساب الفجوات.'}
            </div>
          ) : (
            <ul className="space-y-2">
              {gaps.map((g) => (
                <li key={g.id} className="flex items-start gap-2.5 rounded-lg bg-danger-50 p-2.5">
                  <Icon name="alert" className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
                  <div className="text-[12.5px]"><strong>{g.code}</strong> — {g.desc}
                    <span className="block text-ink-mute mt-0.5">الأولوية: {({ 'very-high': 'عالية جدًا', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' } as any)[priorityOf(g)]}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
