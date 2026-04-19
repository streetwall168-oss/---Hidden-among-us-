import { Category, Role, Mission } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'طعام (Food)',
    isPremium: false,
    words: ['بيتزا', 'برجر', 'سوشي', 'باستا', 'شاورما', 'فلافل', 'كبسة', 'منسف', 'تاكو', 'ستيك', 'نودلز', 'كريب', 'وافل', 'بان كيك', 'سلطة', 'شوربة', 'كنافة', 'بقلاوة', 'آيس كريم', 'دونات']
  },
  {
    id: 'countries',
    name: 'دول (Countries)',
    isPremium: false,
    words: ['مصر', 'السعودية', 'اليابان', 'فرنسا', 'البرازيل', 'كندا', 'أستراليا', 'ألمانيا', 'إيطاليا', 'الصين', 'المغرب', 'الأردن', 'لبنان', 'الإمارات', 'الكويت', 'قطر', 'عمان', 'البحرين', 'تونس', 'الجزائر']
  },
  {
    id: 'animals',
    name: 'حيوانات (Animals)',
    isPremium: false,
    words: ['أسد', 'نمر', 'فيل', 'زرافة', 'قرد', 'تمساح', 'ثعبان', 'عصفور', 'صقر', 'نسر', 'بطريق', 'دب', 'ذئب', 'ثعلب', 'أرنب', 'حصان', 'جمل', 'خروف', 'بقرة', 'قطة']
  },
  {
    id: 'movies',
    name: 'أفلام (Movies)',
    isPremium: false,
    words: ['تايتانيك', 'الجوكر', 'أفاتار', 'باتمان', 'سوبرمان', 'هاري بوتر', 'سيد الخواتم', 'حرب النجوم', 'الأسد الملك', 'علاء الدين', 'فروزن', 'توي ستوري', 'ماتريكس', 'إنسيبشن', 'بين البينين', 'العراب', 'سكارفيس', 'روكي', 'رامبو', 'سبايدرمان']
  },
  {
    id: 'sports',
    name: 'رياضة (Sports)',
    isPremium: true,
    cost: 300,
    words: ['كرة القدم', 'كرة السلة', 'التنس', 'السباحة', 'الملاكمة', 'الكاراتيه', 'الجودو', 'المبارزة', 'الرماية', 'الجري', 'القفز العالي', 'الجمباز', 'ركوب الخيل', 'التزلج', 'الغولف', 'البيسبول', 'الكريكت', 'الرغبي', 'الهوكي', 'تنس الطاولة']
  },
  {
    id: 'tech',
    name: 'تكنولوجيا (Tech)',
    isPremium: true,
    cost: 400,
    words: ['هاتف', 'حاسوب', 'إنترنت', 'روبوت', 'ذكاء اصطناعي', 'برمجة', 'تطبيق', 'موقع', 'خادم', 'شاشة', 'لوحة مفاتيح', 'فأرة', 'سماعات', 'كاميرا', 'طابعة', 'ماسح ضوئي', 'قرص صلب', 'ذاكرة', 'معالج', 'بطارية']
  },
  {
    id: 'space',
    name: 'فضاء (Space)',
    isPremium: true,
    cost: 500,
    words: ['شمس', 'قمر', 'أرض', 'مريخ', 'مشتري', 'زحل', 'نبتون', 'أورانوس', 'عطارد', 'زهرة', 'نجم', 'مجرة', 'ثقب أسود', 'مذنب', 'نيزك', 'كويكب', 'رائد فضاء', 'صاروخ', 'مكوك', 'قمر صناعي']
  },
  {
    id: 'history',
    name: 'تاريخ (History)',
    isPremium: true,
    cost: 450,
    words: ['أهرامات', 'سور الصين', 'قلعة', 'قصر', 'معبد', 'متحف', 'تمثال', 'عملة', 'خريطة', 'مخطوطة', 'سيف', 'درع', 'تاج', 'عرش', 'ثورة', 'حرب', 'سلام', 'معاهدة', 'إمبراطورية', 'حضارة']
  }
  // Adding more categories to reach 20
  , { id: 'cars', name: 'سيارات (Cars)', isPremium: true, cost: 350, words: ['تويوتا', 'مرسيدس', 'بي إم دبليو', 'أودي', 'فورد', 'هوندا', 'نيسان', 'كيا', 'هيونداي', 'تسلا', 'فيراري', 'لامبورغيني', 'بورشه', 'جيب', 'لاند روفر', 'مازدا', 'سوبارو', 'فولكس فاجن', 'شيفروليه', 'دودج'] }
  , { id: 'jobs', name: 'مهن (Jobs)', isPremium: false, words: ['طبيب', 'مهندس', 'معلم', 'محامي', 'محاسب', 'طيار', 'ممرض', 'صيدلي', 'شرطي', 'إطفائي', 'نجار', 'سباك', 'كهربائي', 'خياط', 'حلاق', 'طباخ', 'مزارع', 'صحفي', 'فنان', 'كاتب'] }
  , { id: 'clothing', name: 'ملابس (Clothing)', isPremium: false, words: ['قميص', 'بنطال', 'فستان', 'تنورة', 'سترة', 'معطف', 'قبعة', 'وشاح', 'قفازات', 'جوارب', 'حذاء', 'حقيبة', 'حزام', 'نظارات', 'ساعة', 'خاتم', 'عقد', 'قرط', 'بدلة', 'بيجامة'] }
  , { id: 'household', name: 'أدوات منزلية (Household)', isPremium: false, words: ['ثلاجة', 'غسالة', 'فرن', 'ميكروويف', 'تلفاز', 'مكيف', 'مكنسة', 'مكواة', 'خلاط', 'غلاية', 'سرير', 'خزانة', 'طاولة', 'كرسي', 'أريكة', 'سجادة', 'ستارة', 'مرآة', 'مصباح', 'ساعة حائط'] }
  , { id: 'transport', name: 'مواصلات (Transport)', isPremium: false, words: ['سيارة', 'حافلة', 'قطار', 'طائرة', 'سفينة', 'دراجة', 'دراجة نارية', 'مترو', 'ترام', 'تاكسي', 'شاحنة', 'قارب', 'يخت', 'منطاد', 'غواصة', 'صاروخ', 'عربة', 'زلاجة', 'رافعة', 'جرار'] }
  , { id: 'school', name: 'مدرسة (School)', isPremium: false, words: ['كتاب', 'دفتر', 'قلم', 'مسطرة', 'ممحاة', 'مبراة', 'حقيبة', 'سبورة', 'طبشور', 'مقعد', 'مختبر', 'مكتبة', 'ساحة', 'معلم', 'طالب', 'مدير', 'امتحان', 'شهادة', 'حصة', 'عطلة'] }
  , { id: 'body', name: 'أعضاء الجسم (Body Parts)', isPremium: false, words: ['رأس', 'عين', 'أذن', 'أنف', 'فم', 'لسان', 'أسنان', 'شعر', 'وجه', 'رقبة', 'كتف', 'ذراع', 'يد', 'إصبع', 'صدر', 'ظهر', 'بطن', 'رجل', 'قدم', 'قلب'] }
  , { id: 'weather', name: 'طقس (Weather)', isPremium: false, words: ['شمس', 'مطر', 'ثلج', 'ريح', 'سحاب', 'رعد', 'برق', 'عاصفة', 'إعصار', 'ضباب', 'ندى', 'قوس قزح', 'حرارة', 'برودة', 'رطوبة', 'جفاف', 'ربيع', 'صيف', 'خريف', 'شتاء'] }
  , { id: 'colors', name: 'ألوان (Colors)', isPremium: false, words: ['أحمر', 'أزرق', 'أخضر', 'أصفر', 'أسود', 'أبيض', 'رمادي', 'بني', 'برتقالي', 'بنفسجي', 'وردي', 'ذهبي', 'فضي', 'فيروزي', 'نيلي', 'قرمزي', 'ليموني', 'زيتي', 'سماوي', 'بيج'] }
  , { id: 'fruits', name: 'فواكه (Fruits)', isPremium: false, words: ['تفاح', 'موز', 'برتقال', 'عنب', 'فراولة', 'بطيخ', 'شمام', 'مانجو', 'أناناس', 'كيوي', 'خوخ', 'مشمش', 'كرز', 'رمان', 'تين', 'توت', 'ليمون', 'جوافة', 'إجاص', 'تمر'] }
  , { id: 'vegetables', name: 'خضروات (Vegetables)', isPremium: false, words: ['بطاطس', 'طماطم', 'خيار', 'جزر', 'بصل', 'ثوم', 'فلفل', 'باذنجان', 'كوسة', 'خس', 'ملفوف', 'قرنبيط', 'بروكلي', 'سبانخ', 'بامية', 'فاصولياء', 'بازلاء', 'ذرة', 'فجل', 'بقدونس'] }
  , { id: 'nature', name: 'طبيعة (Nature)', isPremium: false, words: ['جبل', 'نهر', 'بحر', 'محيط', 'بحيرة', 'شلال', 'غابة', 'صحراء', 'جزيرة', 'وادي', 'كهف', 'بركان', 'شاطئ', 'سماء', 'أرض', 'حجر', 'رمل', 'طين', 'عشب', 'شجرة'] }
  , { id: 'brands', name: 'ماركات (Brands)', isPremium: true, cost: 600, words: ['أديداس', 'نايك', 'شانيل', 'غوتشي', 'لويس فيتون', 'زارا', 'إتش آند إم', 'رولكس', 'آبل', 'سامسونج', 'سوني', 'مايكروسوفت', 'غوغل', 'أمازون', 'كوكاكولا', 'بيبسي', 'ستارباكس', 'ماكدونالدز', 'إيكيا', 'ليغو'] }
  , { id: 'electronics', name: 'إلكترونيات (Electronics)', isPremium: true, cost: 550, words: ['تلفاز', 'ثلاجة', 'غسالة', 'ميكروويف', 'خلاط', 'مكواة', 'مكنسة كهربائية', 'مكيف', 'سخان', 'كاميرا', 'سماعات', 'شاحن', 'بطارية', 'مصباح', 'ساعة ذكية', 'جهاز تحكم', 'راديو', 'مشغل موسيقى', 'لوحة ألعاب', 'راوتر'] }
  , { id: 'instruments', name: 'آلات موسيقية (Instruments)', isPremium: true, cost: 500, words: ['بيانو', 'غيتار', 'كمان', 'طبلة', 'ناي', 'عود', 'قانون', 'ساكسفون', 'بوق', 'تشيلو', 'هارب', 'أكورديون', 'هارمونيكا', 'دف', 'مثلث', 'صنج', 'أورغ', 'قيثارة', 'مندولين', 'بانجو'] }
  , { id: 'insects', name: 'حشرات (Insects)', isPremium: false, words: ['نملة', 'نحلة', 'فراشة', 'ذبابة', 'بعوضة', 'صرصور', 'عنكبوت', 'عقرب', 'خنفساء', 'جرادة', 'يعسوب', 'دبور', 'برغوث', 'قملة', 'سوسة', 'يرقة', 'شرنقة', 'نحلة طنانة', 'دعسوقة', 'نمل أبيض'] }
];

export const ROLES: Role[] = [
  { id: 'civilian', name: 'مواطن (Civilian)', description: 'يعرف الكلمة السرية، ليس لديه قدرات.', team: 'CIVILIAN', isPremium: false },
  { id: 'spy', name: 'جاسوس (Spy)', description: 'لا يعرف الكلمة السرية، يحاول الاختباء.', team: 'SPY', isPremium: false },
  { id: 'detective', name: 'المحقق (Detective)', description: 'يمكنه معرفة ما إذا كان لاعب واحد جاسوساً أم لا.', team: 'CIVILIAN', ability: 'كشف هوية لاعب', isPremium: false },
  { id: 'medic', name: 'الطبيب (Medic)', description: 'يمكنه حماية لاعب من التصويت في الجولة القادمة.', team: 'CIVILIAN', ability: 'حماية لاعب', isPremium: false },
  { id: 'traitor', name: 'الخائن (Traitor)', description: 'يعرف الكلمة السرية ولكنه يعمل مع الجواسيس.', team: 'SPY', isPremium: true, cost: 500 },
  { id: 'oracle', name: 'العرافة (Oracle)', description: 'يمكنها رؤية حرف واحد من الكلمة السرية للجواسيس.', team: 'CIVILIAN', ability: 'رؤية حرف', isPremium: true, cost: 750 },
  { id: 'hacker', name: 'المخترق (Hacker)', description: 'يمكنه تعطيل قدرة لاعب آخر.', team: 'SPY', ability: 'تعطيل قدرة', isPremium: true, cost: 1000 },
  { id: 'bodyguard', name: 'الحارس (Bodyguard)', description: 'يحمي لاعباً من الاستبعاد في هذه الجولة.', team: 'CIVILIAN', ability: 'درع الحماية', isPremium: true, cost: 600 },
  { id: 'sniper', name: 'القناص (Sniper)', description: 'يمكنه استبعاد لاعب يشك بأنه جاسوس، لكنه يخسر إذا أخطأ.', team: 'CIVILIAN', ability: 'طلقة قاضية', isPremium: true, cost: 1200 },
  { id: 'ghost', name: 'الشبح (Ghost)', description: 'لا يمكن التصويت عليه في أول جولتين.', team: 'CIVILIAN', ability: 'الاختفاء', isPremium: true, cost: 800 },
  { id: 'janitor', name: 'المنظف (Janitor)', description: 'يخفي دور اللاعب المستبعد عن الجميع.', team: 'SPY', ability: 'تنظيف الأدلة', isPremium: true, cost: 900 },
  { id: 'godfather', name: 'العراب (Godfather)', description: 'يظهر للمحقق كأنه مواطن عادي.', team: 'SPY', ability: 'التمويه الكامل', isPremium: true, cost: 1500 },
  { id: 'consigliere', name: 'المستشار (Consigliere)', description: 'يمكنه معرفة فئة الكلمة السرية.', team: 'SPY', ability: 'جمع المعلومات', isPremium: true, cost: 1100 },
  { id: 'mayor', name: 'العمدة (Mayor)', description: 'صوته يحتسب بصوتين في مرحلة التصويت.', team: 'CIVILIAN', ability: 'تصويت مضاعف', isPremium: true, cost: 1300 },
  { id: 'fool', name: 'الأحمق (Fool)', description: 'يفوز إذا تم التصويت عليه واستبعاده من اللعبة.', team: 'SPY', ability: 'الاستدراج', isPremium: true, cost: 2000 },
  { id: 'vigilante', name: 'المنتقم (Vigilante)', description: 'يمكنه استبعاد لاعب واحد في أي وقت.', team: 'CIVILIAN', ability: 'انتقام سريع', isPremium: true, cost: 1400 },
  { id: 'blackmailer', name: 'المبتز (Blackmailer)', description: 'يمنع لاعباً من الكلام أو التصويت في جولة واحدة.', team: 'SPY', ability: 'ابتزاز صامت', isPremium: true, cost: 950 },
  { id: 'witness', name: 'الشاهد (Witness)', description: 'يعرف من هو المحقق في بداية اللعبة.', team: 'CIVILIAN', ability: 'الشهادة', isPremium: true, cost: 700 },
  { id: 'bomber', name: 'المفجر (Bomber)', description: 'إذا تم استبعاده، يأخذ معه لاعباً آخر يختاره.', team: 'SPY', ability: 'انفجار أخير', isPremium: true, cost: 1800 },
  { id: 'thief', name: 'اللص (Thief)', description: 'يسرق قدرة لاعب آخر ويستخدمها لنفسه.', team: 'SPY', ability: 'سرقة القدرة', isPremium: true, cost: 1600 },
  { id: 'sheriff', name: 'الشريف (Sheriff)', description: 'يمكنه استبعاد لاعب، لكنه يموت إذا كان الهدف مواطناً.', team: 'CIVILIAN', ability: 'رصاصة العدالة', isPremium: true, cost: 1700 },
  { id: 'executioner', name: 'الجلاد (Executioner)', description: 'لديه هدف محدد يجب عليه إقناع الجميع بالتصويت ضده.', team: 'SPY', ability: 'تلفيق التهمة', isPremium: true, cost: 1350 },
  { id: 'amnesiac', name: 'فاقد الذاكرة (Amnesiac)', description: 'يمكنه اختيار دور لاعب مستبعد ليصبح دوره الجديد.', team: 'CIVILIAN', ability: 'تذكر الماضي', isPremium: true, cost: 1900 },
  { id: 'survivor', name: 'الناجي (Survivor)', description: 'هدفه الوحيد هو البقاء حياً حتى نهاية اللعبة.', team: 'CIVILIAN', ability: 'سترة واقية', isPremium: true, cost: 550 },
  { id: 'serial_killer', name: 'القاتل المتسلسل (Serial Killer)', description: 'يسعى للقضاء على الجميع ليكون الوحيد المتبقي.', team: 'SPY', ability: 'ضربة صامتة', isPremium: true, cost: 2500 },
  { id: 'arsonist', name: 'مهووس الحريق (Arsonist)', description: 'يقوم بوضع علامات على اللاعبين ثم يحرقهم جميعاً.', team: 'SPY', ability: 'إشعال النيران', isPremium: true, cost: 2200 },
  { id: 'werewolf', name: 'المستذئب (Werewolf)', description: 'جاسوس قوي جداً يمكنه استبعاد لاعبين في جولة واحدة.', team: 'SPY', ability: 'التحول المرعب', isPremium: true, cost: 2300 },
  { id: 'vampire', name: 'مصاص الدماء (Vampire)', description: 'يمكنه تحويل مواطن إلى جاسوس مرة واحدة في اللعبة.', team: 'SPY', ability: 'العضة', isPremium: true, cost: 2400 },
  { id: 'escort', name: 'المرافق (Escort)', description: 'يمنع لاعباً من استخدام قدرته في هذه الجولة.', team: 'CIVILIAN', ability: 'تشتيت الانتباه', isPremium: true, cost: 850 },
  { id: 'medium', name: 'الوسيط (Medium)', description: 'يمكنه رؤية آخر كلمة قالها اللاعب المستبعد قبل موته.', team: 'CIVILIAN', ability: 'التواصل الروحي', isPremium: true, cost: 1050 }
];

export const INITIAL_MISSIONS: Mission[] = [
  // Daily Missions (6)
  { id: 'play-daily', description: 'العب 3 جولات', target: 3, current: 0, reward: 50, isCompleted: false, isClaimed: false, period: 'DAILY' },
  { id: 'win-daily', description: 'فز بـ جولة واحدة', target: 1, current: 0, reward: 100, isCompleted: false, isClaimed: false, period: 'DAILY' },
  { id: 'use-ability-daily', description: 'استخدم القدرات مرتين', target: 2, current: 0, reward: 75, isCompleted: false, isClaimed: false, period: 'DAILY' },
  { id: 'spin-daily', description: 'جرب عجلة الحظ مرة واحدة', target: 1, current: 0, reward: 30, isCompleted: false, isClaimed: false, period: 'DAILY' },
  { id: 'add-players-daily', description: 'أضف 5 لاعبين جدد', target: 5, current: 0, reward: 40, isCompleted: false, isClaimed: false, period: 'DAILY' },
  { id: 'change-avatar-daily', description: 'غير صورتك الرمزية 3 مرات', target: 3, current: 0, reward: 25, isCompleted: false, isClaimed: false, period: 'DAILY' },
  { id: 'vote-daily', description: 'شارك في 5 عمليات تصويت اليوم', target: 5, current: 0, reward: 50, isCompleted: false, isClaimed: false, period: 'DAILY' },
  { id: 'chat-daily', description: 'أرسل 10 رسائل في النقاش اليوم', target: 10, current: 0, reward: 30, isCompleted: false, isClaimed: false, period: 'DAILY' },
  
  // Monthly Missions (15)
  { id: 'play-monthly', description: 'العب 50 جولة هذا الشهر', target: 50, current: 0, reward: 1000, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'win-monthly', description: 'فز بـ 20 جولة هذا الشهر', target: 20, current: 0, reward: 2000, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'spin-monthly', description: 'أدر عجلة الحظ 10 مرات', target: 10, current: 0, reward: 500, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'use-ability-monthly', description: 'استخدم القدرات 30 مرة', target: 30, current: 0, reward: 800, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'unlock-role-monthly', description: 'افتح دوراً جديداً', target: 1, current: 0, reward: 1500, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'unlock-cat-monthly', description: 'افتح قائمة كلمات جديدة', target: 1, current: 0, reward: 1200, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'win-spy-monthly', description: 'فز كجاسوس 5 مرات', target: 5, current: 0, reward: 1000, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'win-civ-monthly', description: 'فز كمواطن 10 مرات', target: 10, current: 0, reward: 1000, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'detective-monthly', description: 'استخدم قدرة المحقق 5 مرات', target: 5, current: 0, reward: 600, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'medic-monthly', description: 'استخدم قدرة الطبيب 5 مرات', target: 5, current: 0, reward: 600, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'vote-monthly', description: 'شارك في 40 عملية تصويت', target: 40, current: 0, reward: 400, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'chat-monthly', description: 'أرسل 100 رسالة في النقاش', target: 100, current: 0, reward: 300, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'coins-monthly', description: 'اجمع 2000 عملة هذا الشهر', target: 2000, current: 0, reward: 500, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'perfect-win-monthly', description: 'فز فوزاً مثالياً 3 مرات هذا الشهر', target: 3, current: 0, reward: 1000, isCompleted: false, isClaimed: false, period: 'MONTHLY' },
  { id: 'fast-win-monthly', description: 'فز فوزاً سريعاً 5 مرات هذا الشهر', target: 5, current: 0, reward: 800, isCompleted: false, isClaimed: false, period: 'MONTHLY' },

  // Yearly Missions (35)
  { id: 'play-yearly-1', description: 'العب 100 جولة', target: 100, current: 0, reward: 2000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'play-yearly-2', description: 'العب 250 جولة', target: 250, current: 0, reward: 5000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'play-yearly-3', description: 'العب 500 جولة', target: 500, current: 0, reward: 10000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'play-yearly-4', description: 'العب 1000 جولة', target: 1000, current: 0, reward: 25000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'win-yearly-1', description: 'فز بـ 50 جولة', target: 50, current: 0, reward: 3000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'win-yearly-2', description: 'فز بـ 100 جولة', target: 100, current: 0, reward: 7000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'win-yearly-3', description: 'فز بـ 200 جولة', target: 200, current: 0, reward: 15000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'win-yearly-4', description: 'فز بـ 500 جولة', target: 500, current: 0, reward: 40000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'spin-yearly-1', description: 'أدر العجلة 50 مرة', target: 50, current: 0, reward: 2500, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'spin-yearly-2', description: 'أدر العجلة 100 مرة', target: 100, current: 0, reward: 6000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'ability-yearly-1', description: 'استخدم القدرات 100 مرة', target: 100, current: 0, reward: 3000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'ability-yearly-2', description: 'استخدم القدرات 250 مرة', target: 250, current: 0, reward: 8000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'unlock-all-roles', description: 'افتح جميع الأدوار المميزة', target: 20, current: 0, reward: 20000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'unlock-all-cats', description: 'افتح جميع قوائم الكلمات', target: 10, current: 0, reward: 10000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'coins-yearly-1', description: 'اجمع 5000 عملة', target: 5000, current: 0, reward: 1000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'coins-yearly-2', description: 'اجمع 10000 عملة', target: 10000, current: 0, reward: 2500, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'coins-yearly-3', description: 'اجمع 50000 عملة', target: 50000, current: 0, reward: 10000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'coins-yearly-4', description: 'اجمع 100000 عملة', target: 100000, current: 0, reward: 25000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'spy-master', description: 'فز كجاسوس 50 مرة', target: 50, current: 0, reward: 5000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'civ-hero', description: 'فز كمواطن 100 مرة', target: 100, current: 0, reward: 5000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'perfect-win', description: 'فز دون خسارة أي مواطن (10 مرات)', target: 10, current: 0, reward: 3000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'perfect-win-2', description: 'فز دون خسارة أي مواطن (50 مرة)', target: 50, current: 0, reward: 15000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'fast-win', description: 'فز في أول جولة تصويت (20 مرة)', target: 20, current: 0, reward: 4000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'sniper-pro', description: 'أصب الجاسوس بالقناص 15 مرة', target: 15, current: 0, reward: 2500, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'hacker-pro', description: 'عطل قدرة المحقق 15 مرة', target: 15, current: 0, reward: 2500, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'medic-pro', description: 'أنقذ 20 لاعباً بالطبيب', target: 20, current: 0, reward: 2500, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'detective-pro', description: 'اكشف 20 جاسوساً بالمحقق', target: 20, current: 0, reward: 2500, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'mayor-pro', description: 'استخدم صوت العمدة المرجح 30 مرة', target: 30, current: 0, reward: 2000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'fool-win', description: 'فز كأحمق 10 مرات', target: 10, current: 0, reward: 5000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'bomber-win', description: 'خذ جاسوساً معك بالتفجير 10 مرات', target: 10, current: 0, reward: 3000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'thief-pro', description: 'اسرق 20 قدرة ناجحة', target: 20, current: 0, reward: 3500, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'survivor-pro', description: 'ابق حياً كمتحدث وحيد 10 مرات', target: 10, current: 0, reward: 4000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'serial-killer-pro', description: 'فز كقاتل متسلسل 5 مرات', target: 5, current: 0, reward: 10000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'werewolf-pro', description: 'استخدم قدرة المستذئب المزدوجة 20 مرة', target: 20, current: 0, reward: 5000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
  { id: 'vampire-pro', description: 'حول مواطناً إلى جاسوس 10 مرات', target: 10, current: 0, reward: 6000, isCompleted: false, isClaimed: false, period: 'YEARLY' },
];

export const AVATARS = [
  '👤', '🕵️', '🕵️‍♀️', '👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀', '👨‍🚒', '👩‍🚒', '👮', '👮‍♀️', '👳', '🧕', '🧔', '👶', '👵'
];

export const MOCK_LEADERBOARD = [
  { id: '1', name: 'أحمد', avatar: '🕵️', wins: 150, coins: 12500 },
  { id: '2', name: 'سارة', avatar: '👩‍🔬', wins: 142, coins: 11800 },
  { id: '3', name: 'محمد', avatar: '🧔', wins: 135, coins: 10500 },
  { id: '4', name: 'ليلى', avatar: '👩‍🎨', wins: 128, coins: 9800 },
  { id: '5', name: 'خالد', avatar: '👨‍🚀', wins: 120, coins: 9200 },
  { id: '6', name: 'نورة', avatar: '👩‍💼', wins: 115, coins: 8700 },
  { id: '7', name: 'يوسف', avatar: '👨‍🚒', wins: 108, coins: 8100 },
  { id: '8', name: 'مريم', avatar: '🧕', wins: 102, coins: 7600 },
  { id: '9', name: 'عمر', avatar: '👳', wins: 95, coins: 7100 },
  { id: '10', name: 'هدى', avatar: '👵', wins: 88, coins: 6500 },
];
