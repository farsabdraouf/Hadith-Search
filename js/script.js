        async function searchHadith(query) {
            const dorarElement = document.getElementById('dorar');
            dorarElement.innerHTML = '<p class="loading">جاري البحث...</p>';

            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://dorar.net/dorar_api.json?skey=${query}`)}`);
                const data = await response.json();
                const parsedData = JSON.parse(data.contents);

                if (parsedData.ahadith && parsedData.ahadith.result) {
                    displayAhadith(parsedData.ahadith.result);
                } else {
                    dorarElement.innerHTML = '<p>لم يتم العثور على نتائج.</p>';
                }
            } catch (error) {
                console.error('Error fetching hadith:', error);
                dorarElement.innerHTML = '<p>حدث خطأ أثناء البحث. الرجاء المحاولة مرة أخرى.</p>';
            }
        }

        function displayAhadith(ahadithText) {
            const dorarElement = document.getElementById('dorar');
            dorarElement.innerHTML = '';
        
            const ahadithArray = ahadithText.split('--------------').slice(0, 30);
        
            ahadithArray.forEach(hadithBlock => {
                if (hadithBlock.trim()) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = hadithBlock.trim();
        
                    const hadithTextElement = tempDiv.querySelector('.hadith');
                    const hadithInfoElement = tempDiv.querySelector('.hadith-info');
        
                    if (hadithTextElement && hadithInfoElement) {
                        const hadithElement = document.createElement('div');
                        hadithElement.className = 'hadith';
        
                        const hadithText = hadithTextElement.innerHTML.trim();
                        const hadithInfo = hadithInfoElement.innerHTML.trim();
        
                        const status = classifyHadith(hadithInfo);

            hadithElement.classList.add(status);

            hadithElement.innerHTML = `
                <p class="hadith-text">${hadithText}</p>
                <div class="hadith-info">${hadithInfo}</div>
                <div class="hadith-status">${status}</div>
            `;
            dorarElement.appendChild(hadithElement);
        }}
    });

    const searchInput = document.getElementById('search-input').value; // الحصول على قيمة المدخل

    const moreButton = document.createElement('a');
    moreButton.href = `https://dorar.net/hadith/search?q=${encodeURIComponent(searchInput)}`; // إضافة النص المدخل إلى الرابط
    moreButton.textContent = "المزيد";
    moreButton.className = 'more-button';
    dorarElement.appendChild(moreButton);

    applyFilter();
}
function classifyHadith(hadithInfo) {
    // تنظيف النص من علامات HTML وعلامات الترقيم
    const cleanText = hadithInfo.replace(/<[^>]*>?/gm, '').replace(/[،.؟!]/g, ' ').toLowerCase();

    // أنماط تشير إلى صحة الحديث
    const sahihPatterns = [
        /صحيح/,
        /متفق عليه/,
        /رواه البخاري/,
        /رواه مسلم/,
        /على شرط (البخاري|مسلم)/,
        /إسناده (صحيح|جيد|قوي)/,
        /حسن/,
        /صالح/,
        /ثابت/,
        /ثقات/,
        /محفوظ/,
        /معروف/,
        /مستقيم/,
        /مستوي/,
        /قوي/,
        /حجة/,
        /صحاح/,
        /مشهور/,
        /أصل من أصول الشريعة/,
        /روي من طرق كثيرة/,
        /سكت عنه .* دليلا على صحته/,
        /رجاله ثقات/,
        /إسناده متصل/,
        /على شرط الشيخين/,
        /صححه (الحاكم|الذهبي|الألباني|ابن حبان)/
    ];

    // أنماط تشير إلى ضعف الحديث
    const dhaifPatterns = [
        /ضعيف/,
        /منكر/,
        /لم يصح/,
        /لا يصح/,
        /باطل/,
        /موضوع/,
        /ليس بثابت/,
        /مرسل/,
        /لا يحتج به/,
        /فيه.*ضعيف/,
        /إسناده ضعيف/,
        /ليس بالقوي/,
        /لين/,
        /معضل/,
        /معلق/,
        /منقطع/,
        /شاذ/,
        /متروك/,
        /لا أصل له/,
        /في إسناده/,
        /محال/,
        /موقوف/,
        /لم يرو/,
        /مضطرب/,
        /مصحف/,
        /مدرج/,
        /مقلوب/,
        /مجهول/,
        /معلل/,
        /مدلس/,
        /له علة/,
        /تفرد به/,
        /غريب جدا/,
        /لا يتابع عليه/,
        /لا أعرفه/,
        /سرقه/,
        /منكر الحديث/,
        /متهم بالكذب/,
        /فيه نظر/,
        /ضعفه (البخاري|مسلم|أحمد|الذهبي|الألباني)/,
        /تفرد به/,
        /لم يثبت/
    ];

    // دالة مساعدة للبحث عن الأنماط
    function checkPatterns(text, patterns) {
        return patterns.some(pattern => pattern.test(text));
    }

    // البحث عن كلمات مفتاحية في نص الحكم على الحديث
    if (cleanText.includes('خلاصة حكم المحدث')) {
        const judgmentText = cleanText.split('خلاصة حكم المحدث:')[1].trim();
        
        if (checkPatterns(judgmentText, sahihPatterns)) {
            return 'sahih';
        }
        
        if (checkPatterns(judgmentText, dhaifPatterns)) {
            return 'dhaif';
        }

        // التعامل مع الحالات الخاصة
        if (judgmentText.includes('فيه') && checkPatterns(judgmentText, dhaifPatterns)) {
            return 'dhaif';
        }

        if (judgmentText.includes('تفرد به') || judgmentText.includes('لم يثبت')) {
            return 'dhaif';
        }
    }

    // إذا لم يتم العثور على حكم واضح، نبحث في النص الكامل
    if (checkPatterns(cleanText, sahihPatterns) && !checkPatterns(cleanText, dhaifPatterns)) {
        return 'sahih';
    }

    if (checkPatterns(cleanText, dhaifPatterns)) {
        return 'dhaif';
    }

    // التعامل مع حالات خاصة إضافية
    if (cleanText.includes('سكت عنه') && cleanText.includes('صالح')) {
        return 'sahih';
    }

    if (cleanText.includes('إسناده حسن')) {
        return 'sahih';
    }

    if (cleanText.includes('تفرد به') || cleanText.includes('لم يثبت')) {
        return 'dhaif';
    }

    // إذا وجدنا اسم راوٍ مع وصف ضعيف، نصنف الحديث كضعيف
    const weakNarrators = ['مصعب بن ثابت', 'عبد الله بن عامر بن الهاد'];
    if (weakNarrators.some(narrator => cleanText.includes(narrator) && cleanText.includes('ضعيف'))) {
        return 'dhaif';
    }

    // إذا لم يتم العثور على أي نمط، نعتبره غير معروف
    return 'unknown';
}

        function applyFilter() {
            const filterValue = document.getElementById('filter-select').value;
            const hadithElements = document.querySelectorAll('.hadith');

            hadithElements.forEach(hadith => {
                if (filterValue === 'all') {
                    hadith.style.display = 'block';
                } else if (filterValue === 'sahih' && hadith.classList.contains('sahih')) {
                    hadith.style.display = 'block';
                } else if (filterValue === 'dhaif' && hadith.classList.contains('dhaif')) {
                    hadith.style.display = 'block';
                } else {
                    hadith.style.display = 'none';
                }
            });
        }

        document.getElementById('search-button').addEventListener('click', function() {
            const searchTerm = document.getElementById('search-input').value;
            if (searchTerm) {
                searchHadith(searchTerm);
            }
        });

        document.getElementById('search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value;
                if (searchTerm) {
                    searchHadith(searchTerm);
                }
            }
        });

        document.getElementById('filter-select').addEventListener('change', applyFilter);
        // الحصول على الزر
var mybutton = document.getElementById("scrollToTopBtn");

// عند التمرير للأسفل بمقدار 20px من أعلى الصفحة، يظهر الزر
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.classList.add("show");
    } else {
        mybutton.classList.remove("show");
    }
}

// عند الضغط على الزر، يتم الصعود إلى أعلى الصفحة
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// وظيفة لتبديل الوضع الداكن والفاتح
function toggleTheme() {
    const body = document.body;
    const pageWrap = document.getElementById('page-wrap');
    const themeToggleButton = document.getElementById('theme-toggle');
    const isDarkMode = body.classList.contains('dark-mode');

    if (isDarkMode) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        pageWrap.classList.remove('dark-mode');
        pageWrap.classList.add('light-mode');
        themeToggleButton.textContent = '🌙';
        // تخزين الوضع الفاتح في التخزين المحلي
        localStorage.setItem('dark-mode', 'false');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        pageWrap.classList.remove('light-mode');
        pageWrap.classList.add('dark-mode');
        themeToggleButton.textContent = '🌞';
        // تخزين الوضع الداكن في التخزين المحلي
        localStorage.setItem('dark-mode', 'true');
    }
}

// تفعيل الوضع المظلم عند تحميل الصفحة بناءً على التخزين المحلي
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('dark-mode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('page-wrap').classList.add('dark-mode');
        document.getElementById('theme-toggle').textContent = '🌞'; // تغيير الرمز إلى الشمس
    } else {
        document.body.classList.add('light-mode');
        document.getElementById('page-wrap').classList.add('light-mode');
        document.getElementById('theme-toggle').textContent = '🌙'; // تغيير الرمز إلى الهلال
    }
});

// إضافة مستمع للحدث لزر تبديل الموضوع
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// وظيفة لتحديد ما إذا كان الزر يجب أن يكون مرئيًا
function handleScroll() {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (window.scrollY === 0) {
        themeToggleButton.classList.remove('hidden');
    } else {
        themeToggleButton.classList.add('hidden');
    }
}

// إضافة مستمع لحدث التمرير
window.addEventListener('scroll', handleScroll);

// إضافة مستمع لزر التبديل
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// تعيين الحالة الأولية للزر عند تحميل الصفحة
handleScroll();

// في ملف JavaScript الرئيسي
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }