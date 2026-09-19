/* ==========================================================================
   نموذج البيانات — أكاديمية سيناريو اختبار خطط الكوارث
   مصمم ليكون قابلاً مستقبلاً للربط بحساب مستخدم على Backend:
   كل كيان له id مستقل + ownerId اختياري + طوابع زمنية.
   ========================================================================== */

export type CategoryId = 'activation' | 'command' | 'internal' | 'external' | 'resources' | 'operations' | 'continuity';

export type Priority = 'very-high' | 'high' | 'medium' | 'low';
export type Grade = 'full' | 'partial' | 'none';
export type GapCause = 'plan-text' | 'training' | 'resources' | 'knowledge' | 'execution' | '';
export type RecType = 'plan-edit' | 'training' | 'resources' | 'no-action' | 'strength' | '';
export type RecStatus = 'open' | 'in-progress' | 'done' | 'overdue';
export type StageState = 'todo' | 'doing' | 'done';
export type HazardStrategy = 'single' | 'compound' | 'escalation' | 'partial' | '';

/** بند من بنود الخطة (وحدة اختبار) — الفصل 3 */
export interface PlanItem {
  id: string;
  code: string;            // رقم البند بالخطة (مثال 4.1.3)
  desc: string;            // الوصف المختصر للإجراء
  category: CategoryId | '';
  owner: string;           // المسؤول حسب الخطة
  testedBefore: boolean;   // هل اختُبر سابقًا؟
  lastTested: string;      // آخر اختبار (سنة أو "لم يُختبر")
  testCount3y: number;     // عدد مرات الاختبار خلال 3 سنوات — الفصل 6
  sensitivity: 1 | 2 | 3;  // الحساسية (الأثر على سلامة المرضى) — الفصل 6.3
  complexity: 1 | 2 | 3;   // التعقيد — الفصل 6.3
  hardToTest: boolean;     // بند "يصعب" اختباره — الفصل 6.4
  notes: string;
  createdAt: number;
}

/** خطر مرشح في مصفوفة التغطية — الفصل 4 */
export interface Hazard {
  id: string;
  name: string;
  /** عوامل الترجيح عند التعادل — الفصل 4.4 (0..2) */
  geoRealism: 0 | 1 | 2;      // الواقعية الجغرافية والموسمية
  pastFrequency: 0 | 1 | 2;   // تكرار الخطر في تمارين السنوات الماضية (الأقل تكرارًا أفضل)
  mgmtComplexity: 0 | 1 | 2;  // مستوى تعقيد الإدارة مقابل نضج الفريق
  timeResources: 0 | 1 | 2;   // توفر الوقت والموارد
  notes: string;
}

/** محفز Inject — الفصل 5 */
export interface Inject {
  id: string;
  order: number;
  time: string;            // HH:MM من بداية التمرين
  source: string;          // الجهة/الشخص الذي يرسل المحفز
  receiver: string;        // المستقبل
  channel: string;         // وسيلة المحفز (مكالمة/رسالة/تقرير/بلاغ)
  event: string;           // الحدث
  data: string;            // البيانات المتاحة
  decision: string;        // القرار المطلوب
  targetItemId: string;    // بند الخطة المستهدف
  text: string;            // نص المحفز الكامل الجاهز للتسليم
  bypassable: '' | 'yes' | 'no'; // فحص: هل يمكن تجاوزه دون تنفيذ البند؟
  isEscalation: boolean;
  objective: string;       // الهدف
  expectedAction: string;  // الإجراء المتوقع
  observerNotes: string;
}

/** معيار نجاح — الفصل 7.2 */
export interface Criterion {
  id: string;
  itemId: string;
  action: string;
  duration: string;
  startPoint: string;
  responsible: string;
  mandatorySteps: string;
  text: string;
}

/** نقطة التصعيد — الفصل 8 */
export interface Escalation {
  enabled: boolean;
  time: string;
  targetItemIds: string[];
  event: string;
  text: string;
  stopPoint: string;
  checks: {
    justified: boolean;      // مبرر ضمن منطق الخطر
    targetsUntested: boolean;// يستهدف بندًا لم يُفعَّل بعد
    prePlanned: boolean;     // مُدرج مسبقًا في وثيقة الفرضية
    hasStopPoint: boolean;   // له نقطة توقف واضحة
    withinCapacity: boolean; // لا يتجاوز قدرة المشاركين
  };
}

/** مراقبة الأداء — الفصل 7.3 */
export interface Observation {
  id: string;
  itemId: string;
  injectTime: string;
  actualTime: string;
  grade: Grade | '';
  notes: string;
}

/** الاستخلاص وخطة التحسين — الفصل 9 */
export interface AarEntry {
  id: string;
  itemId: string;
  grade: Grade | '';
  gapReason: string;
  gapCause: GapCause;
  recType: RecType;
  recText: string;
  owner: string;
  due: string;
  status: RecStatus;
  followUp: string;
}

export interface Project {
  id: string;
  name: string;
  org: string;
  planName: string;
  isDemo?: boolean;
  createdAt: number;
  updatedAt: number;
  items: PlanItem[];
  hazards: Hazard[];
  /** coverage[hazardId][itemId] = true */
  coverage: Record<string, Record<string, boolean>>;
  selectedHazardId: string;
  strategy: HazardStrategy;
  compoundWithId: string;
  strategyNote: string;
  injects: Inject[];
  criteria: Criterion[];
  escalation: Escalation;
  observations: Observation[];
  aar: AarEntry[];
  stages: Record<string, StageState>; // المراحل السبع — الفصل 10
  checklist: Record<string, boolean>; // قائمة التحقق النهائية — 13.1
}

/* ----------------------------- تقدّم التعلم ----------------------------- */

export interface QuizResult {
  score: number;      // 0..100
  correct: number;
  total: number;
  at: number;
  attempts: number;
  best: number;
}

export interface ModuleProgress {
  seen: string[];          // معرفات الشرائح المقروءة
  completed: boolean;
  quiz?: QuizResult;
}

export interface FinalAssessment {
  knowledge?: QuizResult;
  projectId?: string;
  submittedAt?: number;
  report?: FinalReport;
}

export interface FinalReport {
  total: number;
  sections: { key: string; label: string; score: number; max: number; notes: string[] }[];
  at: number;
}

export interface Progress {
  xp: number;
  badges: string[];
  modules: Record<string, ModuleProgress>;
  lastModuleId: string;
  /** عدّاد أخطاء المفاهيم للتعلم التكيفي */
  conceptErrors: Record<string, number>;
  conceptMastery: Record<string, number>;
  final: FinalAssessment;
  labs: Record<string, { best: number; done: boolean }>;
}

export type Mode = 'learn' | 'build';

export interface AppState {
  version: number;
  mode: Mode;
  route: string;
  progress: Progress;
  projects: Project[];
  activeProjectId: string;
  seenIntro: boolean;
}
