export interface BadgeDef { id: string; name: string; desc: string; icon: string; xp: number }

export const BADGES: BadgeDef[] = [
  { id: 'analyst', name: 'محلل الخطة', desc: 'أتقنتِ تفكيك الخطة إلى بنود قابلة للاختبار ضمن الفئات السبع', icon: 'grid', xp: 120 },
  { id: 'coverage', name: 'خبير التغطية', desc: 'بنيتِ مصفوفة تغطية وسجلاً تراكميًا واخترتِ الخطر بالاختيار الرياضي', icon: 'matrix', xp: 150 },
  { id: 'inject', name: 'مصمم المحفزات', desc: 'صغتِ محفزات تفرض تنفيذ البند ولا يمكن تجاوزها', icon: 'bolt', xp: 150 },
  { id: 'msel', name: 'مهندس MSEL', desc: 'بنيتِ قائمة أحداث رئيسية متوازنة زمنيًا ومرتبطة ببنود الخطة', icon: 'list', xp: 150 },
  { id: 'evaluator', name: 'مقيّم الأداء', desc: 'صغتِ معايير نجاح قابلة للقياس وأدرتِ نموذج المراقبة', icon: 'ruler', xp: 150 },
  { id: 'debrief', name: 'خبير الاستخلاص', desc: 'ربطتِ كل ملاحظة ببند محدد وحوّلتِها إلى توصية بمالك ومهلة', icon: 'clipboard', xp: 150 },
  { id: 'scenario', name: 'مصمم السيناريو', desc: 'صممتِ سيناريو اختبار خطة متكاملاً بتصعيد مبرر', icon: 'play', xp: 200 },
  { id: 'master', name: 'خبير اختبار خطط الطوارئ', desc: 'أكملتِ البرنامج كاملاً واجتزتِ الاختبار النهائي بجزأيه', icon: 'award', xp: 400 },
];

export const BADGE_MAP: Record<string, BadgeDef> = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export const LEVELS = [
  { n: 1, name: 'مبتدئ', min: 0 },
  { n: 2, name: 'ممارس', min: 250 },
  { n: 3, name: 'مصمم', min: 600 },
  { n: 4, name: 'مصمم أول', min: 1100 },
  { n: 5, name: 'خبير', min: 1800 },
  { n: 6, name: 'خبير معتمد', min: 2600 },
];

export function levelOf(xp: number) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) cur = l;
  const next = LEVELS.find((l) => l.min > xp);
  const span = next ? next.min - cur.min : 1;
  const into = xp - cur.min;
  return { level: cur, next, pct: next ? Math.min(100, Math.round((into / span) * 100)) : 100 };
}

export const XP = {
  slide: 5,
  moduleComplete: 40,
  quizPass: 60,
  quizPerfect: 30,
  labSolved: 35,
  projectStage: 25,
  auditRun: 15,
  finalPass: 250,
};
