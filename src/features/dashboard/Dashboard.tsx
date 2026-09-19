import React from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Progress, Ring, SectionTitle, Tag, Empty } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { MODULES } from '../../data/content';
import { QUIZZES } from '../../data/quizzes';
import { BADGES, levelOf } from '../../data/badges';
import { readiness, projectProgress } from '../../lib/compute';

export function Dashboard() {
  const { state, project, go, dispatch } = useStore();
  const pg = state.progress;
  const completed = MODULES.filter((m) => pg.modules[m.id]?.completed);
  const learnPct = Math.round((completed.length / MODULES.length) * 100);
  const quizzes = MODULES.map((m) => pg.modules[m.id]?.quiz).filter(Boolean) as NonNullable<ReturnType<() => any>>[];
  const avg = quizzes.length ? Math.round(quizzes.reduce((a, q) => a + q.best, 0) / quizzes.length) : 0;
  const totalEx = Object.keys(pg.labs).length;
  const lv = levelOf(pg.xp);
  const last = MODULES.find((m) => m.id === pg.lastModuleId) ?? MODULES.find((m) => !pg.modules[m.id]?.completed) ?? MODULES[0];
  const rd = project ? readiness(project) : null;
  const pp = project ? projectProgress(project) : null;

  const mastered = Object.entries(pg.conceptMastery).filter(([k, v]) => v >= 2 && (pg.conceptErrors[k] ?? 0) < v).map(([k]) => k);
  const weak = Object.entries(pg.conceptErrors).filter(([k, v]) => v >= 2 && v > (pg.conceptMastery[k] ?? 0)).map(([k]) => k);

  const conceptName: Record<string, string> = {
    'plan-vs-response': 'اختبار الخطة مقابل اختبار الاستجابة', 'backward-design': 'التصميم العكسي',
    'when-which-path': 'متى تستخدمين كل مسار', 'seven-categories': 'الفئات السبع', 'testable-unit': 'وحدة الاختبار',
    'decompose-size': 'حجم جدول التفكيك', 'decompose-table': 'جدول التفكيك', 'coverage-not-excitement': 'التغطية لا الإثارة',
    'coverage-matrix': 'مصفوفة التغطية', 'tie-break': 'معايير الترجيح عند التعادل', 'coverage-gap-options': 'خيارات نقص التغطية',
    'golden-rule': 'القاعدة الذهبية للمحفز', 'inject-quality': 'خصائص المحفز الجيد', 'inject-design': 'تصميم المحفزات',
    'inject-sequence': 'التسلسل الزمني للمحفزات', 'msel': 'قائمة MSEL', 'coverage-history': 'سجل التغطية التراكمي',
    'priority-formula': 'معادلة الأولوية', 'hard-to-test': 'البنود التي يصعب اختبارها', 'criteria-template': 'قالب معيار النجاح',
    'grading': 'تصنيف درجة التنفيذ', 'observer': 'نموذج المراقبة', 'escalation': 'نقطة التصعيد',
    'aar-question': 'السؤال المحوري بعد التمرين', 'aar-linkage': 'ربط الاستخلاص بالبنود', 'aar-followup': 'متابعة التوصيات',
    'pipeline': 'المراحل السبع', 'worked-example': 'المثال التطبيقي', 'common-mistakes': 'الأخطاء الشائعة',
    'checklist': 'قائمة التحقق', 'references': 'المراجع',
  };
  const moduleOfConcept = (c: string) => {
    for (const m of MODULES) {
      if ((QUIZZES[m.id] ?? []).some((q) => q.concept === c)) return m;
      for (const s of m.slides) for (const b of s.blocks) if (b.k === 'check' && b.concept === c) return m;
    }
    return undefined;
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="لوحة التعلم" sub="تقدمك في البرنامج ومشروعك التطبيقي الحالي" icon="home"
        action={<Button variant="primary" icon="play" onClick={() => go(`#/learn/${last.id}`)}>استكمال التعلم</Button>} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="flex items-center gap-4">
          <Ring value={learnPct} size={76} stroke={7} sub="إنجاز" />
          <div>
            <div className="text-[13px] text-ink-mute">نسبة الإنجاز</div>
            <div className="text-[15px] font-bold mt-0.5">{completed.length} من {MODULES.length} وحدة</div>
          </div>
        </Card>
        <Card>
          <div className="text-[13px] text-ink-mute">نتائج الاختبارات</div>
          <div className="text-[26px] font-bold mt-1 leading-none">{avg}<span className="text-[15px] text-ink-mute">%</span></div>
          <div className="text-[12px] text-ink-mute mt-1.5">{quizzes.length} اختبار مُنجز · المتوسط الأفضل</div>
        </Card>
        <Card>
          <div className="text-[13px] text-ink-mute">التمارين المنجزة</div>
          <div className="text-[26px] font-bold mt-1 leading-none">{totalEx}</div>
          <div className="text-[12px] text-ink-mute mt-1.5">أنشطة ومختبرات تفاعلية</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-ink-mute">المستوى</div>
              <div className="text-[16px] font-bold mt-0.5">{lv.level.name}</div>
            </div>
            <Tag tone="forest">{pg.xp} XP</Tag>
          </div>
          <div className="mt-2.5"><Progress value={lv.pct} height={6} /></div>
          <div className="text-[11.5px] text-ink-mute mt-1.5">{lv.next ? `${lv.next.min - pg.xp} XP للمستوى التالي` : 'أعلى مستوى'}</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* آخر درس + المشروع */}
        <Card className="lg:col-span-2">
          <SectionTitle title="آخر درس وصلتِ إليه" icon="book" />
          <button onClick={() => go(`#/learn/${last.id}`)} className="w-full text-right rounded-xl border border-stone-200 p-4 hover:border-forest-300 hover:bg-forest-50/40 transition">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-forest-50 text-forest-700 grid place-items-center shrink-0"><Icon name={last.icon} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] text-ink-mute">الوحدة {last.n} · {last.chapter}</div>
                <div className="font-bold text-[15px] truncate">{last.title}</div>
                <div className="text-[12.5px] text-ink-mute truncate">{last.subtitle}</div>
              </div>
              <Icon name="chevron" className="w-5 h-5 text-ink-mute shrink-0" />
            </div>
            <div className="mt-3">
              <Progress value={Math.round(((pg.modules[last.id]?.seen.length ?? 0) / last.slides.length) * 100)} height={6} />
            </div>
          </button>

          <div className="mt-5">
            <SectionTitle title="مشروعك التطبيقي الحالي" icon="tools"
              action={<Button size="sm" onClick={() => { dispatch({ type: 'mode', mode: 'build' }); go('#/build'); }}>فتح المشروع</Button>} />
            {project ? (
              <div className="rounded-xl border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-bold text-[15px]">{project.name}</div>
                    <div className="text-[12.5px] text-ink-mute mt-0.5">{project.org || 'بدون جهة محددة'} · {project.items.length} بند</div>
                  </div>
                  {project.isDemo && <Tag tone="gold" icon="info">مثال تدريبي</Tag>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-[12px] text-ink-mute mb-1.5">المراحل السبع</div>
                    <Progress value={pp!.pct} label={`${pp!.done} من ${pp!.total} مرحلة`} />
                  </div>
                  <div>
                    <div className="text-[12px] text-ink-mute mb-1.5">جاهزية السيناريو</div>
                    <Progress value={rd!.pct} tone={rd!.pct >= 75 ? 'forest' : rd!.pct >= 45 ? 'gold' : 'red'} label={`${rd!.score} / ${rd!.max}`} />
                  </div>
                </div>
              </div>
            ) : <Empty title="لا يوجد مشروع نشط" action={<Button onClick={() => go('#/projects')}>إنشاء مشروع</Button>} />}
          </div>
        </Card>

        {/* المهارات والشارات */}
        <div className="space-y-4">
          <Card>
            <SectionTitle title="المهارات" icon="spark" />
            <div className="space-y-3">
              <div>
                <div className="text-[12px] font-semibold text-ok-500 mb-1.5">أتقنتِها</div>
                {mastered.length ? (
                  <div className="flex flex-wrap gap-1.5">{mastered.slice(0, 8).map((c) => <Tag key={c} tone="green" icon="check">{conceptName[c] ?? c}</Tag>)}</div>
                ) : <p className="text-[12.5px] text-ink-mute">لم تُسجَّل مهارات متقنة بعد — أجيبي على أسئلة الوحدات.</p>}
              </div>
              <div>
                <div className="text-[12px] font-semibold text-danger-500 mb-1.5">تحتاج مراجعة</div>
                {weak.length ? (
                  <div className="space-y-1.5">
                    {weak.slice(0, 6).map((c) => {
                      const m = moduleOfConcept(c);
                      return (
                        <button key={c} onClick={() => m && go(`#/learn/${m.id}`)}
                          className="w-full flex items-center gap-2 text-right rounded-lg bg-danger-50 px-2.5 py-2 hover:bg-danger-50/70">
                          <Icon name="refresh" className="w-4 h-4 text-danger-500 shrink-0" />
                          <span className="text-[12.5px] flex-1">{conceptName[c] ?? c}</span>
                          {m && <span className="text-[11px] text-ink-mute shrink-0">الوحدة {m.n}</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : <p className="text-[12.5px] text-ink-mute">لا توجد مفاهيم متعثرة حاليًا.</p>}
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle title="الشارات" icon="award" sub={`${pg.badges.length} من ${BADGES.length}`} />
            <div className="grid grid-cols-4 gap-2">
              {BADGES.map((b) => {
                const has = pg.badges.includes(b.id);
                return (
                  <div key={b.id} title={`${b.name} — ${b.desc}`}
                    className={`aspect-square rounded-xl grid place-items-center border transition ${has ? 'bg-gold-300/20 border-gold-300 text-gold-600' : 'bg-stone-50 border-stone-200 text-stone-300'}`}>
                    <Icon name={has ? b.icon : 'lock'} className="w-5 h-5" />
                  </div>
                );
              })}
            </div>
            <div className="mt-3 space-y-1">
              {BADGES.filter((b) => pg.badges.includes(b.id)).slice(-3).reverse().map((b) => (
                <div key={b.id} className="text-[12px] text-ink-soft flex items-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5 text-ok-500" />{b.name}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* أزرار الوصول السريع */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: 'استكمال التعلم', i: 'book', r: `#/learn/${last.id}`, m: 'learn' },
          { l: 'ابدأ مشروع اختبار خطة', i: 'plus', r: '#/projects', m: 'build' },
          { l: 'مختبر السيناريوهات', i: 'play', r: '#/labs', m: 'learn' },
          { l: 'النماذج والأدوات', i: 'tools', r: '#/forms', m: 'build' },
        ].map((b) => (
          <button key={b.l} onClick={() => { dispatch({ type: 'mode', mode: b.m as any }); go(b.r); }}
            className="card card-pad flex items-center gap-3 hover:border-forest-300 hover:shadow-lift transition text-right">
            <span className="w-9 h-9 rounded-lg bg-forest-50 text-forest-700 grid place-items-center shrink-0"><Icon name={b.i} /></span>
            <span className="font-semibold text-[13.5px] flex-1">{b.l}</span>
            <Icon name="chevron" className="w-4 h-4 text-ink-mute" />
          </button>
        ))}
      </div>
    </div>
  );
}
