import React, { useState } from 'react';
import type { Block, CalloutTone } from '../../data/content';
import { Icon } from '../../components/ui/Icon';
import { MD, Tag } from '../../components/ui';
import { useStore } from '../../store/store';
import { Widget } from './Widgets';

const TONES: Record<CalloutTone, { label: string; icon: string; cls: string; bar: string }> = {
  core: { label: 'الفكرة الأساسية', icon: 'spark', cls: 'bg-forest-50/70 border-forest-200', bar: 'bg-forest-600' },
  why: { label: 'لماذا هذا مهم؟', icon: 'info', cls: 'bg-info-50/70 border-info-300/60', bar: 'bg-info-500' },
  example: { label: 'مثال', icon: 'file', cls: 'bg-stone-50 border-stone-200', bar: 'bg-stone-400' },
  try: { label: 'جرّب بنفسك — تمرين سريع', icon: 'edit', cls: 'bg-warn-50 border-warn-300/70', bar: 'bg-gold-500' },
  mistake: { label: 'خطأ شائع', icon: 'alert', cls: 'bg-danger-50 border-danger-300/60', bar: 'bg-danger-500' },
  note: { label: 'معلومة مهمة', icon: 'flag', cls: 'bg-gold-300/15 border-gold-300/70', bar: 'bg-gold-500' },
  apply: { label: 'طبّقها في مشروعك', icon: 'tools', cls: 'bg-forest-50/70 border-forest-200', bar: 'bg-forest-500' },
  extra: { label: 'معلومة إضافية (خارج المصدر)', icon: 'plus', cls: 'bg-stone-50 border-dashed border-stone-300', bar: 'bg-stone-400' },
  goal: { label: 'أهداف الفصل', icon: 'target', cls: 'bg-forest-50/70 border-forest-200', bar: 'bg-forest-600' },
};

function Ref({ r }: { r?: string }) {
  if (!r) return null;
  return <span className="shrink-0 text-[10.5px] text-ink-mute bg-white/70 border border-stone-200 rounded px-1.5 py-0.5">المصدر {r}</span>;
}

/* ---------------------------- مقارنة تفاعلية ---------------------------- */
function Compare({ b }: { b: Extract<Block, { k: 'compare' }> }) {
  const [sel, setSel] = useState(0);
  return (
    <div className="rounded-xl2 border border-stone-200 overflow-hidden bg-white">
      <div className="grid grid-cols-[minmax(90px,1fr)_1.4fr_1.4fr] text-[12.5px] font-semibold bg-stone-50 border-b border-stone-200">
        <div className="px-3 py-2.5 text-ink-mute">البند</div>
        <div className="px-3 py-2.5 border-r border-stone-200">{b.aLabel}</div>
        <div className="px-3 py-2.5 border-r border-stone-200 text-forest-800 bg-forest-50/60">{b.bLabel}</div>
      </div>
      {b.rows.map((r, i) => (
        <button key={i} onClick={() => setSel(i === sel ? -1 : i)}
          className={`w-full grid grid-cols-[minmax(90px,1fr)_1.4fr_1.4fr] text-right border-b border-stone-100 last:border-0 transition
            ${sel === i ? 'bg-forest-50/40' : 'hover:bg-stone-50'}`}>
          <div className="px-3 py-3 text-[12.5px] font-medium text-ink-soft flex items-center gap-1.5">
            <Icon name="chevronD" className={`w-3.5 h-3.5 transition-transform ${sel === i ? '' : 'rotate-90'}`} />{r.dim}
          </div>
          <div className="px-3 py-3 text-[13px] border-r border-stone-100 leading-relaxed">{r.a}</div>
          <div className="px-3 py-3 text-[13px] border-r border-stone-100 leading-relaxed bg-forest-50/30 font-medium">{r.b}</div>
        </button>
      ))}
      {sel >= 0 && (
        <div className="px-4 py-3 bg-forest-900 text-white text-[13px] leading-[1.9] anim-in">
          <span className="font-bold">{b.rows[sel].dim}:</span> في اختبار الاستجابة العام يكون «{b.rows[sel].a}»،
          بينما في اختبار الخطة تحديدًا يكون «{b.rows[sel].b}».
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Flow lanes ------------------------------ */
function Flow({ b }: { b: Extract<Block, { k: 'flow' }> }) {
  const [hover, setHover] = useState<string>('');
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {b.lanes.map((lane) => (
        <div key={lane.label} className={`rounded-xl2 border p-4 ${lane.tone === 'b' ? 'border-forest-300 bg-forest-50/40' : 'border-stone-200 bg-white'}`}>
          <div className={`text-[13px] font-bold mb-3 ${lane.tone === 'b' ? 'text-forest-800' : 'text-ink-soft'}`}>{lane.label}</div>
          <ol className="space-y-2">
            {lane.steps.map((s, i) => (
              <li key={i}>
                <button onMouseEnter={() => setHover(lane.label + i)} onMouseLeave={() => setHover('')}
                  onFocus={() => setHover(lane.label + i)} onBlur={() => setHover('')}
                  className={`w-full text-right rounded-lg border px-3 py-2.5 transition
                    ${lane.tone === 'b' ? 'bg-white border-forest-200 hover:border-forest-400' : 'bg-stone-50 border-stone-200 hover:border-stone-300'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-md grid place-items-center text-[11px] font-bold shrink-0
                      ${lane.tone === 'b' ? 'bg-forest-700 text-white' : 'bg-stone-300 text-white'}`}>{i + 1}</span>
                    <span className="text-[13px] font-medium flex-1">{s.t}</span>
                  </div>
                  {hover === lane.label + i && <div className="text-[12px] text-ink-mute mt-1.5 pr-7 leading-relaxed anim-in">{s.d}</div>}
                </button>
                {i < lane.steps.length - 1 && <div className="flex justify-center py-0.5"><Icon name="chevronD" className="w-3.5 h-3.5 text-stone-300" /></div>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

/* --------------------------- سؤال تحقق داخل الدرس --------------------------- */
function Check({ b }: { b: Extract<Block, { k: 'check' }> }) {
  const { dispatch } = useStore();
  const [pick, setPick] = useState<number | null>(null);
  const answered = pick !== null;
  const ok = pick === b.correct;
  return (
    <div className="rounded-xl2 border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-forest-700 text-white grid place-items-center shrink-0"><Icon name="check" className="w-4 h-4" /></span>
        <span className="text-[12.5px] font-bold text-forest-800">اختبر نفسك</span>
        <div className="flex-1" /><Ref r={b.ref} />
      </div>
      <p className="text-[14.5px] font-medium leading-relaxed mb-3">{b.q}</p>
      <div className="space-y-2">
        {b.options.map((o, i) => {
          const state = !answered ? 'idle' : i === b.correct ? 'right' : i === pick ? 'wrong' : 'dim';
          return (
            <button key={i} disabled={answered}
              onClick={() => { setPick(i); if (b.concept) dispatch({ type: 'concept', concept: b.concept, correct: i === b.correct }); }}
              className={`w-full text-right px-3.5 py-2.5 rounded-lg border text-[13.5px] leading-relaxed transition flex items-start gap-2.5
                ${state === 'idle' ? 'border-stone-200 hover:border-forest-400 hover:bg-forest-50/40'
                : state === 'right' ? 'border-ok-300 bg-ok-50'
                : state === 'wrong' ? 'border-danger-300 bg-danger-50'
                : 'border-stone-200 opacity-50'}`}>
              <span className={`mt-0.5 w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold shrink-0
                ${state === 'right' ? 'bg-ok-500 text-white' : state === 'wrong' ? 'bg-danger-500 text-white' : 'bg-stone-100 text-ink-mute'}`}>
                {state === 'right' ? '✓' : state === 'wrong' ? '✕' : String.fromCharCode(1571 + i)}
              </span>
              <span className="flex-1">{o}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3 space-y-2 anim-in">
          <div className={`rounded-lg p-3 text-[13px] leading-[1.9] ${ok ? 'bg-ok-50 text-ok-500' : 'bg-danger-50 text-danger-600'}`}>
            <strong className="block mb-1">{ok ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}</strong>
            <span className="text-ink-soft">{b.why}</span>
          </div>
          {b.wrongWhy && pick !== b.correct && b.wrongWhy[pick!] && (
            <div className="rounded-lg bg-stone-50 p-3 text-[12.5px] text-ink-soft leading-relaxed">
              <strong>لماذا خيارك غير صحيح؟</strong> {b.wrongWhy[pick!]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Renderer -------------------------------- */
export function BlockView({ b }: { b: Block }) {
  switch (b.k) {
    case 'text':
      return <div className="prose-ar"><MD text={b.md} className="text-[15px] text-ink-soft" /></div>;

    case 'callout': {
      const t = TONES[b.tone];
      return (
        <div className={`relative rounded-xl2 border ${t.cls} p-4 pr-5 overflow-hidden`}>
          <span className={`absolute inset-y-0 right-0 w-1 ${t.bar}`} aria-hidden="true" />
          <div className="flex items-center gap-2 mb-2">
            <Icon name={t.icon} className="w-4 h-4 text-ink-soft shrink-0" />
            <span className="text-[12px] font-bold text-ink-soft">{b.title ?? t.label}</span>
            <div className="flex-1" /><Ref r={b.ref} />
          </div>
          <MD text={b.md} className="text-[14px] text-ink" />
        </div>
      );
    }

    case 'list':
      return (
        <div>
          {b.title && <div className="flex items-center gap-2 mb-2.5"><h4 className="text-[14.5px] font-bold">{b.title}</h4><div className="flex-1" /><Ref r={b.ref} /></div>}
          <ul className="space-y-2">
            {b.items.map((it, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className={`mt-1 shrink-0 grid place-items-center text-[11px] font-bold rounded-md w-5 h-5
                  ${b.ordered ? 'bg-forest-700 text-white' : 'bg-forest-100 text-forest-700'}`}>{b.ordered ? i + 1 : '•'}</span>
                <MD text={it} className="text-[14px] text-ink-soft flex-1" />
              </li>
            ))}
          </ul>
        </div>
      );

    case 'table':
      return (
        <div>
          {b.title && <div className="flex items-center gap-2 mb-2"><h4 className="text-[14px] font-bold">{b.title}</h4><div className="flex-1" /><Ref r={b.ref} /></div>}
          <div className="overflow-x-auto rounded-xl2 border border-stone-200 bg-white">
            <table className="w-full min-w-[520px] border-collapse">
              <thead><tr>{b.cols.map((c, i) => <th key={i} className="th">{c}</th>)}</tr></thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i} className={r[0]?.startsWith('مجموع') ? 'bg-forest-50/50 font-semibold' : 'hover:bg-stone-50'}>
                    {r.map((c, j) => (
                      <td key={j} className={`td ${c === '✔' ? 'text-ok-500 font-bold text-center' : c === '—' ? 'text-stone-300 text-center' : ''}`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.note && <p className="text-[12px] text-ink-mute mt-2">{b.note}</p>}
        </div>
      );

    case 'compare': return <Compare b={b} />;
    case 'flow': return <Flow b={b} />;
    case 'check': return <Check b={b} />;
    case 'widget':
      return (
        <div>
          {b.title && <div className="flex items-center gap-2 mb-2.5"><h4 className="text-[14.5px] font-bold">{b.title}</h4><div className="flex-1" /><Ref r={b.ref} /></div>}
          <Widget id={b.id} />
        </div>
      );
    default: return null;
  }
}
