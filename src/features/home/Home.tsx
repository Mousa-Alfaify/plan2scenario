import React from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { MODULES } from '../../data/content';
import { STAGES } from '../../data/categories';
import { AUDIT_STATS } from '../../data/coverageAudit';

export function Home() {
  const { go, dispatch, state } = useStore();
  const stats = AUDIT_STATS();
  const started = state.progress.xp > 0;

  return (
    <div className="space-y-8">
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden rounded-xl2 bg-forest-900 text-white">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative px-6 sm:px-10 py-10 sm:py-14 max-w-3xl">
          <Tag tone="gold" icon="spark">دليل تدريبي تفاعلي · إصدار 2026</Tag>
          <h1 className="font-display text-[28px] sm:text-[40px] leading-[1.25] mt-4 mb-4 text-white">
            من الخطة إلى سيناريو قابل للقياس
          </h1>
          <p className="text-[15px] sm:text-[16.5px] leading-[1.95] text-forest-100/90">
            منصة تفاعلية تساعدك على تحويل خطط الطوارئ إلى سيناريوهات عملية تختبر البنود الفعلية
            وتقيس الأداء وتكشف الفجوات.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-7">
            <Button variant="gold" size="lg" icon="book"
              onClick={() => { dispatch({ type: 'mode', mode: 'learn' }); go(started ? '#/dashboard' : '#/learn/m1'); }}>
              {started ? 'استكمال التعلم' : 'ابدأ التعلم'}
            </Button>
            <Button size="lg" icon="plus" className="!bg-white/10 !text-white !border-white/25 hover:!bg-white/20"
              onClick={() => { dispatch({ type: 'mode', mode: 'build' }); go('#/projects'); }}>
              ابدأ مشروعاً جديداً
            </Button>
            <Button size="lg" icon="tools" className="!bg-transparent !text-white !border-white/25 hover:!bg-white/10"
              onClick={() => go('#/forms')}>
              استكشف الأدوات
            </Button>
          </div>
        </div>
      </section>

      {/* --------------------------- ما الذي ستتعلمينه --------------------------- */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-[19px] font-bold">الرحلة التعليمية</h2>
            <p className="text-[13px] text-ink-mute mt-1">سبع مراحل من الفصل 10 في الدليل، تنتقلين فيها من تفكيك الخطة إلى تقرير فجوات معتمد.</p>
          </div>
          <Button size="sm" icon="route" onClick={() => go('#/build/pipeline')}>عرض المصفوفة</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {STAGES.map((s) => (
            <button key={s.id} onClick={() => { dispatch({ type: 'mode', mode: 'build' }); go(s.route); }}
              className="card p-3.5 text-right hover:shadow-lift hover:border-forest-300 transition group">
              <div className="w-7 h-7 rounded-lg bg-forest-50 text-forest-700 grid place-items-center text-[12.5px] font-bold mb-2 group-hover:bg-forest-700 group-hover:text-white transition">{s.n}</div>
              <div className="text-[13px] font-semibold leading-snug">{s.name}</div>
              <div className="text-[11px] text-ink-mute mt-1.5 leading-relaxed">{s.out}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------ الوضعان ------------------------------ */}
      <section className="grid md:grid-cols-2 gap-4">
        <Card className="border-forest-200">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-forest-700 text-white grid place-items-center shrink-0"><Icon name="book" /></span>
            <div>
              <h3 className="font-bold text-[16px]">وضع التعلم <span className="lat text-[12px] text-ink-mute">Learn Mode</span></h3>
              <p className="text-[13.5px] text-ink-soft leading-relaxed mt-1.5">
                {MODULES.length} وحدة تعليمية مصغّرة تغطي فصول الدليل كاملة، مع تمارين تفاعلية واختبار بعد كل وحدة،
                وتعلّم تكيفي يعيد شرح ما تتعثرين فيه.
              </p>
              <Button size="sm" className="mt-3.5" icon="chevron"
                onClick={() => { dispatch({ type: 'mode', mode: 'learn' }); go('#/learn'); }}>الوحدات التعليمية</Button>
            </div>
          </div>
        </Card>
        <Card className="border-gold-300">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-gold-500 text-white grid place-items-center shrink-0"><Icon name="tools" /></span>
            <div>
              <h3 className="font-bold text-[16px]">وضع التطبيق <span className="lat text-[12px] text-ink-mute">Build Mode</span></h3>
              <p className="text-[13.5px] text-ink-soft leading-relaxed mt-1.5">
                أدوات عملية تبنين بها مشروع اختبار خطة حقيقي: جدول التفكيك، مصفوفة التغطية، المحفزات، MSEL،
                معايير القياس، المراقبة، الاستخلاص، والتقارير.
              </p>
              <Button size="sm" className="mt-3.5" icon="chevron"
                onClick={() => { dispatch({ type: 'mode', mode: 'build' }); go('#/build'); }}>لوحة المشروع</Button>
            </div>
          </div>
        </Card>
      </section>

      {/* ------------------------------ المصدر ------------------------------ */}
      <Card className="bg-white">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-stone-100 text-ink-soft grid place-items-center shrink-0"><Icon name="file" /></span>
            <div>
              <div className="font-bold text-[15px]">المصدر المرجعي للمحتوى</div>
              <p className="text-[13px] text-ink-mute mt-1 leading-relaxed">
                «كيف نكتب سيناريو لاختبار خطط الكوارث» — دليل تعليمي تفصيلي: من تفكيك الخطة إلى تصميم السيناريو إلى قياس الأداء.
                <br />إعداد: د. روعة الفرج — إصدار 2026 — 37 صفحة، 14 فصلاً وملحقًا.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[22px] font-bold text-ok-500">{stats.pct}%</div>
              <div className="text-[11px] text-ink-mute">تغطية المحتوى</div>
            </div>
            <Button size="sm" icon="check" onClick={() => go('#/audit')}>جدول التدقيق</Button>
          </div>
        </div>
      </Card>

      {/* ------------------------- فكرة المشروع والموقع ------------------------- */}
      <Card className="bg-forest-900 text-white border-forest-900">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-white/10 text-white grid place-items-center shrink-0">
              <Icon name="user" />
            </span>
            <div>
              <div className="text-[11.5px] text-forest-200/80">فكرة المشروع والموقع</div>
              <div className="font-bold text-[15.5px] mt-0.5">أ. موسى الفيفي</div>
              <div className="text-[13px] text-forest-100/85 mt-0.5">هيئة الهلال الأحمر السعودي</div>
            </div>
          </div>
          <a href="https://www.linkedin.com/in/mousa-alfaify" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-[13.5px] font-medium text-white transition hover:bg-white/20">
            <Icon name="user" className="w-[18px] h-[18px]" />
            الملف على LinkedIn
          </a>
        </div>
      </Card>
    </div>
  );
}
