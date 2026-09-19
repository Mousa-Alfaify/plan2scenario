import type { Project, PlanItem, Priority, Hazard } from '../store/types';
import { CATEGORIES, CAT_MAP, STAGES, CHECKLIST } from '../data/categories';

export const uid = (p = 'x') => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

/* ---------------- الأولوية — الفصل 6.3 ----------------
   معادلة مبسطة تجمع: طول المدة منذ آخر اختبار + حساسية البند + تعقيده.
   ------------------------------------------------------ */
export function priorityScore(it: PlanItem): number {
  const year = new Date().getFullYear();
  let recency: number;
  const parsed = parseInt(it.lastTested, 10);
  if (!it.testedBefore || !parsed || isNaN(parsed)) recency = 6;           // لم يُختبر مطلقًا
  else recency = Math.min(6, Math.max(0, year - parsed));
  const freq = it.testCount3y >= 3 ? -2 : it.testCount3y === 2 ? -1 : it.testCount3y === 1 ? 0 : 1;
  return recency * 2 + it.sensitivity * 2 + it.complexity + freq;
}

export function priorityOf(it: PlanItem): Priority {
  const s = priorityScore(it);
  if (!it.testedBefore && it.sensitivity >= 3) return 'very-high';
  if (s >= 16) return 'very-high';
  if (s >= 12) return 'high';
  if (s >= 8) return 'medium';
  return 'low';
}

export const isPriorityItem = (it: PlanItem) => ['very-high', 'high'].includes(priorityOf(it));

/* ---------------- مصفوفة التغطية — الفصل 4 ---------------- */
export interface HazardScore {
  hazard: Hazard;
  covered: string[];
  total: number;
  pct: number;
  priorityCovered: number;
  untestedCovered: number;
  weight: number;
  reasons: string[];
}

export function hazardScores(p: Project): HazardScore[] {
  const targets = p.items;
  const pr = targets.filter(isPriorityItem);
  const untested = targets.filter((i) => !i.testedBefore);
  return p.hazards.map((h) => {
    const map = p.coverage[h.id] || {};
    const covered = targets.filter((i) => map[i.id]).map((i) => i.id);
    const priorityCovered = pr.filter((i) => map[i.id]).length;
    const untestedCovered = untested.filter((i) => map[i.id]).length;
    const weight = h.geoRealism + h.pastFrequency + h.mgmtComplexity + h.timeResources;
    const reasons: string[] = [];
    if (h.geoRealism >= 2) reasons.push('واقعية جغرافية وموسمية عالية للمنشأة');
    if (h.pastFrequency >= 2) reasons.push('قليل التكرار في تمارين السنوات الماضية');
    if (h.mgmtComplexity >= 2) reasons.push('مستوى تعقيد إدارته يناسب نضج الفريق');
    if (h.timeResources >= 2) reasons.push('الوقت والموارد متاحة لتنفيذه بالمستوى المطلوب');
    return {
      hazard: h, covered, total: covered.length,
      pct: targets.length ? Math.round((covered.length / targets.length) * 100) : 0,
      priorityCovered, untestedCovered, weight, reasons,
    };
  });
}

/** ترتيب المرشحين: التغطية أولاً، ثم البنود ذات الأولوية، ثم غير المختبرة، ثم عوامل الترجيح (4.4) */
export function rankHazards(p: Project): HazardScore[] {
  return hazardScores(p).sort((a, b) =>
    b.total - a.total || b.priorityCovered - a.priorityCovered ||
    b.untestedCovered - a.untestedCovered || b.weight - a.weight);
}

export function coverageGaps(p: Project): PlanItem[] {
  const sel = p.selectedHazardId;
  if (!sel) return [];
  const map = p.coverage[sel] || {};
  const extra = p.strategy === 'compound' && p.compoundWithId ? p.coverage[p.compoundWithId] || {} : {};
  return p.items.filter(isPriorityItem).filter((i) => !map[i.id] && !extra[i.id]);
}

/* ---------------- توزيع الفئات ---------------- */
export function categoryDistribution(p: Project) {
  return CATEGORIES.map((c) => ({ cat: c, count: p.items.filter((i) => i.category === c.id).length }));
}

/* ---------------- توازن الـ MSEL زمنيًا — 5.5 ---------------- */
export function minutes(t: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec((t || '').trim());
  if (!m) return NaN;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
export function fmtMinutes(v: number): string {
  const h = Math.floor(v / 60), m = v % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface SequenceIssue { injectId: string; msg: string }

export function mselBalance(p: Project) {
  const withTime = p.injects.filter((i) => !isNaN(minutes(i.time)));
  if (!withTime.length) return { issues: [] as SequenceIssue[], span: 0, phases: { early: 0, mid: 0, late: 0 } };
  const times = withTime.map((i) => minutes(i.time));
  const min = Math.min(...times), max = Math.max(...times);
  const span = Math.max(1, max - min);
  const phases = { early: 0, mid: 0, late: 0 };
  const issues: SequenceIssue[] = [];
  for (const inj of withTime) {
    const item = p.items.find((i) => i.id === inj.targetItemId);
    const rel = (minutes(inj.time) - min) / span;
    // عتبات معايرة على المثال التطبيقي في الفصل 11 (00:00 ← 01:20) بحيث يظهر متوازنًا
    const third: 'early' | 'mid' | 'late' = rel < 0.25 ? 'early' : rel < 0.72 ? 'mid' : 'late';
    phases[third]++;
    if (!item || !item.category) continue;
    const want = CAT_MAP[item.category]?.phase;
    if (want && want !== third) {
      const names = { early: 'الثلث الأول', mid: 'الثلث الأوسط', late: 'الثلث الأخير' };
      issues.push({ injectId: inj.id, msg: `محفز فئة «${CAT_MAP[item.category].name}» يُفضّل وضعه في ${names[want]} حسب 5.5، وهو حاليًا في ${names[third]}.` });
    }
  }
  return { issues, span, phases };
}

/* ---------------- Scenario Readiness Score ---------------- */
export interface ReadinessPart { key: string; label: string; score: number; max: number; why: string }

export function readiness(p: Project) {
  const parts: ReadinessPart[] = [];
  const items = p.items;
  const pr = items.filter(isPriorityItem);

  // 1) اكتمال تفكيك الخطة (3.5: 25–45 بندًا، وأقل من 15 مؤشر نقص)
  const n = items.length;
  const dScore = n >= 25 ? 15 : n >= 15 ? 10 : n >= 5 ? 5 : n > 0 ? 2 : 0;
  parts.push({ key: 'decompose', label: 'اكتمال تفكيك الخطة', score: dScore, max: 15,
    why: n === 0 ? 'لم تُدخل أي بنود بعد.' : n < 15 ? `${nItems(n)} فقط — الدليل (3.5) يتوقع 25–45 بندًا، وأقل من 15 مؤشر تفكيك ناقص.` : n < 25 ? `${nItems(n)} — مقبول، والمدى المتوقع 25–45.` : `${nItems(n)} ضمن المدى المتوقع.` });

  // 2) تصنيف كل البنود ضمن الفئات السبع
  const uncat = items.filter((i) => !i.category).length;
  parts.push({ key: 'category', label: 'تصنيف البنود ضمن الفئات السبع', score: n ? Math.round(((n - uncat) / n) * 10) : 0, max: 10,
    why: uncat ? `${nItems(uncat)} بلا فئة.` : 'كل البنود مصنّفة.' });

  // 3) تحديد البنود ذات الأولوية
  parts.push({ key: 'priority', label: 'تحديد البنود ذات الأولوية', score: pr.length ? 10 : 0, max: 10,
    why: pr.length ? `${nItems(pr.length)} بأولوية عالية أو عالية جدًا.` : 'لا توجد بنود ذات أولوية محددة — أكملي بيانات آخر اختبار والحساسية.' });

  // 4) اكتمال مصفوفة التغطية واختيار الخطر
  const hz = p.hazards.length;
  const chosen = !!p.selectedHazardId;
  const cScore = (hz >= 2 ? 7 : hz === 1 ? 3 : 0) + (chosen ? 8 : 0);
  parts.push({ key: 'matrix', label: 'مصفوفة التغطية واختيار الخطر', score: cScore, max: 15,
    why: !hz ? 'لم تُضف مخاطر مرشحة.' : !chosen ? `${hz} مخاطر مرشحة، ولم يُختر الخطر بعد.` : `الخطر مختار من بين ${hz} مرشحين.` });

  // 5) وجود محفز لكل بند مستهدف
  const targeted = targetedItems(p);
  const withInject = targeted.filter((i) => p.injects.some((j) => j.targetItemId === i.id)).length;
  parts.push({ key: 'injects', label: 'محفز لكل بند مستهدف', score: targeted.length ? Math.round((withInject / targeted.length) * 20) : 0, max: 20,
    why: !targeted.length ? 'لا بنود مستهدفة بعد (اختاري الخطر أولاً).' : `${withInject} من ${targeted.length} بندًا مستهدفًا له محفز.` });

  // 6) وجود معيار قياس لكل بند مستهدف
  const withCrit = targeted.filter((i) => p.criteria.some((c) => c.itemId === i.id && c.text.trim())).length;
  parts.push({ key: 'criteria', label: 'معيار نجاح لكل بند مستهدف', score: targeted.length ? Math.round((withCrit / targeted.length) * 15) : 0, max: 15,
    why: !targeted.length ? 'لا بنود مستهدفة بعد.' : `${withCrit} من ${targeted.length} بندًا له معيار نجاح بالقالب الموحد.` });

  // 7) نقطة تصعيد عند الحاجة
  const needsEsc = coverageGaps(p).length > 0 || p.strategy === 'escalation';
  const escOk = p.escalation.enabled && Object.values(p.escalation.checks).every(Boolean) && !!p.escalation.text.trim();
  parts.push({ key: 'escalation', label: 'نقطة التصعيد', score: needsEsc ? (escOk ? 8 : p.escalation.enabled ? 4 : 0) : 8, max: 8,
    why: !needsEsc ? 'لا حاجة لتصعيد: الخطر المختار يغطي البنود ذات الأولوية.' : escOk ? 'التصعيد مكتمل ومستوفٍ لمعايير 8.2.' : p.escalation.enabled ? 'التصعيد موجود لكن لم تكتمل معايير 8.2 أو نصه.' : 'هناك بنود أولوية غير مغطاة ولا توجد نقطة تصعيد.' });

  // 8) نموذج مراقبة جاهز
  const withObs = targeted.filter((i) => p.observations.some((o) => o.itemId === i.id)).length;
  parts.push({ key: 'observe', label: 'نموذج مراقبة لكل بند مستهدف', score: targeted.length ? Math.round((withObs / targeted.length) * 10) : 0, max: 10,
    why: !targeted.length ? 'لا بنود مستهدفة بعد.' : `${withObs} من ${targeted.length} بندًا له صف مراقبة جاهز.` });

  // 9) خطة استخلاص
  const graded = p.observations.filter((o) => o.grade);
  const aarLinked = p.aar.filter((a) => a.itemId && a.recType).length;
  parts.push({ key: 'aar', label: 'خطة الاستخلاص والتحسين', score: !graded.length ? 0 : aarLinked >= graded.length ? 7 : Math.round((aarLinked / graded.length) * 7), max: 7,
    why: !graded.length ? 'لم تُسجَّل نتائج مراقبة بعد (تُملأ أثناء/بعد التنفيذ).' : `${aarLinked} مدخل استخلاص مقابل ${graded.length} ملاحظة مقيَّمة.` });

  const score = parts.reduce((a, b) => a + b.score, 0);
  const max = parts.reduce((a, b) => a + b.max, 0);
  return { score, max, pct: Math.round((score / max) * 100), parts, gaps: parts.filter((x) => x.score < x.max) };
}

/** البنود المستهدفة = البنود التي يغطيها الخطر المختار (+ المركّب) أو التي لها محفز */
export function targetedItems(p: Project) {
  const sel = p.coverage[p.selectedHazardId] || {};
  const extra = p.strategy === 'compound' && p.compoundWithId ? p.coverage[p.compoundWithId] || {} : {};
  const byInject = new Set(p.injects.map((i) => i.targetItemId));
  const out = p.items.filter((i) => sel[i.id] || extra[i.id] || byInject.has(i.id));
  return out.length ? out : (p.selectedHazardId ? [] : p.items.filter(isPriorityItem));
}

/* ---------------- مدقق المشروع ---------------- */
export type IssueLevel = 'critical' | 'warning' | 'rec';
export interface AuditIssue { level: IssueLevel; code: string; title: string; detail: string; route?: string; ref: string }

export function auditProject(p: Project): AuditIssue[] {
  const out: AuditIssue[] = [];
  const targeted = targetedItems(p);
  const push = (level: IssueLevel, code: string, title: string, detail: string, ref: string, route?: string) =>
    out.push({ level, code, title, detail, ref, route });

  if (!p.items.length) push('critical', 'no-items', 'لا توجد بنود في جدول التفكيك', 'ابدئي بتفكيك الخطة إلى وحدات قابلة للاختبار قبل أي خطوة أخرى.', '3.1', '#/build/decompose');
  else if (p.items.length < 15) push('warning', 'few-items', 'عدد البنود أقل من 15', `لديك ${nItems(p.items.length)}. الدليل (3.5) يتوقع 25–45 بندًا لخطة متوسطة، وأقل من 15 مؤشر على تفكيك ناقص.`, '3.5', '#/build/decompose');

  const uncat = p.items.filter((i) => !i.category);
  if (uncat.length) push('warning', 'uncategorized', 'بنود بلا فئة', `${nItems(uncat.length)} خارج الفئات السبع، ما يمنع فحص التوازن الزمني للمحفزات.`, '3.2', '#/build/decompose');

  if (!p.hazards.length) push('critical', 'no-hazards', 'لا توجد مخاطر مرشحة', 'مصفوفة التغطية تحتاج مخاطر مرشحة من الـ HVA في الأعمدة.', '4.2', '#/build/matrix');
  if (p.hazards.length && !p.selectedHazardId) push('critical', 'no-hazard-selected', 'لم يُختر الخطر بعد', 'الاختيار يجب أن يستند إلى مصفوفة تغطية فعلية لا إلى الحدس.', '4.2 + 13.1', '#/build/matrix');

  // بند أولوية عالية جدًا غير مغطى
  const veryHigh = p.items.filter((i) => priorityOf(i) === 'very-high');
  const targetedIds = new Set(targeted.map((i) => i.id));
  const ignoredVH = veryHigh.filter((i) => !targetedIds.has(i.id));
  if (veryHigh.length && ignoredVH.length === veryHigh.length)
    push('critical', 'no-vh', 'لا يستهدف التمرين أي بند بأولوية «عالية جدًا»', 'قاعدة 6.2 الثابتة: كل تمرين يجب أن يستهدف بندًا واحدًا على الأقل بأولوية عالية جدًا.', '6.2', '#/build/matrix');
  else ignoredVH.forEach((i) => push('warning', 'vh-ignored', `بند أولوية عالية جدًا خارج التغطية: ${i.code}`, `«${i.desc}» بأولوية عالية جدًا ولم يشمله الخطر المختار ولا أي محفز.`, '6.2', '#/build/matrix'));

  // بند مستهدف بلا محفز
  targeted.forEach((i) => {
    if (!p.injects.some((j) => j.targetItemId === i.id))
      push('critical', 'item-no-inject', `بند مستهدف بلا محفز: ${i.code}`, `«${i.desc}» ضمن تغطية الخطر المختار لكن لا يوجد محفز يفرض تنفيذه.`, '5.1', '#/build/injects');
  });

  // محفز بلا بند / محفز عام / محفز يمكن تجاوزه
  p.injects.forEach((j) => {
    const label = j.time ? `المحفز ${j.time}` : 'محفز بلا وقت';
    if (!j.targetItemId) push('critical', 'inject-no-item', `${label} بلا بند مستهدف`, 'كل محفز في MSEL لاختبار الخطة يجب أن يرتبط ببند محدد (ملحق ج).', 'ملحق ج', '#/build/msel');
    if (j.bypassable === 'yes') push('critical', 'inject-bypassable', `${label} يمكن تجاوزه`, 'أجبتِ بـ«نعم» على سؤال الفحص: الفريق يستطيع تجاوز المحفز دون تنفيذ البند — يحتاج إعادة تصميم (5.1).', '5.1', '#/build/injects');
    if (j.bypassable === '') push('warning', 'inject-unchecked', `${label} لم يخضع لفحص القاعدة الذهبية`, 'طبّقي سؤال 5.1: هل يمكن للفريق تجاوز هذا المحفز دون تنفيذ البند المستهدف؟', '5.1', '#/build/injects');
    if (!j.text.trim()) push('warning', 'inject-no-text', `${label} بلا نص جاهز`, 'خصائص المحفز الجيد (5.3): له صيغة نصية جاهزة تُقدَّم للمشاركين، لا وصف عام فقط.', '5.3', '#/build/injects');
    else if (j.text.trim().length < 40) push('warning', 'inject-generic', `${label} نصه عام/قصير`, 'محفز عام لا يفرض بندًا محددًا هو الخطأ الثاني في الفصل 12.', '12', '#/build/injects');
    if (!j.time) push('warning', 'inject-no-time', 'محفز بلا وقت', 'خصائص المحفز الجيد (5.3): محدد بزمن دقيق مرتبط بالجدول الزمني العام.', '5.3', '#/build/msel');
  });

  // توازن MSEL
  const bal = mselBalance(p);
  bal.issues.forEach((is) => {
    const j = p.injects.find((x) => x.id === is.injectId);
    push('warning', 'msel-balance', `تسلسل زمني غير متوازن${j ? ` (${j.time})` : ''}`, is.msg, '5.5', '#/build/msel');
  });

  // بند مستهدف بلا معيار نجاح
  targeted.forEach((i) => {
    const c = p.criteria.find((x) => x.itemId === i.id && x.text.trim());
    if (!c) push('critical', 'no-criterion', `بند بلا معيار نجاح: ${i.code}`, `«${i.desc}» مستهدف لكن لا يوجد له معيار قابل للقياس بالقالب الموحد.`, '7.2', '#/build/criteria');
  });

  // تصعيد
  const gaps = coverageGaps(p);
  if (gaps.length && !p.escalation.enabled)
    push('critical', 'gap-no-escalation', 'بنود أولوية غير مغطاة وبلا تصعيد', `${nItems(gaps.length)} بأولوية عالية لا يغطيها الخطر المختار، ولم تُضف نقطة تصعيد ولا خطر مركّب ولا توثيق تغطية جزئية.`, '4.3 + 8.1', '#/build/escalation');
  if (p.escalation.enabled) {
    if (!p.escalation.targetItemIds.length) push('critical', 'esc-no-target', 'تصعيد بلا هدف', 'تصعيد غير مرتبط بأي بند لم يُختبر هو الخطأ السادس في الفصل 12 — يصبح إثارة بلا هدف.', '8.2 + 12', '#/build/escalation');
    const failed = Object.entries(p.escalation.checks).filter(([, v]) => !v);
    if (failed.length) push('warning', 'esc-checks', 'معايير التصعيد غير مكتملة', `${failed.length} من معايير التصعيد السليم الأربعة لم تُستوفَ بعد.`, '8.2', '#/build/escalation');
    if (!p.escalation.stopPoint.trim()) push('warning', 'esc-no-stop', 'تصعيد بلا نقطة توقف', 'المعيار الرابع في 8.2: له نقطة توقف واضحة إن تجاوز الفريق قدرته الفعلية على الاستيعاب.', '8.2', '#/build/escalation');
  }

  // تكرار اختبار البنود السهلة
  const easyRepeat = targeted.filter((i) => i.testCount3y >= 3);
  if (easyRepeat.length >= 2)
    push('warning', 'easy-repeat', 'تكرار اختبار بنود اختُبرت كثيرًا', `${nItems(easyRepeat.length)} ضمن البنود المستهدفة اختُبرت 3 مرات أو أكثر خلال 3 سنوات، بينما قد تبقى بنود أخرى دون اختبار — مشكلة «البنود المفضلة» (6.1).`, '6.1', '#/build/history');

  // الاستخلاص
  p.aar.forEach((a, idx) => {
    const label = `التوصية ${idx + 1}`;
    if (!a.itemId) push('critical', 'rec-no-item', `${label} غير مرتبطة ببند`, 'الخطأ الخامس في الفصل 12: استخلاص لا يربط الملاحظة ببند محدد يُنتج توصيات عامة.', '9.2 + 12', '#/build/aar');
    if (a.recType && a.recType !== 'no-action' && a.recType !== 'strength') {
      if (!a.owner.trim()) push('warning', 'rec-no-owner', `${label} بلا مسؤول`, 'نص 9.3: حدّدي مسؤولاً لكل توصية — لا تُترك عامة بلا مالك.', '9.3', '#/build/aar');
      if (!a.due.trim()) push('warning', 'rec-no-due', `${label} بلا مهلة زمنية`, 'نص 9.3: حدّدي مهلة زمنية لكل توصية.', '9.3', '#/build/aar');
    }
    if (!a.recType) push('warning', 'rec-no-type', `${label} بلا تصنيف`, 'عمود «نوع التوصية» هو المخرج الأهم لأي جهة اعتماد (9.2).', '9.2', '#/build/aar');
  });

  // بنود يصعب اختبارها
  p.items.filter((i) => i.hardToTest && targetedIds.has(i.id)).forEach((i) =>
    push('rec', 'hard-to-test', `توثيق جزئية الاختبار: ${i.code}`, `«${i.desc}» موسوم بأنه يصعب اختباره بالكامل. وثّقي في الاستخلاص أن الاختبار جزئي لا كامل (6.4).`, '6.4', '#/build/aar'));

  // توصيات تحسين عامة
  if (p.items.length && p.items.length < 25 && p.items.length >= 15)
    push('rec', 'more-items', 'يمكن توسيع جدول التفكيك', `${nItems(p.items.length)} ضمن الحد الأدنى؛ المدى المتوقع لخطة متوسطة 25–45 بندًا (3.5).`, '3.5', '#/build/decompose');
  if (p.hazards.length === 1)
    push('rec', 'one-hazard', 'أضيفي مخاطر مرشحة أخرى للمقارنة', 'مصفوفة التغطية تُقارن عدة مخاطر؛ بخطر واحد لا يوجد اختيار رياضي فعلي (4.2).', '4.2', '#/build/matrix');
  if (!p.injects.some((j) => j.isEscalation) && p.escalation.enabled)
    push('rec', 'esc-in-msel', 'أدرجي محفز التصعيد ضمن MSEL', 'المعيار الثالث في 8.2: التصعيد مُدرج في وثيقة الفرضية مسبقًا لا يُترك للارتجال.', '8.2', '#/build/msel');

  const rank = { critical: 0, warning: 1, rec: 2 };
  return out.sort((a, b) => rank[a.level] - rank[b.level]);
}

/* ---------------- المراحل السبع ---------------- */
export function autoStages(p: Project): Record<string, 'todo' | 'doing' | 'done'> {
  const targeted = targetedItems(p);
  const st = (cond: boolean, partial: boolean) => (cond ? 'done' : partial ? 'doing' : 'todo') as 'todo' | 'doing' | 'done';
  const withInject = targeted.filter((i) => p.injects.some((j) => j.targetItemId === i.id)).length;
  const withCrit = targeted.filter((i) => p.criteria.some((c) => c.itemId === i.id && c.text.trim())).length;
  const graded = p.observations.filter((o) => o.grade).length;
  const needsEsc = coverageGaps(p).length > 0;
  return {
    s1: st(p.items.length >= 15, p.items.length > 0),
    s2: st(p.items.some((i) => i.testCount3y > 0 || i.lastTested) && p.items.length > 0, p.items.length > 0),
    s3: st(!!p.selectedHazardId && p.hazards.length >= 2, p.hazards.length > 0),
    s4: st(targeted.length > 0 && withInject === targeted.length, p.injects.length > 0),
    s5: st(!needsEsc || (p.escalation.enabled && !!p.escalation.text.trim()), p.escalation.enabled),
    s6: st(targeted.length > 0 && withCrit === targeted.length, p.criteria.length > 0),
    s7: st(graded > 0 && p.aar.length > 0, graded > 0 || p.aar.length > 0),
  };
}

export function checklistAuto(p: Project): Record<string, boolean> {
  const targeted = targetedItems(p);
  const gr = autoStages(p);
  return {
    c1: p.items.length >= 15 && p.items.every((i) => i.category),
    c2: p.items.length > 0 && p.items.some((i) => priorityOf(i) === 'very-high' || priorityOf(i) === 'high'),
    c3: !!p.selectedHazardId && p.hazards.length >= 2,
    c4: targeted.length > 0 && targeted.every((i) => p.injects.some((j) => j.targetItemId === i.id && j.bypassable === 'no')),
    c5: coverageGaps(p).length === 0 || (p.escalation.enabled && !!p.escalation.text.trim() && p.escalation.targetItemIds.length > 0),
    c6: targeted.length > 0 && targeted.every((i) => p.criteria.some((c) => c.itemId === i.id && c.text.trim())),
    c7: targeted.length > 0 && targeted.every((i) => p.observations.some((o) => o.itemId === i.id)),
    c8: p.aar.length > 0 && p.aar.every((a) => !!a.itemId),
    c9: p.aar.length > 0 && p.aar.every((a) => !!a.recType && (['no-action', 'strength'].includes(a.recType) || (!!a.owner.trim() && !!a.due.trim()))),
    c10: false, // يوثّقه المستخدم يدويًا: حالة تنفيذ توصيات التمرين السابق
  };
}

export function readyToRun(p: Project) {
  const auto = checklistAuto(p);
  const manual = p.checklist || {};
  const state: Record<string, boolean> = {};
  CHECKLIST.forEach((c) => { state[c.id] = auto[c.id] || !!manual[c.id]; });
  const done = CHECKLIST.filter((c) => state[c.id]).length;
  const essentialsDone = CHECKLIST.filter((c) => c.essential).every((c) => state[c.id]);
  return { state, done, total: CHECKLIST.length, essentialsDone };
}

export function projectProgress(p: Project) {
  const s = autoStages(p);
  const done = STAGES.filter((x) => s[x.id] === 'done').length;
  return { done, total: STAGES.length, pct: Math.round((done / STAGES.length) * 100), stages: s };
}

/* ---------------- صياغة الأعداد بالعربية ----------------
   المفرد/المثنى/جمع القلة (3–10)/جمع الكثرة (>10)
   ------------------------------------------------------- */
export function arN(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}
export const nItems = (n: number) => arN(n, 'بند واحد', 'بندان', 'بنود', 'بندًا');
export const nInjects = (n: number) => arN(n, 'محفز واحد', 'محفزان', 'محفزات', 'محفزًا');
export const nHazards = (n: number) => arN(n, 'خطر واحد', 'خطران', 'مخاطر', 'خطرًا');
export const nNotes = (n: number) => arN(n, 'ملاحظة واحدة', 'ملاحظتان', 'ملاحظات', 'ملاحظة');
export const nUnits = (n: number) => arN(n, 'وحدة واحدة', 'وحدتان', 'وحدات', 'وحدة');
