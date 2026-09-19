import React, { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';

/* ------------------------------- Button ------------------------------- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
export function Button({
  children, variant = 'secondary', size = 'md', icon, className = '', ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; icon?: string }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all select-none disabled:opacity-45 disabled:cursor-not-allowed active:scale-[.98]';
  const sizes = { sm: 'px-3 py-1.5 text-[13px]', md: 'px-4 py-2.5 text-[14px]', lg: 'px-6 py-3 text-[15px]' }[size];
  const vs: Record<BtnVariant, string> = {
    primary: 'bg-forest-700 text-white hover:bg-forest-800 shadow-sm',
    secondary: 'bg-white text-ink border border-stone-300 hover:border-forest-400 hover:bg-forest-50',
    ghost: 'text-ink-soft hover:bg-stone-100',
    danger: 'bg-white text-danger-600 border border-danger-300 hover:bg-danger-50',
    gold: 'bg-gold-500 text-white hover:bg-gold-600 shadow-sm',
  };
  return (
    <button className={`${base} ${sizes} ${vs[variant]} ${className}`} {...rest}>
      {icon && <Icon name={icon} className={size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'} />}
      {children}
    </button>
  );
}

/* -------------------------------- Card -------------------------------- */
export function Card({ children, className = '', pad = true }: { children: React.ReactNode; className?: string; pad?: boolean }) {
  return <div className={`card ${pad ? 'card-pad' : ''} ${className}`}>{children}</div>;
}

export function SectionTitle({ title, sub, icon, action }: { title: string; sub?: string; icon?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="shrink-0 w-9 h-9 rounded-lg bg-forest-50 text-forest-700 grid place-items-center"><Icon name={icon} /></span>}
        <div className="min-w-0">
          <h2 className="text-[17px] sm:text-[19px] font-bold leading-tight">{title}</h2>
          {sub && <p className="text-[13px] text-ink-mute mt-1 leading-relaxed">{sub}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 no-print">{action}</div>}
    </div>
  );
}

/* ------------------------------- Badge -------------------------------- */
const toneMap: Record<string, string> = {
  neutral: 'bg-stone-100 text-ink-soft',
  green: 'bg-ok-50 text-ok-500',
  gold: 'bg-warn-50 text-warn-500',
  red: 'bg-danger-50 text-danger-600',
  blue: 'bg-info-50 text-info-500',
  forest: 'bg-forest-50 text-forest-700',
};
export function Tag({ children, tone = 'neutral', icon }: { children: React.ReactNode; tone?: keyof typeof toneMap; icon?: string }) {
  return <span className={`chip ${toneMap[tone]}`}>{icon && <Icon name={icon} className="w-3.5 h-3.5" />}{children}</span>;
}

/* ------------------------------ Progress ------------------------------ */
export function Progress({ value, tone = 'forest', height = 8, label }: { value: number; tone?: 'forest' | 'gold' | 'red'; height?: number; label?: string }) {
  const c = { forest: 'bg-forest-600', gold: 'bg-gold-500', red: 'bg-danger-500' }[tone];
  return (
    <div>
      {label && <div className="flex justify-between text-[12px] text-ink-mute mb-1"><span>{label}</span><span className="font-semibold text-ink">{value}%</span></div>}
      <div className="w-full bg-stone-200 rounded-full overflow-hidden" style={{ height }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className={`${c} h-full rounded-full transition-[width] duration-500`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function Ring({ value, size = 92, stroke = 8, label, sub }: { value: number; size?: number; stroke?: number; label?: string; sub?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const col = value >= 75 ? '#2F7D55' : value >= 45 ? '#B4903F' : '#B4472F';
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E7E7E3" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c - (Math.max(0, Math.min(100, value)) / 100) * c} strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="absolute text-center">
        <div className="text-[20px] font-bold leading-none" style={{ color: col }}>{label ?? `${value}%`}</div>
        {sub && <div className="text-[10.5px] text-ink-mute mt-1">{sub}</div>}
      </div>
    </div>
  );
}

/* -------------------------------- Modal ------------------------------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-forest-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-white w-full ${wide ? 'sm:max-w-4xl' : 'sm:max-w-lg'} rounded-t-2xl sm:rounded-xl2 shadow-lift max-h-[92vh] flex flex-col anim-in`}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-stone-200">
          <h3 className="font-bold text-[16px]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-ink-mute" aria-label="إغلاق"><Icon name="x" /></button>
        </div>
        <div className="p-5 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------- Tabs -------------------------------- */
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; icon?: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-stone-200 -mx-1 px-1 no-print" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => onChange(t.id)}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[13.5px] font-medium border-b-2 -mb-px transition
            ${active === t.id ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-mute hover:text-ink'}`}>
          {t.icon && <Icon name={t.icon} className="w-4 h-4" />}{t.label}
          {typeof t.count === 'number' && <span className={`text-[11px] rounded-full px-1.5 py-0.5 ${active === t.id ? 'bg-forest-100 text-forest-700' : 'bg-stone-100 text-ink-mute'}`}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------- Accordion ------------------------------ */
export function Accordion({ items, single = false }: { items: { id: string; title: React.ReactNode; body: React.ReactNode; badge?: React.ReactNode }[]; single?: boolean }) {
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : single ? [id] : [...o, id]));
  return (
    <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl2 overflow-hidden bg-white">
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id}>
            <button onClick={() => toggle(it.id)} aria-expanded={isOpen}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-right hover:bg-stone-50 transition">
              <Icon name="chevronD" className={`w-4 h-4 text-ink-mute transition-transform ${isOpen ? '' : 'rotate-90'}`} />
              <span className="flex-1 font-medium text-[14.5px]">{it.title}</span>
              {it.badge}
            </button>
            {isOpen && <div className="px-4 pb-4 pt-1 anim-in">{it.body}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Tooltip ------------------------------- */
export function Tip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)} tabIndex={0} aria-describedby={id}>
      {children}
      {show && (
        <span id={id} role="tooltip"
          className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 z-40 w-max max-w-[260px] rounded-lg bg-forest-900 text-white text-[12px] leading-relaxed px-2.5 py-1.5 shadow-lift pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

export function InfoDot({ text }: { text: string }) {
  return <Tip text={text}><span className="w-4 h-4 grid place-items-center rounded-full bg-stone-200 text-ink-mute text-[10px] font-bold cursor-help">؟</span></Tip>;
}

/* ------------------------------- Fields ------------------------------- */
export function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="label flex items-center gap-1.5">
        {label}{required && <span className="text-danger-500">*</span>}
        {hint && <InfoDot text={hint} />}
      </span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field ${props.className ?? ''}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`field leading-relaxed ${props.className ?? ''}`} />;
}
export function Select({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={`field ${p.className ?? ''}`}>{children}</select>;
}
export function Checkbox({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <span className={`mt-0.5 w-[18px] h-[18px] shrink-0 rounded border grid place-items-center transition
        ${checked ? 'bg-forest-600 border-forest-600 text-white' : 'bg-white border-stone-300 group-hover:border-forest-400'}`}>
        {checked && <Icon name="check" className="w-3 h-3" strokeWidth={3} />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-[13.5px] leading-relaxed">{label}{hint && <span className="block text-[12px] text-ink-mute">{hint}</span>}</span>
    </label>
  );
}

/* -------------------------------- Empty ------------------------------- */
export function Empty({ icon = 'file', title, body, action }: { icon?: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-400 grid place-items-center mx-auto mb-3"><Icon name={icon} className="w-6 h-6" /></div>
      <p className="font-semibold text-[15px]">{title}</p>
      {body && <p className="text-[13px] text-ink-mute mt-1.5 max-w-md mx-auto leading-relaxed">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ------------------------------- Toast -------------------------------- */
let toastFn: ((m: string, tone?: 'ok' | 'warn' | 'err') => void) | null = null;
export const toast = (m: string, tone: 'ok' | 'warn' | 'err' = 'ok') => toastFn?.(m, tone);

export function Toaster() {
  const [items, setItems] = useState<{ id: number; m: string; tone: string }[]>([]);
  useEffect(() => {
    toastFn = (m, tone = 'ok') => {
      const id = Date.now() + Math.random();
      setItems((x) => [...x, { id, m, tone }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3200);
    };
    return () => { toastFn = null; };
  }, []);
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[60] flex flex-col gap-2 no-print pointer-events-none" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`anim-in rounded-lg px-4 py-2.5 text-[13px] shadow-lift text-white
          ${t.tone === 'err' ? 'bg-danger-600' : t.tone === 'warn' ? 'bg-gold-600' : 'bg-forest-700'}`}>{t.m}</div>
      ))}
    </div>
  );
}

/* ----------------------------- Confirm -------------------------------- */
export function useConfirm() {
  const [st, setSt] = useState<{ open: boolean; msg: string; cb?: () => void }>({ open: false, msg: '' });
  const ask = (msg: string, cb: () => void) => setSt({ open: true, msg, cb });
  const node = (
    <Modal open={st.open} onClose={() => setSt({ open: false, msg: '' })} title="تأكيد">
      <p className="text-[14px] leading-relaxed mb-5">{st.msg}</p>
      <div className="flex gap-2 justify-end">
        <Button onClick={() => setSt({ open: false, msg: '' })}>إلغاء</Button>
        <Button variant="danger" onClick={() => { st.cb?.(); setSt({ open: false, msg: '' }); }}>تأكيد</Button>
      </div>
    </Modal>
  );
  return { ask, node };
}

/* ------------------------------- Markdown ----------------------------- */
/** نص مبسّط: **عريض** + <span class="lat"> + أسطر */
export function MD({ text, className = '' }: { text: string; className?: string }) {
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/&lt;span class="lat"&gt;(.*?)&lt;\/span&gt;/g, '<span class="lat">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return <div className={`leading-[2] ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}


/* ------------------- صياغة العدد بالعربية ------------------- */
export function arCount(n: number, one: string, two: string, few: string, many: string) {
  if (n === 0) return `لا ${many}`;
  if (n === 1) return one;
  if (n === 2) return two;
  if (n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}
