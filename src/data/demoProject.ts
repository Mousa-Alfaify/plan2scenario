import type { Project } from '../store/types';

/* ==========================================================================
   المشروع التجريبي — مبني حرفيًا على «11. مثال تطبيقي متكامل» في الدليل:
   خطة طوارئ افتراضية لمستشفى متوسط الحجم، من التفكيك حتى الاستخلاص.
   يُعرض في النظام موسومًا بوضوح كـ«مثال تدريبي».
   ========================================================================== */

const t = (s: string) => s;

export function buildDemoProject(): Project {
  const items = [
    { id: 'di1', code: '3.2.1', desc: 'إعلان الطوارئ عند بلاغين مستقلين', category: 'activation', owner: 'المدير المناوب', testedBefore: true, lastTested: '2025', testCount3y: 3, sensitivity: 3, complexity: 1 },
    { id: 'di2', code: '4.1.3', desc: 'تفعيل غرفة العمليات خلال 15 دقيقة', category: 'command', owner: 'رئيس فريق الطوارئ', testedBefore: false, lastTested: 'لم يُختبر', testCount3y: 0, sensitivity: 3, complexity: 2 },
    { id: 'di3', code: '5.3.2', desc: 'إبلاغ الدفاع المدني خلال 10 دقائق', category: 'external', owner: 'منسق الاتصال الخارجي', testedBefore: false, lastTested: '2023', testCount3y: 1, sensitivity: 2, complexity: 1 },
    { id: 'di4', code: '6.2.4', desc: 'طلب دعم كوادر عند تجاوز 80% من الطاقة', category: 'resources', owner: 'مدير العمليات', testedBefore: false, lastTested: 'لم يُختبر', testCount3y: 0, sensitivity: 3, complexity: 3 },
    { id: 'di5', code: '7.1.1', desc: 'تفعيل استمرارية الأعمال لقسم الحوسبة', category: 'continuity', owner: 'مسؤول تقنية المعلومات', testedBefore: false, lastTested: 'لم يُختبر', testCount3y: 0, sensitivity: 3, complexity: 3 },
  ].map((x) => ({ ...x, hardToTest: x.id === 'di5', notes: '', createdAt: Date.now() })) as Project['items'];

  const hazards = [
    { id: 'dh1', name: 'زلزال', geoRealism: 1, pastFrequency: 1, mgmtComplexity: 1, timeResources: 1, notes: '' },
    { id: 'dh2', name: 'تفشٍّ وبائي داخل المنشأة', geoRealism: 2, pastFrequency: 2, mgmtComplexity: 1, timeResources: 2, notes: 'المرشح الأقوى حسب مصفوفة التغطية' },
    { id: 'dh3', name: 'هجوم سيبراني', geoRealism: 1, pastFrequency: 2, mgmtComplexity: 2, timeResources: 1, notes: '' },
    { id: 'dh4', name: 'انقطاع كهرباء ممتد', geoRealism: 2, pastFrequency: 1, mgmtComplexity: 1, timeResources: 2, notes: '' },
  ] as Project['hazards'];

  // مصفوفة 4.2 مُسقطة على بنود المثال التطبيقي
  const coverage: Project['coverage'] = {
    dh1: { di1: true, di2: true, di3: true, di4: true },
    dh2: { di1: true, di2: true, di3: true, di4: true },
    dh3: { di2: true, di5: true },
    dh4: { di2: true, di5: true },
  };

  const injects: Project['injects'] = [
    {
      id: 'dj1', order: 1, time: '00:00', source: 'قسم الاستقبال + قسم الباطنة', receiver: 'المدير المناوب', channel: 'بلاغ هاتفي',
      event: 'بلاغان مستقلان عن حالتين مشتبه بهما بعدوى غير معروفة', data: 'بلاغان من قسمين مختلفين خلال أقل من 5 دقائق، لا إعلان رسمي بعد',
      decision: 'هل تنطبق معايير إعلان حالة الطوارئ الداخلية؟', targetItemId: 'di1',
      text: 'الساعة 00:00 — يُسلَّم للمدير المناوب: «بلاغ من قسم الاستقبال بحالة اشتباه بعدوى غير معروفة، وبلاغ مستقل من قسم الباطنة بحالة مشابهة قبل 4 دقائق. لا يوجد إعلان رسمي حتى الآن. القرار مطلوب.»',
      bypassable: 'no', isEscalation: false, objective: 'اختبار تطبيق معيار «بلاغين مستقلين» لإعلان الطوارئ',
      expectedAction: 'إعلان حالة الطوارئ الداخلية وفق البند 3.2.1', observerNotes: '',
    },
    {
      id: 'dj2', order: 2, time: '00:12', source: 'المختبر + مكتب القيادة', receiver: 'رئيس فريق الطوارئ',
      channel: 'تقرير مخبري + اتصال', event: 'تأكيد مخبري لعدوى شديدة العدوى، والمسؤول الأول غير متاح',
      data: 'نتيجة مخبرية مؤكدة؛ المسؤول الأول خارج الموقع ولا يرد', decision: 'من يُفعِّل غرفة العمليات الآن؟',
      targetItemId: 'di2', text: 'الساعة 00:12 — يُسلَّم لرئيس فريق الطوارئ: «تأكيد مخبري لعدوى شديدة العدوى. المسؤول الأول خارج الموقع ولا يمكن الوصول إليه. المطلوب تفعيل غرفة العمليات وفق الخطة.»',
      bypassable: 'no', isEscalation: false, objective: 'اختبار تفعيل غرفة العمليات خلال 15 دقيقة وتسلسل التفويض',
      expectedAction: 'تفعيل غرفة العمليات خلال 15 دقيقة بحضور ممثلي الأقسام الخمسة', observerNotes: '',
    },
    {
      id: 'dj3', order: 3, time: '00:25', source: 'غرفة العمليات', receiver: 'منسق الاتصال الخارجي',
      channel: 'تقرير حالة', event: 'ارتفاع الحالات المشتبه بها إلى 9 حالات', data: '9 حالات مشتبه بها مؤكدة التصنيف',
      decision: 'تنفيذ الإبلاغ الخارجي ضمن المهلة المحددة', targetItemId: 'di3',
      text: 'الساعة 00:25 — يُسلَّم لمنسق الاتصال الخارجي: «ارتفع عدد الحالات المشتبه بها إلى 9 حالات وتم تصنيف الحدث. المطلوب تنفيذ الإبلاغ الخارجي وفق البند 5.3.2.»',
      bypassable: 'no', isEscalation: false, objective: 'اختبار الإبلاغ الخارجي خلال 10 دقائق من التصنيف',
      expectedAction: 'إبلاغ الدفاع المدني خلال 10 دقائق بالقالب الرسمي', observerNotes: '',
    },
    {
      id: 'dj4', order: 4, time: '00:50', source: 'مشرف جناح العزل', receiver: 'مدير العمليات',
      channel: 'مكالمة', event: 'الطاقة الاستيعابية لجناح العزل تصل 82%', data: 'الإشغال 82%، والكوادر الحالية لا تغطي الوردية القادمة',
      decision: 'هل يُفعَّل بند طلب دعم الكوادر من منشأة مجاورة؟', targetItemId: 'di4',
      text: 'الساعة 00:50 — يُسلَّم لمدير العمليات: «مكالمة من مشرف جناح العزل: الإشغال بلغ 82% من الطاقة الاستيعابية، والكوادر المتاحة لا تكفي الوردية القادمة. القرار مطلوب الآن.»',
      bypassable: 'no', isEscalation: false, objective: 'اختبار بند طلب الدعم عند تجاوز عتبة 80%',
      expectedAction: 'تفعيل طلب دعم كوادر من منشأة مجاورة وفق البند 6.2.4', observerNotes: '',
    },
    {
      id: 'dj5', order: 5, time: '01:20', source: 'قسم تقنية المعلومات', receiver: 'مسؤول تقنية المعلومات',
      channel: 'بلاغ فني', event: '(تصعيد) انقطاع نظام الملفات الإلكترونية لساعتين', data: 'انقطاع كامل متوقع لساعتين متصلتين أثناء ذروة الحدث',
      decision: 'تفعيل خطة استمرارية الأعمال والنظام الورقي البديل', targetItemId: 'di5',
      text: 'الساعة 01:20 — تصعيد يُسلَّم لمسؤول تقنية المعلومات: «انقطاع نظام الملفات الإلكترونية، والمدة المتوقعة للإصلاح ساعتان متصلتان. المطلوب قرار بشأن استمرارية الخدمة.»',
      bypassable: 'no', isEscalation: true, objective: 'إجبار تفعيل خطة استمرارية الأعمال لقسم الحوسبة',
      expectedAction: 'تفعيل خطة الاستمرارية والتحول للنظام الورقي البديل', observerNotes: '',
    },
  ];

  const criteria: Project['criteria'] = [
    { id: 'dc1', itemId: 'di1', action: 'إعلان حالة الطوارئ الداخلية', duration: '5 دقائق', startPoint: 'ورود البلاغ المستقل الثاني', responsible: 'المدير المناوب', mandatorySteps: 'التحقق من استقلالية البلاغين وتوثيق وقت الإعلان', text: '' },
    { id: 'dc2', itemId: 'di2', action: 'تفعيل غرفة العمليات', duration: '15 دقيقة', startPoint: 'إعلان حالة الطوارئ', responsible: 'رئيس فريق الطوارئ أو من ينوب عنه', mandatorySteps: 'حضور ممثلي الأقسام الخمسة الأساسية', text: '' },
    { id: 'dc3', itemId: 'di3', action: 'إبلاغ الدفاع المدني', duration: '10 دقائق', startPoint: 'تصنيف الحدث', responsible: 'منسق الاتصال الخارجي', mandatorySteps: 'استخدام القالب الرسمي وتوثيق رقم البلاغ', text: '' },
    { id: 'dc4', itemId: 'di4', action: 'طلب دعم كوادر من منشأة مجاورة', duration: '20 دقيقة', startPoint: 'بلوغ الطاقة الاستيعابية 80%', responsible: 'مدير العمليات', mandatorySteps: 'موافقة القيادة وتحديد العدد والتخصص ووقت الوصول', text: '' },
    { id: 'dc5', itemId: 'di5', action: 'تفعيل خطة استمرارية الأعمال لقسم الحوسبة', duration: '30 دقيقة', startPoint: 'تأكيد انقطاع نظام الملفات', responsible: 'مسؤول تقنية المعلومات', mandatorySteps: 'التحول للنظام الورقي البديل وإبلاغ الأقسام المتأثرة', text: '' },
  ].map((c) => ({ ...c, text: `${c.action} يجب أن يتم خلال ${c.duration} من ${c.startPoint}، بواسطة ${c.responsible}، متضمنًا ${c.mandatorySteps}.` }));

  const observations: Project['observations'] = [
    { id: 'do1', itemId: 'di1', injectTime: '00:00', actualTime: '00:04', grade: 'full', notes: 'أُعلن خلال 4 دقائق من البلاغ الثاني' },
    { id: 'do2', itemId: 'di2', injectTime: '00:12', actualTime: '00:33', grade: 'partial', notes: 'تأخر 21 دقيقة بسبب غياب النائب المفوَّض' },
    { id: 'do3', itemId: 'di3', injectTime: '00:25', actualTime: '00:33', grade: 'full', notes: 'تم خلال 8 دقائق' },
    { id: 'do4', itemId: 'di4', injectTime: '00:50', actualTime: '—', grade: 'none', notes: 'الفريق لم يصل لنقطة اتخاذ القرار قبل انتهاء الوقت' },
    { id: 'do5', itemId: 'di5', injectTime: '01:20', actualTime: '01:35', grade: 'partial', notes: 'تحول جزئي للنظام الورقي، بتأخر 15 دقيقة' },
  ];

  const aar: Project['aar'] = [
    { id: 'da1', itemId: 'di2', grade: 'partial', gapReason: 'غموض في معيار «من يُفعِّل» عند غياب المسؤول الأول والنائب الأول معًا', gapCause: 'plan-text', recType: 'plan-edit', recText: 'تعديل البند 4.1.3 لتحديد نائب ثانٍ صراحة لتفعيل غرفة العمليات عند غياب الأول والنائب الأول معًا', owner: 'رئيس فريق الطوارئ', due: '', status: 'open', followUp: '' },
    { id: 'da2', itemId: 'di4', grade: 'none', gapReason: 'الفريق لم يكن على علم بوجود هذا البند أصلاً ولا بمعيار تفعيله', gapCause: 'knowledge', recType: 'training', recText: 'تعريف فريق العمليات ببند طلب دعم الكوادر ومعيار تفعيله (80% طاقة استيعابية)', owner: 'مدير التدريب', due: '', status: 'open', followUp: '' },
    { id: 'da3', itemId: 'di3', grade: 'full', gapReason: '', gapCause: '', recType: 'strength', recText: 'نقطة قوة تُحفظ: الإبلاغ الخارجي ضمن المعيار الزمني بدقة', owner: 'منسق الاتصال الخارجي', due: '', status: 'done', followUp: '' },
    { id: 'da4', itemId: 'di1', grade: 'full', gapReason: '', gapCause: '', recType: 'strength', recText: 'نقطة قوة تُحفظ: إعلان الطوارئ ضمن المعيار الزمني بدقة', owner: 'المدير المناوب', due: '', status: 'done', followUp: '' },
    { id: 'da5', itemId: 'di5', grade: 'partial', gapReason: 'تأخر التحول للنظام الورقي البديل', gapCause: 'training', recType: 'training', recText: 'تدريب قسم الحوسبة والأقسام المتأثرة على إجراءات النظام الورقي البديل', owner: 'مسؤول تقنية المعلومات', due: '', status: 'open', followUp: '' },
  ];

  return {
    id: 'demo-hospital', name: 'مثال تدريبي: اختبار خطة مستشفى متوسط الحجم',
    org: 'مستشفى افتراضي متوسط الحجم', planName: 'خطة الطوارئ المعتمدة (افتراضية)',
    isDemo: true, createdAt: Date.now(), updatedAt: Date.now(),
    items, hazards, coverage,
    selectedHazardId: 'dh2', strategy: 'escalation', compoundWithId: '',
    strategyNote: t('اختير «تفشٍّ وبائي داخل المنشأة» لأنه يغطي 4 من أصل 5 بنود ذات أولوية (كل شيء عدا استمرارية الحوسبة)، وأُضيف تصعيد لاحق (انقطاع نظام الملفات الإلكترونية) لتغطية البند الخامس.'),
    injects, criteria,
    escalation: {
      enabled: true, time: '01:20', targetItemIds: ['di5'],
      event: 'انقطاع نظام الملفات الإلكترونية لساعتين متصلتين أثناء ذروة الحدث',
      text: 'الساعة 01:20 — تصعيد: انقطاع نظام الملفات الإلكترونية لساعتين متصلتين، يهدف لإجبار تفعيل بند استمرارية الأعمال لقسم الحوسبة الذي لم يُفعَّل بعد.',
      stopPoint: 'يوقف المتحكم التصعيد إذا تجاوز عدد الحالات قدرة الفريق على المتابعة، ويُوثَّق سبب الإيقاف.',
      checks: { justified: true, targetsUntested: true, prePlanned: true, hasStopPoint: true, withinCapacity: true },
    },
    observations, aar,
    stages: { s1: 'done', s2: 'done', s3: 'done', s4: 'done', s5: 'done', s6: 'done', s7: 'done' },
    checklist: { c1: true, c2: true, c3: true, c4: true, c5: true, c6: true, c7: true, c8: true, c9: true, c10: true },
  };
}
