import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Icon } from '../ui/Icon';
import { Button, Progress, Tag } from '../ui';
import { levelOf } from '../../data/badges';
import { MODULES } from '../../data/content';
import { readiness } from '../../lib/compute';

const LEARN_NAV = [
  { r: '#/dashboard', label: 'لوحة التعلم', icon: 'home' },
  { r: '#/learn', label: 'الوحدات التعليمية', icon: 'book' },
  { r: '#/labs', label: 'مختبر السيناريوهات', icon: 'play' },
  { r: '#/final', label: 'الاختبار النهائي', icon: 'award' },
];
const BUILD_NAV = [
  { r: '#/build', label: 'لوحة المشروع', icon: 'home' },
  { r: '#/build/pipeline', label: 'من الخطة إلى السيناريو', icon: 'route' },
  { r: '#/build/decompose', label: 'مختبر تفكيك الخطة', icon: 'grid' },
  { r: '#/build/history', label: 'سجل التغطية التراكمي', icon: 'history' },
  { r: '#/build/matrix', label: 'مصفوفة التغطية', icon: 'matrix' },
  { r: '#/build/injects', label: 'بانِي المحفزات', icon: 'bolt' },
  { r: '#/build/msel', label: 'قائمة MSEL', icon: 'list' },
  { r: '#/build/escalation', label: 'نقطة التصعيد', icon: 'up' },
  { r: '#/build/criteria', label: 'معايير النجاح', icon: 'ruler' },
  { r: '#/build/observe', label: 'مراقبة الأداء', icon: 'eye' },
  { r: '#/build/aar', label: 'الاستخلاص والتحسين', icon: 'clipboard' },
  { r: '#/build/analytics', label: 'تحليل المشروع', icon: 'chart' },
  { r: '#/build/audit', label: 'دقّق مشروعي', icon: 'shield' },
  { r: '#/build/checklist', label: 'قائمة التحقق', icon: 'check' },
];
const COMMON_NAV = [
  { r: '#/projects', label: 'المشاريع', icon: 'file' },
  { r: '#/forms', label: 'النماذج والأدوات', icon: 'tools' },
  { r: '#/reports', label: 'مركز التقارير', icon: 'print' },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { state, project, go, dispatch } = useStore();
  const [openNav, setOpenNav] = useState(false);
  const mode = state.mode;
  const lv = levelOf(state.progress.xp);
  const done = MODULES.filter((m) => state.progress.modules[m.id]?.completed).length;
  const learnPct = Math.round((done / MODULES.length) * 100);
  const rd = project ? readiness(project) : null;
  const nav = mode === 'learn' ? LEARN_NAV : BUILD_NAV;
  const cur = state.route;
  const isActive = (r: string) => cur === r || (r !== '#/build' && r !== '#/learn' && cur.startsWith(r));

  const NavList = () => (
    <nav className="flex flex-col gap-0.5" aria-label="التنقل الرئيسي">
      {nav.map((n) => (
        <button key={n.r} onClick={() => { go(n.r); setOpenNav(false); }}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] text-right transition
            ${isActive(n.r) ? 'bg-forest-50 text-forest-800 font-semibold' : 'text-ink-soft hover:bg-stone-100'}`}>
          <Icon name={n.icon} className="w-[18px] h-[18px] shrink-0" />
          <span className="flex-1">{n.label}</span>
        </button>
      ))}
      <div className="h-px bg-stone-200 my-2.5" />
      {COMMON_NAV.map((n) => (
        <button key={n.r} onClick={() => { go(n.r); setOpenNav(false); }}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] text-right transition
            ${isActive(n.r) ? 'bg-forest-50 text-forest-800 font-semibold' : 'text-ink-soft hover:bg-stone-100'}`}>
          <Icon name={n.icon} className="w-[18px] h-[18px] shrink-0" />
          <span className="flex-1">{n.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-sand-100">
      {/* ------------------------------ Top bar ------------------------------ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 no-print">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-5 h-[58px] flex items-center gap-3">
          <button className="lg:hidden p-2 -mr-1 rounded-lg hover:bg-stone-100" onClick={() => setOpenNav(true)} aria-label="القائمة">
            <Icon name="list" />
          </button>

          <button onClick={() => go('#/')} className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-forest-700 text-white grid place-items-center shrink-0">
              <Icon name="shield" className="w-[18px] h-[18px]" />
            </span>
            <span className="hidden sm:block text-right leading-tight min-w-0">
              <span className="block font-bold text-[14px] truncate">أكاديمية اختبار خطط الكوارث</span>
              <span className="block text-[11px] text-ink-mute truncate">من الخطة إلى سيناريو قابل للقياس</span>
            </span>
          </button>

          <div className="flex-1" />

          {/* Mode switch */}
          <div className="flex bg-stone-100 rounded-lg p-0.5 shrink-0" role="tablist" aria-label="وضع النظام">
            {(['learn', 'build'] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m}
                onClick={() => { dispatch({ type: 'mode', mode: m }); go(m === 'learn' ? '#/dashboard' : '#/build'); }}
                className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium transition ${mode === m ? 'bg-white shadow-sm text-forest-800' : 'text-ink-mute'}`}>
                {m === 'learn' ? 'وضع التعلم' : 'وضع التطبيق'}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5 shrink-0 pr-2 border-r border-stone-200">
            <div className="text-left">
              <div className="text-[11px] text-ink-mute leading-none">المستوى {lv.level.n} · {lv.level.name}</div>
              <div className="text-[12.5px] font-bold text-forest-700 leading-tight">{state.progress.xp} XP</div>
            </div>
            <div className="w-16"><Progress value={lv.pct} height={5} /></div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto flex">
        {/* ------------------------------ Sidebar ------------------------------ */}
        <aside className="hidden lg:flex flex-col w-[248px] shrink-0 border-l border-stone-200 bg-white/60 p-3 no-print">
          <div className="mb-3 px-1">
            <div className="text-[11px] font-semibold text-ink-mute mb-2">
              {mode === 'learn' ? 'وضع التعلم — Learn' : 'وضع التطبيق — Build'}
            </div>
            {mode === 'learn'
              ? <Progress value={learnPct} label={`${done} من ${MODULES.length} وحدة`} />
              : rd && <Progress value={rd.pct} label="جاهزية السيناريو" tone={rd.pct >= 75 ? 'forest' : rd.pct >= 45 ? 'gold' : 'red'} />}
          </div>
          <NavList />
          {mode === 'build' && project && (
            <div className="mt-auto pt-3">
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                <div className="text-[11px] text-ink-mute mb-1">المشروع الحالي</div>
                <div className="text-[13px] font-semibold leading-snug line-clamp-2">{project.name}</div>
                {project.isDemo && <div className="mt-1.5"><Tag tone="gold" icon="info">مثال تدريبي</Tag></div>}
                <Button size="sm" className="w-full mt-2.5" icon="refresh" onClick={() => go('#/projects')}>تبديل المشروع</Button>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile drawer */}
        {openNav && (
          <div className="lg:hidden fixed inset-0 z-50 no-print">
            <div className="absolute inset-0 bg-forest-950/40" onClick={() => setOpenNav(false)} />
            <div className="absolute inset-y-0 right-0 w-[274px] bg-white p-3 overflow-auto anim-in">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-bold text-[14px]">القائمة</span>
                <button onClick={() => setOpenNav(false)} className="p-1.5 rounded-lg hover:bg-stone-100"><Icon name="x" /></button>
              </div>
              <NavList />
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 px-3 sm:px-5 py-5 sm:py-7 print-full">{children}</main>
      </div>

      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-5 py-5 grid gap-4 sm:grid-cols-2 text-[12px] text-ink-mute">
          <div className="space-y-1.5">
            <div>
              <span className="text-ink-soft font-medium">المصدر المرجعي للمحتوى:</span>{' '}
              «كيف نكتب سيناريو لاختبار خطط الكوارث» — د. روعة الفرج — إصدار 2026
            </div>
            <div>
              <span className="text-ink-soft font-medium">فكرة المشروع والموقع:</span>{' '}
              أ. موسى الفيفي — هيئة الهلال الأحمر السعودي
              <a href="https://www.linkedin.com/in/mousa-alfaify" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mr-2 text-forest-700 hover:text-forest-800 underline underline-offset-2 no-print">
                <Icon name="user" className="w-3.5 h-3.5" />LinkedIn
              </a>
            </div>
          </div>
          <div className="sm:text-left no-print">
            <button onClick={() => go('#/audit')} className="hover:text-forest-700 underline underline-offset-2">تدقيق تغطية المحتوى</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
