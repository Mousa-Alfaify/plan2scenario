import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Button, Card, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { Decompose } from '../build/Decompose';
import { Matrix } from '../build/Matrix';
import { Msel } from '../build/Msel';
import { Observe } from '../build/Observe';
import { Aar } from '../build/Aar';
import { History } from '../build/History';
import { Criteria } from '../build/Criteria';

const FORMS = [
  { id: 'a', label: 'ملحق (أ): جدول تفكيك الخطة', page: 'ص 36', icon: 'grid', C: Decompose, cols: ['رقم البند بالخطة', 'الوصف المختصر للإجراء', 'الفئة', 'المسؤول حسب الخطة', 'هل اختُبر سابقًا؟'] },
  { id: 'b', label: 'ملحق (ب): مصفوفة تغطية المخاطر', page: 'ص 36', icon: 'matrix', C: Matrix, cols: ['بند الخطة المستهدف', 'الخطر 1', 'الخطر 2', 'الخطر 3', 'الخطر 4', 'مجموع البنود المُغطاة'] },
  { id: 'c', label: 'ملحق (ج): قائمة الأحداث الرئيسية MSEL', page: 'ص 36–37', icon: 'list', C: Msel, cols: ['الوقت', 'نص المحفز الكامل', 'بند الخطة المستهدف'] },
  { id: 'd', label: 'ملحق (د): نموذج مراقبة الأداء والاستخلاص', page: 'ص 37', icon: 'eye', C: Observe, cols: ['بند الخطة', 'الوقت الفعلي', 'درجة التنفيذ', 'سبب الفجوة', 'نوع التوصية'] },
  { id: 'e', label: 'ملحق (هـ): سجل التغطية التراكمي', page: 'ص 37', icon: 'history', C: History, cols: ['بند الخطة', 'آخر مرة اختُبر', 'عدد مرات الاختبار (3 سنوات)', 'الأولوية القادمة'] },
  { id: 'f', label: 'إضافي: معايير النجاح بالقالب الموحد', page: 'الفصل 7.2', icon: 'ruler', C: Criteria, cols: ['بند الخطة', 'الإجراء', 'المدة', 'نقطة البداية', 'المسؤول', 'الخطوات الإلزامية'] },
];

export function Forms({ initial }: { initial?: string }) {
  const [sel, setSel] = useState(initial ?? '');
  const cur = FORMS.find((f) => f.id === sel);

  if (cur) {
    const C = cur.C;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 no-print">
          <Button size="sm" icon="chevron" onClick={() => setSel('')}>كل النماذج</Button>
          <div className="flex-1" />
          <Button size="sm" icon="print" onClick={() => window.print()}>طباعة</Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-forest-700 text-white grid place-items-center"><Icon name={cur.icon} /></span>
          <div>
            <h1 className="text-[18px] font-bold">{cur.label}</h1>
            <p className="text-[12px] text-ink-mute">{cur.page} من الدليل — نموذج تفاعلي قابل للتعبئة والحفظ والتصدير والطباعة</p>
          </div>
        </div>
        <C />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] sm:text-[25px] font-bold">النماذج والأدوات</h1>
        <p className="text-[13.5px] text-ink-mute mt-1.5 max-w-2xl leading-relaxed">
          الملاحق الفارغة في نهاية الدليل، محوّلة إلى نماذج تفاعلية فعلية: تُضاف وتُعدَّل وتُحذف وتُحفظ وتُطبع وتُصدَّر.
          كل نموذج مرتبط بمشروعك النشط.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FORMS.map((f) => (
          <button key={f.id} onClick={() => setSel(f.id)} className="card card-pad text-right hover:border-forest-300 hover:shadow-lift transition">
            <div className="flex items-start gap-3 mb-3">
              <span className="w-10 h-10 rounded-lg bg-forest-50 text-forest-700 grid place-items-center shrink-0"><Icon name={f.icon} /></span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[13.5px] leading-snug">{f.label}</div>
                <div className="text-[11px] text-ink-mute mt-0.5">{f.page}</div>
              </div>
            </div>
            <div className="text-[11.5px] text-ink-mute mb-2">الأعمدة:</div>
            <div className="flex flex-wrap gap-1">
              {f.cols.map((c) => <span key={c} className="chip bg-stone-100 text-ink-mute text-[10.5px]">{c}</span>)}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {['إضافة', 'تعديل', 'حذف', 'حفظ', 'طباعة', 'تصدير'].map((a) => <Tag key={a} tone="green" icon="check">{a}</Tag>)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
