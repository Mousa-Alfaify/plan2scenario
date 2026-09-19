import React from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Empty, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { PRIORITY_LABEL } from '../../data/categories';
import { priorityOf } from '../../lib/compute';
import type { PlanItem, Project } from '../../store/types';

export function DemoBanner() {
  const { project, dispatch } = useStore();
  if (!project?.isDemo) return null;
  return (
    <div className="rounded-xl2 border border-gold-300 bg-gold-300/10 p-3.5 flex flex-wrap items-center gap-3 no-print">
      <Icon name="info" className="w-5 h-5 text-gold-600 shrink-0" />
      <div className="flex-1 min-w-[220px]">
        <div className="font-bold text-[13.5px]">مثال تدريبي — للقراءة والاستكشاف</div>
        <p className="text-[12.5px] text-ink-soft mt-0.5 leading-relaxed">
          هذا المشروع مبني على المثال التطبيقي في الفصل 11 من الدليل. أي تعديل سيُنشئ نسخة قابلة للتعديل تلقائيًا.
        </p>
      </div>
      <Button size="sm" icon="copy" onClick={() => dispatch({ type: 'editOrFork', id: project.id, fn: () => {} })}>
        إنشاء نسخة قابلة للتعديل
      </Button>
    </div>
  );
}

export function NoProject() {
  const { go } = useStore();
  return (
    <Card>
      <Empty icon="file" title="لا يوجد مشروع نشط"
        body="أنشئي مشروع اختبار خطة أو اختاري مشروعًا موجودًا للبدء."
        action={<Button variant="primary" icon="plus" onClick={() => go('#/projects')}>إدارة المشاريع</Button>} />
    </Card>
  );
}

export function NeedItems({ what }: { what: string }) {
  const { go } = useStore();
  return (
    <Card>
      <Empty icon="grid" title="جدول التفكيك فارغ"
        body={`${what} يعتمد على بنود الخطة. ابدئي من مختبر تفكيك الخطة (الفصل 3) لإدخال البنود أولاً.`}
        action={<Button variant="primary" icon="grid" onClick={() => go('#/build/decompose')}>فتح مختبر التفكيك</Button>} />
    </Card>
  );
}

export function PriorityTag({ item }: { item: PlanItem }) {
  const p = priorityOf(item);
  const tone = p === 'very-high' ? 'red' : p === 'high' ? 'gold' : p === 'medium' ? 'blue' : 'neutral';
  return <Tag tone={tone as any}>{PRIORITY_LABEL[p]}</Tag>;
}

export function itemLabel(p: Project | undefined, id: string) {
  const it = p?.items.find((x) => x.id === id);
  return it ? `${it.code} — ${it.desc}` : '—';
}

export function exportCSV(filename: string, rows: string[][]) {
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function exportJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.json') ? filename : filename + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function ToolHeader({ title, sub, chapter, actions }: { title: string; sub: string; chapter: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11.5px] text-ink-mute bg-stone-100 rounded px-2 py-0.5">{chapter}</span>
        </div>
        <h1 className="text-[20px] sm:text-[23px] font-bold leading-tight">{title}</h1>
        <p className="text-[13.5px] text-ink-mute mt-1.5 max-w-2xl leading-relaxed">{sub}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2 no-print">{actions}</div>}
    </div>
  );
}
