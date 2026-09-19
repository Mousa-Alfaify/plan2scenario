import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Card, Tabs, Tag } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { Widget } from '../learn/Widgets';

const LABS = [
  { id: 'simulation', label: 'المحاكاة التطبيقية', icon: 'play', chapter: 'الفصل 11', desc: 'طبّقي المنهجية كاملة على خطة مستشفى افتراضية، واتخذي القرارات بنفسك قبل مقارنتها بالمثال التعليمي.' },
  { id: 'error-clinic', label: 'عيادة الأخطاء', icon: 'alert', chapter: 'الفصل 12', desc: 'تُعرض عليك حالة تصميم واقعية وعليك تشخيص الخطأ الذي وقع فيه المصمم.' },
  { id: 'drag-classify', label: 'تصنيف البنود', icon: 'grid', chapter: 'الفصل 3.2', desc: 'اسحبي كل بند من بنود الخطة إلى فئته الصحيحة من الفئات السبع.' },
  { id: 'sequence-sort', label: 'ترتيب المحفزات', icon: 'clock', chapter: 'الفصل 5.5', desc: 'رتّبي المحفزات زمنيًا حسب قاعدة التسلسل في الدليل.' },
  { id: 'path-chooser', label: 'اختيار المسار', icon: 'swap', chapter: 'الفصل 2.4', desc: 'حالات عملية: أي مسار تصميم تختارين — التقليدي أم العكسي؟' },
  { id: 'decision-tree', label: 'شجرة قرار التغطية', icon: 'branch', chapter: 'الفصل 4.3', desc: 'ماذا لو لم يغطِّ خطر واحد كل ما تحتاجينه؟ أجيبي عن الأسئلة ليقودك النظام للخيار المناسب.' },
];

export function Labs() {
  const { state } = useStore();
  const [tab, setTab] = useState('simulation');
  const cur = LABS.find((l) => l.id === tab)!;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] sm:text-[25px] font-bold">مختبر السيناريوهات</h1>
        <p className="text-[13.5px] text-ink-mute mt-1.5 max-w-2xl leading-relaxed">
          أنشطة تطبيقية مستقلة عن الدروس، تُمارسين فيها المهارة نفسها بلا شرح — كل نشاط مرتبط بفصله في الدليل.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {LABS.map((l) => {
          const r = state.progress.labs[l.id];
          return (
            <button key={l.id} onClick={() => setTab(l.id)}
              className={`card card-pad text-right transition ${tab === l.id ? 'border-forest-400 ring-1 ring-forest-200' : 'hover:border-forest-300'}`}>
              <div className="flex items-start gap-2.5 mb-2">
                <span className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${tab === l.id ? 'bg-forest-700 text-white' : 'bg-forest-50 text-forest-700'}`}>
                  <Icon name={l.icon} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13.5px]">{l.label}</div>
                  <div className="text-[11px] text-ink-mute">{l.chapter}</div>
                </div>
                {r?.done && <Tag tone={r.best >= 70 ? 'green' : 'gold'}>{r.best}%</Tag>}
              </div>
              <p className="text-[12px] text-ink-mute leading-relaxed">{l.desc}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-200">
          <Icon name={cur.icon} className="w-5 h-5 text-forest-700" />
          <h2 className="font-bold text-[16px]">{cur.label}</h2>
          <span className="text-[11.5px] text-ink-mute bg-stone-100 rounded px-2 py-0.5">{cur.chapter}</span>
        </div>
        <div key={tab}><Widget id={tab} /></div>
      </Card>
    </div>
  );
}
