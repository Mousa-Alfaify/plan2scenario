import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Input, Progress, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { AUDIT, AUDIT_STATS } from '../../data/coverageAudit';
import { exportCSV } from '../build/shared';

export function ContentAudit() {
  const { go, dispatch } = useStore();
  const [q, setQ] = useState('');
  const s = AUDIT_STATS();
  const rows = AUDIT.filter((r) => !q || `${r.ch} ${r.title} ${r.where} ${r.kind}`.includes(q));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[25px] font-bold">تدقيق تغطية المحتوى</h1>
          <p className="text-[13.5px] text-ink-mute mt-1.5 max-w-2xl leading-relaxed">
            Content Coverage Matrix — ربط كل قسم من الدليل المصدر (37 صفحة) بمكانه المقابل داخل النظام ونوع التفاعل الذي حُوِّل إليه.
          </p>
        </div>
        <Button icon="download" onClick={() => exportCSV('تدقيق-تغطية-المحتوى', [
          ['رقم الفصل', 'العنوان في الدليل', 'الصفحة', 'مكانه في التطبيق', 'المسار', 'نوع التفاعل', 'حالة التغطية'],
          ...AUDIT.map((r) => [r.ch, r.title, r.page, r.where, r.route, r.kind, 'مغطّى']),
        ])}>تصدير CSV</Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card>
          <div className="text-[12.5px] text-ink-mute">أقسام الدليل المرصودة</div>
          <div className="text-[28px] font-bold leading-none mt-1">{s.total}</div>
        </Card>
        <Card>
          <div className="text-[12.5px] text-ink-mute">أقسام مغطّاة داخل النظام</div>
          <div className="text-[28px] font-bold leading-none mt-1 text-ok-500">{s.full}</div>
        </Card>
        <Card>
          <div className="text-[12.5px] text-ink-mute mb-2">نسبة التغطية</div>
          <div className="flex items-center gap-3">
            <span className="text-[28px] font-bold leading-none text-ok-500">{s.pct}%</span>
            <div className="flex-1"><Progress value={s.pct} height={8} /></div>
          </div>
        </Card>
      </div>

      <Card pad={false}>
        <div className="p-3.5 border-b border-stone-200 flex items-center gap-2 no-print">
          <div className="relative flex-1">
            <Icon name="search" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في جدول التدقيق…" className="pr-9 field-sm" />
          </div>
          <span className="text-[12px] text-ink-mute whitespace-nowrap">{rows.length} / {AUDIT.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead><tr>
              <th className="th">رقم الفصل</th><th className="th">العنوان في الدليل</th><th className="th">الصفحة</th>
              <th className="th">مكانه في التطبيق</th><th className="th">نوع التفاعل</th><th className="th">حالة التغطية</th><th className="th no-print"></th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-stone-50">
                  <td className="td font-semibold whitespace-nowrap">{r.ch}</td>
                  <td className="td">{r.title}</td>
                  <td className="td text-[12px] text-ink-mute whitespace-nowrap">{r.page}</td>
                  <td className="td text-[12.5px]">{r.where}</td>
                  <td className="td text-[12px] text-ink-mute whitespace-nowrap">{r.kind}</td>
                  <td className="td"><Tag tone="green" icon="check">مغطّى</Tag></td>
                  <td className="td no-print">
                    <button onClick={() => { dispatch({ type: 'mode', mode: r.route.startsWith('#/build') || r.route.startsWith('#/forms') ? 'build' : 'learn' }); go(r.route); }}
                      className="p-1.5 rounded-md hover:bg-stone-100 text-ink-mute" aria-label="انتقال"><Icon name="chevron" className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
