import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Button, Select, Tag, Textarea } from '../../components/ui';
import { Icon } from '../../components/ui/Icon';
import { CATEGORIES, CAT_MAP } from '../../data/categories';
import { auditProject, coverageGaps, mselBalance, targetedItems, priorityOf } from '../../lib/compute';
import type { Project } from '../../store/types';

type Step = 'ask' | 'hint' | 'suggest';

interface Topic {
  id: string;
  q: string;
  needs?: 'item' | 'inject' | 'text';
  /** أسئلة توجيهية تُطرح أولاً — لا تعطي الحل */
  guide: (ctx: Ctx) => string[];
  /** تلميح */
  hint: (ctx: Ctx) => string;
  /** اقتراح عند الطلب */
  suggest: (ctx: Ctx) => string;
}

interface Ctx { p: Project; itemId: string; injectId: string; text: string }

const TOPICS: Topic[] = [
  {
    id: 'to-inject', q: 'ساعدني في تحويل هذا البند إلى محفز', needs: 'item',
    guide: ({ p, itemId }) => {
      const it = p.items.find((i) => i.id === itemId);
      const cat = it?.category ? CAT_MAP[it.category] : undefined;
      return [
        'ما الظرف الواقعي الذي يجعل تنفيذ هذا البند **ضروريًا لا اختياريًا**؟',
        'من الشخص أو الجهة التي ستُرسل هذا الظرف للفريق، ومن المستقبل؟',
        cat ? `ما الذي يُقاس في فئة «${cat.name}»؟ الدليل يقول: ${cat.measure}. كيف يُظهر محفزك هذا القياس؟` : 'ما الذي ستقيسينه بعد استجابة الفريق؟',
        'اسألي أخيرًا: هل يستطيع الفريق تجاوز هذا الظرف دون تنفيذ البند؟',
      ];
    },
    hint: ({ p, itemId }) => {
      const it = p.items.find((i) => i.id === itemId);
      const cat = it?.category ? CAT_MAP[it.category] : undefined;
      return cat
        ? `مثال الدليل لفئة «${cat.name}» (5.2): «${cat.injectExample}» — وهو يجبر: ${cat.injectForces}. ابني ظرفًا مشابهًا من واقع منشأتك، واجعليه محددًا بزمن دقيق ومستهدفًا هذا البند وحده.`
        : 'صنّفي البند ضمن إحدى الفئات السبع أولاً، فلكل فئة نمط محفز مختلف في جدول 5.2.';
    },
    suggest: ({ p, itemId }) => {
      const it = p.items.find((i) => i.id === itemId);
      if (!it) return 'اختاري بندًا أولاً.';
      const cat = it.category ? CAT_MAP[it.category] : undefined;
      const m = /(\d+)\s*(%|دقيقة|دقائق|ساعة)/.exec(it.desc);
      const trigger = m ? `بلوغ ${m[0]}` : 'تجاوز العتبة الواردة في البند';
      return [
        `**مسودة محفز للبند ${it.code}:**`,
        `الوقت: ${cat?.phase === 'early' ? '00:10' : cat?.phase === 'late' ? '01:15' : '00:45'} (حسب موضع الفئة الزمني في 5.5)`,
        `المُرسِل: ${cat?.id === 'external' ? 'جهة خارجية' : cat?.id === 'resources' ? 'مشرف المخزون/القسم المعني' : 'القسم المعني'} — المستقبل: ${it.owner || 'المسؤول حسب الخطة'}`,
        `النص المقترح: «${cat?.id === 'resources' ? 'مكالمة' : 'بلاغ'} من ${cat?.id === 'external' ? 'الجهة الخارجية' : 'القسم المعني'}: ${trigger}، والوضع الحالي لا يسمح بالاستمرار دون قرار. القرار مطلوب الآن.»`,
        '',
        'راجعي المسودة بنفسك: هل تصف ظرفًا لا مخرج منه إلا استخدام البند؟ إن أمكن تجاوزه بحل بديل غير موثق بالخطة، شدّدي القيد (5.1 و5.3).',
      ].join('\n');
    },
  },
  {
    id: 'check-inject', q: 'هل هذا المحفز يختبر البند فعلاً؟', needs: 'inject',
    guide: () => [
      'طبّقي اختبار 5.1: هل يمكن للفريق تجاوز هذا المحفز دون تنفيذ البند المستهدف؟',
      'هل المحفز يستهدف بندًا رئيسيًا واحدًا فقط (لا أكثر من بندين) ليسهل قياسه؟',
      'هل له صيغة نصية جاهزة تُسلَّم للمشارك، أم مجرد وصف عام؟',
      'هل هو واقعي ضمن سياق الخطر المختار، أم مُقحم تعسفيًا؟',
    ],
    hint: ({ p, injectId }) => {
      const j = p.injects.find((x) => x.id === injectId);
      if (!j) return 'اختاري محفزًا أولاً.';
      const probs: string[] = [];
      if (!j.targetItemId) probs.push('لا يرتبط ببند مستهدف — وهذا ما يميّز MSEL لاختبار الخطة (ملحق ج).');
      if (j.text.trim().length < 40) probs.push('نصه قصير/عام؛ المحفز العام لا يفرض بندًا محددًا (الخطأ الثاني في الفصل 12).');
      if (!j.time) probs.push('بلا زمن دقيق مرتبط بالجدول الزمني (5.3).');
      if (j.bypassable === 'yes') probs.push('أشرتِ بنفسك إلى إمكانية تجاوزه — يحتاج إعادة تصميم (5.1).');
      if (j.bypassable === '') probs.push('لم يخضع لفحص القاعدة الذهبية بعد.');
      return probs.length ? 'نقاط تستحق المراجعة:\n• ' + probs.join('\n• ') : 'المحفز يستوفي الفحوص الآلية. يبقى الحكم الأهم لكِ: هل الظرف واقعي ولا مخرج منه إلا البند؟';
    },
    suggest: ({ p, injectId }) => {
      const j = p.injects.find((x) => x.id === injectId);
      if (!j) return 'اختاري محفزًا أولاً.';
      const it = p.items.find((x) => x.id === j.targetItemId);
      const out: string[] = [];
      if (!j.time) out.push('أضيفي وقتًا دقيقًا (مثال 00:35) يتسق مع ترتيب الفئات في 5.5.');
      if (!j.receiver) out.push('حدّدي المستقبل صراحة — النص يُسلَّم لشخص بعينه.');
      if (j.text.trim().length < 40) out.push('وسّعي النص ليحوي: الحدث + البيانات المتاحة + القرار المطلوب (5.4).');
      if (it && !/(\d)/.test(j.text)) out.push('أضيفي رقمًا أو عتبة (نسبة إشغال، عدد حالات، مدة انقطاع) فالعتبة هي ما يجبر تفعيل البند.');
      if (j.bypassable !== 'no') out.push('أعيدي صياغة الظرف بحيث لا يوجد حل بديل موثق بالخطة يتجاوز البند.');
      return out.length ? '**تعديلات مقترحة:**\n• ' + out.join('\n• ') : 'لا تعديلات مقترحة — المحفز مطابق لخصائص 5.3.';
    },
  },
  {
    id: 'category', q: 'ما الفئة المناسبة لهذا البند؟', needs: 'item',
    guide: () => [
      'هل يصف البند لحظة الانتقال إلى حالة الطوارئ (من يُعلن، بأي معايير، خلال أي مدة)؟ ← التفعيل والإعلان.',
      'هل يصف من يقود وكيف تُفعَّل غرفة العمليات أو التفويض البديل؟ ← القيادة والتنظيم.',
      'هل الإبلاغ داخل المنشأة أم خارجها؟ ← الاتصال الداخلي / الخارجي.',
      'هل يصف طلب موارد أو دعمًا خارجيًا؟ ← إدارة الموارد. أم إجراءً ميدانيًا موثق الخطوات؟ ← الإجراءات التشغيلية.',
      'هل يضمن استمرار خدمة حرجة أو العودة للوضع الطبيعي؟ ← الاستمرارية والتعافي.',
    ],
    hint: ({ p, itemId }) => {
      const it = p.items.find((i) => i.id === itemId);
      if (!it) return 'اختاري بندًا أولاً.';
      const hits = CATEGORIES.filter((c) => keywordsFor(c.id).some((k) => it.desc.includes(k)));
      return hits.length
        ? `كلمات في نص البند تشير إلى: ${hits.map((h) => `«${h.name}»`).join('، ')}. راجعي عمود «الأسئلة التي تكشف بنود الاختبار» في جدول 3.2 للفصل بينها.`
        : 'لا كلمات دالة واضحة. اسألي: ما الذي يُقاس في هذا البند؟ ثم طابقيه بعمود «ما الذي يُقاس» في جدول 3.2.';
    },
    suggest: ({ p, itemId }) => {
      const it = p.items.find((i) => i.id === itemId);
      if (!it) return 'اختاري بندًا أولاً.';
      const hits = CATEGORIES.filter((c) => keywordsFor(c.id).some((k) => it.desc.includes(k)));
      const best = hits[0];
      return best
        ? `**الأقرب: «${best.name}»** — لأن ما يُقاس فيها هو: ${best.measure}.\nإن كان البند يصف أكثر من إجراء، فكّكيه إلى وحدتي اختبار منفصلتين (3.3 خطوة 5).`
        : 'لا اقتراح آلي كافٍ. فكّكي البند إلى جملة تصف «من يفعل ماذا، وكيف، ومتى» ثم صنّفيها.';
    },
  },
  {
    id: 'criterion', q: 'هل معيار النجاح قابل للقياس؟', needs: 'item',
    guide: () => [
      'هل يحدد المعيار **الإجراء** بدقة؟',
      'هل المدة الزمنية مأخوذة **من الخطة نفسها** لا من اجتهادك؟',
      'هل **نقطة البداية** واضحة (متى يبدأ العد)؟',
      'هل **الجهة المسؤولة** هي المذكورة في الخطة؟',
      'هل حدّدتِ **الخطوات الإلزامية** التي بدونها يكون التنفيذ «جزئيًا» لا «كاملاً»؟',
    ],
    hint: ({ p, itemId }) => {
      const c = p.criteria.find((x) => x.itemId === itemId);
      if (!c) return 'لا يوجد معيار لهذا البند بعد. استخدمي القالب الموحد في 7.2.';
      const miss = [['الإجراء', c.action], ['المدة', c.duration], ['نقطة البداية', c.startPoint], ['المسؤول', c.responsible], ['الخطوات الإلزامية', c.mandatorySteps]]
        .filter(([, v]) => !String(v).trim()).map(([k]) => k);
      return miss.length ? `عناصر ناقصة في القالب: ${miss.join('، ')}. بدونها لا يمكن التمييز بين «كامل» و«جزئي» (7.1 و7.4).`
        : 'القالب مكتمل. تحققي أن المدة والخطوات منقولة من نص الخطة لا مفترضة.';
    },
    suggest: ({ p, itemId }) => {
      const it = p.items.find((i) => i.id === itemId);
      const c = p.criteria.find((x) => x.itemId === itemId);
      if (!it) return 'اختاري بندًا أولاً.';
      const m = /خلال\s*(\d+\s*(?:دقيقة|دقائق|ساعة|ساعات))/.exec(it.desc);
      const from = /من\s+([^،.]+)/.exec(it.desc);
      return [
        '**مسودة معيار بالقالب الموحد (7.2):**',
        `${c?.action || it.desc.split(' خلال')[0]} يجب أن يتم خلال ${c?.duration || m?.[1] || '[المدة من الخطة]'} من ${c?.startPoint || from?.[1] || '[نقطة البداية]'}، بواسطة ${c?.responsible || it.owner || '[المسؤول حسب الخطة]'}، متضمنًا ${c?.mandatorySteps || '[الخطوات الإلزامية]'}.`,
        '',
        'أكملي الأقواس من نص الخطة نفسها — المعيار المستمد من اجتهاد المصمم يقيس توقعاته لا الخطة.',
      ].join('\n');
    },
  },
  {
    id: 'escalation', q: 'هل هذا التصعيد منطقي؟',
    guide: () => [
      'هل التصعيد مبرر ضمن منطق الخطر المختار، أم حدث عشوائي؟',
      'أي بند لم يُفعَّل بعد يستهدفه هذا التصعيد تحديدًا؟',
      'هل هو مُدرج مسبقًا في وثيقة الفرضية، أم سيُرتجل أثناء التنفيذ؟',
      'ما نقطة التوقف إن تجاوز الفريق قدرته على الاستيعاب؟',
    ],
    hint: ({ p }) => {
      const e = p.escalation;
      if (!e.enabled) return 'التصعيد غير مفعّل. هل توجد بنود أولوية لا يغطيها الخطر المختار؟ إن وُجدت فالتصعيد أحد خيارات 4.3.';
      const miss = Object.entries(e.checks).filter(([, v]) => !v).length;
      const probs: string[] = [];
      if (!e.targetItemIds.length) probs.push('لا بند مستهدف — تصعيد بلا هدف هو الخطأ السادس في الفصل 12.');
      if (miss) probs.push(`${miss} من معايير 8.2 الأربعة غير مستوفاة.`);
      if (!e.stopPoint.trim()) probs.push('بلا نقطة توقف واضحة (8.2).');
      if (!e.time) probs.push('بلا وقت — يُفترض أن يكون قرب الثلث الأخير (8.1).');
      return probs.length ? 'نقاط تستحق المراجعة:\n• ' + probs.join('\n• ') : 'التصعيد يستوفي معايير 8.2. تحققي أخيرًا من واقعيته ضمن منطق الخطر.';
    },
    suggest: ({ p }) => {
      const gaps = coverageGaps(p);
      const notActivated = p.items.filter((i) => !p.injects.some((j) => j.targetItemId === i.id && !j.isEscalation));
      const cand = gaps[0] ?? notActivated[0];
      if (!cand) return 'كل البنود ذات الأولوية مغطاة بمحفزات — قد لا تحتاجين تصعيدًا (8.1).';
      return [
        `**البند الأنسب للاستهداف:** ${cand.code} — ${cand.desc}`,
        'لأنه لم يُفعَّل بعد رغم أنه ضمن أهداف التمرين (8.2).',
        '',
        `**مسودة:** الساعة ${p.escalation.time || '01:15'} — تصعيد: ارتفاع واقعي في مستوى الضغط يتجاوز العتبة الواردة في البند — يهدف لإجبار تفعيل بند «${cand.desc}» الذي لم يُفعَّل بعد.`,
        '',
        '**نقطة التوقف المقترحة:** يوقف المتحكم التصعيد إذا تجاوز الضغط قدرة الفريق على المتابعة، ويُوثَّق سبب الإيقاف.',
      ].join('\n');
    },
  },
  {
    id: 'gaps', q: 'ما الفجوة في هذا السيناريو؟',
    guide: () => [
      'هل كل بند ذي أولوية عالية جدًا مشمول بمحفز؟',
      'هل كل محفز مرتبط ببند، وكل بند مستهدف له معيار قياس؟',
      'هل توزيع المحفزات زمنيًا يتبع قاعدة 5.5؟',
      'هل يتكرر اختبار البنود «السهلة» على حساب النادرة (6.1)؟',
    ],
    hint: ({ p }) => {
      const issues = auditProject(p);
      const crit = issues.filter((i) => i.level === 'critical');
      if (!issues.length) return 'لا فجوات في الفحوص الآلية. راجعي واقعية المحفزات ومنطق تسلسلها بنفسك.';
      return `التدقيق الآلي يرصد ${crit.length} مشكلة حرجة و${issues.length - crit.length} ملاحظة أخرى. أبرزها: ${issues.slice(0, 3).map((i) => i.title).join('؛ ')}.`;
    },
    suggest: ({ p }) => {
      const issues = auditProject(p);
      if (!issues.length) return 'لا اقتراحات — المشروع مطابق للفحوص الآلية.';
      return '**أولويات المعالجة:**\n' + issues.slice(0, 6).map((i, n) => `${n + 1}. ${i.title} — ${i.detail} (المصدر ${i.ref})`).join('\n');
    },
  },
];

function keywordsFor(id: string): string[] {
  return ({
    activation: ['إعلان', 'تفعيل حالة', 'بلاغ', 'التصنيف'],
    command: ['غرفة العمليات', 'القيادة', 'التفويض', 'نائب', 'قيادة الحوادث'],
    internal: ['الأقسام', 'النداء', 'داخلي', 'إبلاغ الأقسام', 'قناة'],
    external: ['الدفاع المدني', 'الإعلام', 'خارجي', 'الجهات الصحية', 'تصريح'],
    resources: ['موارد', 'دعم', 'كوادر', 'إمدادات', 'مخزون', 'المساعدة المتبادلة', 'طلب'],
    operations: ['إخلاء', 'فرز', 'عزل', 'استقبال', 'بروتوكول'],
    continuity: ['استمرارية', 'التعافي', 'الورقي', 'انقطاع', 'الخدمات الحرجة'],
  } as any)[id] ?? [];
}

export function Assistant() {
  const { project, state } = useStore();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [itemId, setItemId] = useState('');
  const [injectId, setInjectId] = useState('');
  const [step, setStep] = useState<Step>('ask');

  if (state.mode !== 'build' || !project) return null;
  const t = TOPICS.find((x) => x.id === topic);
  const ctx: Ctx = { p: project, itemId, injectId, text: '' };
  const ready = !t?.needs || (t.needs === 'item' ? !!itemId : t.needs === 'inject' ? !!injectId : true);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 w-13 h-13 rounded-2xl bg-forest-700 text-white shadow-lift grid place-items-center hover:bg-forest-800 transition no-print"
        style={{ width: 52, height: 52 }} aria-label="مساعد بناء السيناريو">
        <Icon name="spark" className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-5 no-print">
          <div className="absolute inset-0 bg-forest-950/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-full sm:w-[460px] max-h-[88vh] rounded-t-2xl sm:rounded-xl2 shadow-lift flex flex-col anim-in">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-stone-200">
              <span className="w-8 h-8 rounded-lg bg-forest-700 text-white grid place-items-center"><Icon name="spark" className="w-4 h-4" /></span>
              <div className="flex-1">
                <div className="font-bold text-[14.5px]">مساعد بناء السيناريو</div>
                <div className="text-[11.5px] text-ink-mute">يوجّهك بالأسئلة أولاً، ثم التلميح، ثم الاقتراح</div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-stone-100 text-ink-mute"><Icon name="x" /></button>
            </div>

            <div className="p-5 overflow-auto space-y-4">
              <div>
                <div className="label">بماذا أساعدك؟</div>
                <div className="space-y-1.5">
                  {TOPICS.map((x) => (
                    <button key={x.id} onClick={() => { setTopic(x.id); setStep('ask'); }}
                      className={`w-full text-right px-3 py-2.5 rounded-lg border text-[13px] transition
                        ${topic === x.id ? 'border-forest-500 bg-forest-50 font-medium' : 'border-stone-200 hover:border-forest-300'}`}>
                      {x.q}
                    </button>
                  ))}
                </div>
              </div>

              {t?.needs === 'item' && (
                <div>
                  <div className="label">اختاري البند</div>
                  <Select value={itemId} onChange={(e) => { setItemId(e.target.value); setStep('ask'); }}>
                    <option value="">— بند من جدول التفكيك —</option>
                    {project.items.map((i) => <option key={i.id} value={i.id}>{i.code} — {i.desc}</option>)}
                  </Select>
                </div>
              )}
              {t?.needs === 'inject' && (
                <div>
                  <div className="label">اختاري المحفز</div>
                  <Select value={injectId} onChange={(e) => { setInjectId(e.target.value); setStep('ask'); }}>
                    <option value="">— محفز من MSEL —</option>
                    {project.injects.map((j) => <option key={j.id} value={j.id}>{j.time || '—'} · {(j.text || 'بلا نص').slice(0, 40)}</option>)}
                  </Select>
                </div>
              )}

              {t && ready && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-forest-200 bg-forest-50/50 p-3.5">
                    <div className="flex items-center gap-2 mb-2"><Icon name="info" className="w-4 h-4 text-forest-700" />
                      <span className="text-[12px] font-bold text-forest-800">أسئلة توجيهية — أجيبي عنها أولاً</span></div>
                    <ol className="space-y-1.5">
                      {t.guide(ctx).map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed">
                          <span className="w-4.5 h-4.5 rounded bg-white text-forest-700 grid place-items-center text-[10.5px] font-bold shrink-0 mt-0.5" style={{ width: 18, height: 18 }}>{i + 1}</span>
                          <span dangerouslySetInnerHTML={{ __html: g.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                        </li>
                      ))}
                    </ol>
                  </div>

                  {step !== 'ask' && (
                    <div className="rounded-xl border border-warn-300 bg-warn-50 p-3.5 anim-in">
                      <div className="flex items-center gap-2 mb-1.5"><Icon name="flag" className="w-4 h-4 text-warn-500" />
                        <span className="text-[12px] font-bold text-warn-500">تلميح</span></div>
                      <p className="text-[13px] leading-[1.9] whitespace-pre-line">{t.hint(ctx)}</p>
                    </div>
                  )}

                  {step === 'suggest' && (
                    <div className="rounded-xl border border-stone-300 bg-stone-50 p-3.5 anim-in">
                      <div className="flex items-center gap-2 mb-1.5"><Icon name="spark" className="w-4 h-4 text-ink-soft" />
                        <span className="text-[12px] font-bold text-ink-soft">اقتراح — مسودة للمراجعة لا حل نهائي</span></div>
                      <div className="text-[13px] leading-[1.95] whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: t.suggest(ctx).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                      <p className="text-[11.5px] text-ink-mute mt-2.5 pt-2.5 border-t border-stone-200">
                        القرار النهائي لكِ: راجعي المسودة مقابل نص خطتك وواقع منشأتك قبل اعتمادها.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {step === 'ask' && <Button size="sm" icon="flag" onClick={() => setStep('hint')}>أعطني تلميحًا</Button>}
                    {step === 'hint' && <Button size="sm" variant="primary" icon="spark" onClick={() => setStep('suggest')}>أعطني اقتراحًا</Button>}
                    {step !== 'ask' && <Button size="sm" icon="refresh" onClick={() => setStep('ask')}>إعادة</Button>}
                  </div>
                </div>
              )}

              {t && !ready && <p className="text-[13px] text-ink-mute">اختاري العنصر المطلوب أعلاه ليبدأ المساعد.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
