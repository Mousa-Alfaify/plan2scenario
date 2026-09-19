/* ==========================================================================
   Content Coverage Matrix — تدقيق تغطية محتوى الدليل داخل النظام
   الهدف: 100% تغطية. كل قسم في الـ PDF له مكان مقابل داخل التطبيق.
   ========================================================================== */

export interface AuditRow {
  ch: string;        // رقم الفصل/القسم
  title: string;     // العنوان في الدليل
  page: string;      // الصفحة في الـ PDF
  where: string;     // مكانه في التطبيق
  route: string;     // المسار المباشر
  kind: string;      // نوع التفاعل
  status: 'full';    // حالة التغطية
}

export const AUDIT: AuditRow[] = [
  { ch: 'الغلاف', title: 'كيف نكتب سيناريو لاختبار خطط الكوارث — د. روعة الفرج، إصدار 2026', page: '1', where: 'الصفحة الرئيسية — Hero + بطاقة المصدر', route: '#/', kind: 'عرض', status: 'full' },
  { ch: 'الفهرس', title: 'فهرس المحتويات', page: '2–4', where: 'خريطة المحتوى + قائمة الوحدات', route: '#/learn', kind: 'تنقل', status: 'full' },

  { ch: '1', title: 'مقدمة: لماذا نختبر الخطة بالسيناريو؟', page: '5–6', where: 'الوحدة 1', route: '#/learn/m1', kind: 'دروس + اختبار', status: 'full' },
  { ch: '1.1', title: 'الفخ الشائع: تمرين ناجح، خطة غير مُختبرة', page: '5', where: 'الوحدة 1 — الشريحة 1', route: '#/learn/m1', kind: 'شرح + سؤال تفاعلي', status: 'full' },
  { ch: '1.2', title: 'اختبار الاستجابة مقابل اختبار الخطة (جدول)', page: '5–6', where: 'الوحدة 1 — الشريحة 2', route: '#/learn/m1', kind: 'مقارنة تفاعلية بالضغط', status: 'full' },
  { ch: '1.3', title: 'من يحتاج هذا الدليل؟', page: '6', where: 'الوحدة 1 — الشريحة 3', route: '#/learn/m1', kind: 'قائمة', status: 'full' },
  { ch: '1.4', title: 'خارطة الدليل', page: '6', where: 'الوحدة 1 — الشريحة 3 (خريطة الرحلة)', route: '#/learn/m1', kind: 'مخطط تفاعلي', status: 'full' },

  { ch: '2', title: 'المبدأ الأساسي: التصميم العكسي من الخطة', page: '7–9', where: 'الوحدة 2', route: '#/learn/m2', kind: 'دروس + اختبار', status: 'full' },
  { ch: '2.1', title: 'مساران مختلفان للتصميم', page: '7', where: 'الوحدة 2 — الشريحة 1', route: '#/learn/m2', kind: 'Flow Diagram تفاعلي', status: 'full' },
  { ch: '2.2', title: 'مقارنة المسارين (جدول)', page: '7–8', where: 'الوحدة 2 — الشريحة 2', route: '#/learn/m2', kind: 'مقارنة تفاعلية', status: 'full' },
  { ch: '2.3', title: 'لماذا لا نكتفي بالمسار التقليدي؟ + تمرين سريع', page: '8', where: 'الوحدة 2 — الشريحة 3', route: '#/learn/m2', kind: 'مثال + عدّاد تفاعلي', status: 'full' },
  { ch: '2.4', title: 'متى تستخدمين كل مسار؟', page: '8–9', where: 'الوحدة 2 — الشريحة 4', route: '#/learn/m2', kind: 'حالات عملية تفاعلية', status: 'full' },

  { ch: '3', title: 'تفكيك الخطة إلى عناصر قابلة للاختبار', page: '10–13', where: 'الوحدة 3 + الوحدة 4', route: '#/learn/m3', kind: 'دروس + أدوات', status: 'full' },
  { ch: '3.1', title: 'لماذا التفكيك أولاً؟', page: '10', where: 'الوحدة 3 — الشريحة 1', route: '#/learn/m3', kind: 'شرح', status: 'full' },
  { ch: '3.2', title: 'الفئات السبع لعناصر الخطة (جدول)', page: '10–11', where: 'الوحدة 3 — الشريحة 2', route: '#/learn/m3', kind: 'بطاقات تفاعلية + تصنيف', status: 'full' },
  { ch: '3.3', title: 'كيف تبنين جدول التفكيك عمليًا (5 خطوات)', page: '11', where: 'الوحدة 3 — الشريحة 3', route: '#/learn/m3', kind: 'قائمة + سؤال', status: 'full' },
  { ch: '3.4', title: 'نموذج جدول التفكيك (جدول المثال)', page: '11–12', where: 'الوحدة 3 — الشريحة 4 + مختبر التفكيك', route: '#/build/decompose', kind: 'جدول + أداة CRUD', status: 'full' },
  { ch: '3.5', title: 'حجم الجدول المتوقع + تمرين سريع', page: '12–13', where: 'الوحدة 3 — الشريحة 5 + تنبيه في المختبر', route: '#/build/decompose', kind: 'شرح + فحص آلي', status: 'full' },

  { ch: '4', title: 'اختيار الخطر ومصفوفة التغطية', page: '14–16', where: 'الوحدة 5 + الوحدة 6', route: '#/learn/m5', kind: 'دروس + Matrix Builder', status: 'full' },
  { ch: '4.1', title: 'معيار الاختيار: التغطية لا الإثارة', page: '14', where: 'الوحدة 5 — الشريحة 1', route: '#/learn/m5', kind: 'شرح', status: 'full' },
  { ch: '4.2', title: 'بناء مصفوفة التغطية (جدول المثال)', page: '14–15', where: 'الوحدة 5 — الشريحة 2 + أداة المصفوفة', route: '#/build/matrix', kind: 'مصفوفة تحسب آليًا', status: 'full' },
  { ch: '4.3', title: 'ماذا لو لم يغطِّ خطر واحد كل ما تحتاجينه؟', page: '15', where: 'الوحدة 6 — شجرة القرار', route: '#/learn/m6', kind: 'Decision Tree تفاعلي', status: 'full' },
  { ch: '4.4', title: 'معايير ترجيح إضافية عند التعادل + تمرين', page: '16', where: 'الوحدة 5 — الشريحة 3 + عوامل الترجيح في الأداة', route: '#/build/matrix', kind: 'ترجيح محسوب', status: 'full' },

  { ch: '5', title: 'تصميم لحظات التفعيل لكل عنصر', page: '17–19', where: 'الوحدة 7 + الوحدة 8', route: '#/learn/m7', kind: 'دروس + Inject/MSEL Builder', status: 'full' },
  { ch: '5.1', title: 'من البند إلى المحفز: القاعدة الذهبية', page: '17', where: 'الوحدة 7 — الشريحة 1', route: '#/learn/m7', kind: 'شرح + فحص تلقائي', status: 'full' },
  { ch: '5.2', title: 'أمثلة محفزات لكل فئة (جدول 7 أمثلة)', page: '17–18', where: 'الوحدة 7 — الشريحة 2', route: '#/learn/m7', kind: 'بطاقات تفاعلية', status: 'full' },
  { ch: '5.3', title: 'خصائص المحفز الجيد لاختبار الخطة', page: '18', where: 'الوحدة 7 — الشريحة 3 + فحوص Inject Builder', route: '#/build/injects', kind: 'قائمة + تدقيق', status: 'full' },
  { ch: '5.4', title: 'صياغة نص المحفز فعليًا + مثال المحفز رقم 6 + تمرين', page: '18–19', where: 'الوحدة 7 — الشريحة 4 + Inject Builder', route: '#/build/injects', kind: 'مولّد نص المحفز', status: 'full' },
  { ch: '5.5', title: 'ترتيب المحفزات ضمن الجدول الزمني', page: '19', where: 'الوحدة 7 — الشريحة 5 + فحص توازن MSEL', route: '#/build/msel', kind: 'نشاط ترتيب + تحليل', status: 'full' },

  { ch: '6', title: 'استهداف الثغرات وعناصر لم تُختبر من قبل', page: '20–21', where: 'الوحدة 9', route: '#/learn/m9', kind: 'دروس + سجل تغطية', status: 'full' },
  { ch: '6.1', title: 'مشكلة «البنود المفضلة»', page: '20', where: 'الوحدة 9 — الشريحة 1', route: '#/learn/m9', kind: 'شرح', status: 'full' },
  { ch: '6.2', title: 'سجل التغطية التراكمي (جدول)', page: '20–21', where: 'الوحدة 9 — الشريحة 2 + Coverage History', route: '#/build/history', kind: 'لوحة + تنبيهات', status: 'full' },
  { ch: '6.3', title: 'كيف تُحدَّد الأولوية؟ (المعادلة المبسطة)', page: '21', where: 'الوحدة 9 — الشريحة 3 + حساب الأولوية', route: '#/build/history', kind: 'حساب آلي', status: 'full' },
  { ch: '6.4', title: 'حالة خاصة: البنود التي «يصعب» اختبارها', page: '21', where: 'الوحدة 9 — الشريحة 4 + خانة «يصعب اختباره»', route: '#/build/decompose', kind: 'شرح + حقل', status: 'full' },

  { ch: '7', title: 'معايير النجاح والفشل لكل بند', page: '22–24', where: 'الوحدة 10 + الوحدة 11', route: '#/learn/m10', kind: 'دروس + Criteria/Observer', status: 'full' },
  { ch: '7.1', title: 'لماذا لا يكفي «نجح / لم ينجح»؟', page: '22', where: 'الوحدة 10 — الشريحة 1', route: '#/learn/m10', kind: 'شرح', status: 'full' },
  { ch: '7.2', title: 'قالب صياغة المعيار + مثال مطبَّق', page: '22', where: 'الوحدة 10 — الشريحة 2 + Criteria Builder', route: '#/build/criteria', kind: 'مولّد معيار', status: 'full' },
  { ch: '7.3', title: 'نموذج مراقبة الأداء أثناء التمرين', page: '23', where: 'الوحدة 11 + Observer Mode', route: '#/build/observe', kind: 'نموذج حيّ', status: 'full' },
  { ch: '7.4', title: 'تصنيف درجة التنفيذ (جدول كامل/جزئي/لم يحدث)', page: '23', where: 'الوحدة 10 — الشريحة 3 + شرح داخل المراقبة', route: '#/build/observe', kind: 'جدول + إرشاد سياقي', status: 'full' },

  { ch: '8', title: 'نقطة التصعيد النهائية', page: '25–26', where: 'الوحدة 12 + Escalation Builder', route: '#/learn/m12', kind: 'دروس + أداة فحص', status: 'full' },
  { ch: '8.1', title: 'لماذا نحتاج نقطة تصعيد؟', page: '25', where: 'الوحدة 12 — الشريحة 1', route: '#/learn/m12', kind: 'شرح', status: 'full' },
  { ch: '8.2', title: 'معايير تصعيد سليم (4 معايير)', page: '25', where: 'الوحدة 12 — الشريحة 2 + فحوص الأداة', route: '#/build/escalation', kind: 'قائمة فحص إلزامية', status: 'full' },
  { ch: '8.3', title: 'مثال تصعيد (01:15)', page: '26', where: 'الوحدة 12 — الشريحة 2 + المشروع التجريبي', route: '#/build/escalation', kind: 'مثال', status: 'full' },

  { ch: '9', title: 'الاستخلاص المرتبط ببنود الخطة', page: '27–28', where: 'الوحدة 13 + AAR Tool', route: '#/learn/m13', kind: 'دروس + أداة', status: 'full' },
  { ch: '9.1', title: 'السؤال المحوري بعد كل تمرين', page: '27', where: 'الوحدة 13 — الشريحة 1', route: '#/learn/m13', kind: 'شرح', status: 'full' },
  { ch: '9.2', title: 'نموذج تقرير الاستخلاص المرتبط بالخطة (جدول)', page: '27', where: 'الوحدة 13 — الشريحة 2 + AAR', route: '#/build/aar', kind: 'جدول + نموذج', status: 'full' },
  { ch: '9.3', title: 'تحويل التوصيات إلى إجراءات متابعة', page: '28', where: 'الوحدة 13 — الشريحة 3 + خطة التحسين', route: '#/build/aar', kind: 'مالك + مهلة + حالة', status: 'full' },

  { ch: '10', title: 'نموذج: مصفوفة تحويل الخطة إلى سيناريو (7 مراحل)', page: '29', where: 'الوحدة 14 + شاشة «من الخطة إلى السيناريو»', route: '#/build/pipeline', kind: 'مخطط عمل بحالات', status: 'full' },

  { ch: '11', title: 'مثال تطبيقي متكامل', page: '30–32', where: 'الوحدة 15 (محاكاة) + المشروع التجريبي', route: '#/learn/m15', kind: 'Simulation + مشروع كامل', status: 'full' },
  { ch: '11.1', title: 'جدول تفكيك مختصر (5 بنود ذات أولوية)', page: '30', where: 'المحاكاة المرحلة 1 + بنود المشروع التجريبي', route: '#/build/decompose', kind: 'قرار + بيانات', status: 'full' },
  { ch: '11.2', title: 'اختيار الخطر', page: '30', where: 'المحاكاة المرحلتان 2 و3', route: '#/learn/m15', kind: 'قرار + تغذية راجعة', status: 'full' },
  { ch: '11.3', title: 'قائمة محفزات مختصرة (MSEL)', page: '31', where: 'المحاكاة المرحلة 4 + MSEL المشروع التجريبي', route: '#/build/msel', kind: 'ترتيب + جدول', status: 'full' },
  { ch: '11.4', title: 'نتائج المراقبة (مثال توضيحي)', page: '31', where: 'المحاكاة المرحلتان 5 و6 + نتائج المراقبة', route: '#/build/observe', kind: 'تقييم + بيانات', status: 'full' },
  { ch: '11.5', title: 'أبرز توصيات الاستخلاص', page: '31–32', where: 'المحاكاة المرحلة 7 + تقرير AAR التجريبي', route: '#/build/aar', kind: 'قرار + تقرير', status: 'full' },

  { ch: '12', title: 'الأخطاء الشائعة (6 أخطاء)', page: '33', where: 'الوحدة 16 + عيادة الأخطاء + مدقق المشروع', route: '#/learn/m16', kind: 'جدول + تشخيص تفاعلي', status: 'full' },

  { ch: '13.1', title: 'قائمة التحقق قبل تنفيذ سيناريو اختبار الخطة (10 عناصر)', page: '34', where: 'الوحدة 17 + قائمة التحقق في المشروع', route: '#/build/checklist', kind: 'Checklist بمؤشر تقدم', status: 'full' },
  { ch: '13.2', title: 'أهم المراجع (5 مراجع)', page: '34', where: 'الوحدة 17 — الشريحة 2', route: '#/learn/m17', kind: 'قائمة', status: 'full' },
  { ch: 'ص35', title: 'ملاحظة التوسع بالوثائق الثلاث المرافقة', page: '35', where: 'الوحدة 17 — الشريحة 2', route: '#/learn/m17', kind: 'ملاحظة', status: 'full' },

  { ch: '14 / أ', title: 'ملحق (أ): جدول تفكيك الخطة', page: '36', where: 'النماذج والأدوات — نموذج أ', route: '#/forms/a', kind: 'نموذج تفاعلي + طباعة/تصدير', status: 'full' },
  { ch: '14 / ب', title: 'ملحق (ب): مصفوفة تغطية المخاطر', page: '36', where: 'النماذج والأدوات — نموذج ب', route: '#/forms/b', kind: 'مصفوفة تفاعلية', status: 'full' },
  { ch: '14 / ج', title: 'ملحق (ج): قائمة الأحداث الرئيسية MSEL', page: '36–37', where: 'النماذج والأدوات — نموذج ج', route: '#/forms/c', kind: 'جدول تفاعلي', status: 'full' },
  { ch: '14 / د', title: 'ملحق (د): نموذج مراقبة الأداء والاستخلاص', page: '37', where: 'النماذج والأدوات — نموذج د', route: '#/forms/d', kind: 'نموذج تفاعلي', status: 'full' },
  { ch: '14 / هـ', title: 'ملحق (هـ): سجل التغطية التراكمي', page: '37', where: 'النماذج والأدوات — نموذج هـ', route: '#/forms/e', kind: 'سجل تفاعلي', status: 'full' },
];

export const AUDIT_STATS = () => {
  const total = AUDIT.length;
  const full = AUDIT.filter((r) => r.status === 'full').length;
  return { total, full, pct: Math.round((full / total) * 100) };
};
