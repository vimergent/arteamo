// Dynamic SEO Meta Tags Generator
// Supports all languages and generates appropriate meta tags

const seoMeta = {
    // SEO data for each language
    data: {
        bg: {
            title: "Интериорен дизайн Варна | Studio Arteamo - Луксозен дизайн от 2008",
            description: "Studio Arteamo - водещо студио за интериорен дизайн във Варна. Създаваме луксозни интериори за домове и офиси. ✓ 15+ години опит ✓ Награди ✓ Безплатна консултация",
            keywords: "интериорен дизайн варна, интериорен дизайнер варна, луксозен интериорен дизайн, студио артеамо, дизайн на апартаменти варна, офис дизайн варна, интериор варна, дизайнерско студио варна",
            ogTitle: "Интериорен дизайн Варна | Studio Arteamo",
            ogDescription: "Луксозен интериорен дизайн във Варна. Създаваме уникални пространства от 2008 година.",
            language: "bg",
            locale: "bg_BG"
        },
        en: {
            title: "Interior Design Varna | Studio Arteamo - Luxury Design Since 2008",
            description: "Studio Arteamo - leading interior design studio in Varna. Creating luxury interiors for homes and offices. ✓ 15+ years experience ✓ Awards ✓ Free consultation",
            keywords: "interior design varna, interior designer varna, luxury interior design, studio arteamo, apartment design varna, office design varna, interior varna, design studio varna",
            ogTitle: "Interior Design Varna | Studio Arteamo",
            ogDescription: "Luxury interior design in Varna. Creating unique spaces since 2008.",
            language: "en",
            locale: "en_US"
        },
        ru: {
            title: "Дизайн интерьера Варна | Studio Arteamo - Люксовый дизайн с 2008",
            description: "Studio Arteamo - ведущая студия дизайна интерьера в Варне. Создаем роскошные интерьеры для домов и офисов. ✓ 15+ лет опыта ✓ Награды ✓ Бесплатная консультация",
            keywords: "дизайн интерьера варна, дизайнер интерьера варна, роскошный дизайн интерьера, студио артеамо, дизайн квартир варна, дизайн офиса варна, интерьер варна, дизайн студия варна",
            ogTitle: "Дизайн интерьера Варна | Studio Arteamo",
            ogDescription: "Роскошный дизайн интерьера в Варне. Создаем уникальные пространства с 2008 года.",
            language: "ru",
            locale: "ru_RU"
        },
        es: {
            title: "Diseño de Interiores Varna | Studio Arteamo - Diseño de Lujo Desde 2008",
            description: "Studio Arteamo - estudio líder de diseño de interiores en Varna. Creando interiores de lujo para hogares y oficinas. ✓ 15+ años de experiencia ✓ Premios ✓ Consulta gratuita",
            keywords: "diseño de interiores varna, diseñador de interiores varna, diseño de interiores de lujo, studio arteamo, diseño de apartamentos varna, diseño de oficinas varna, interior varna, estudio de diseño varna",
            ogTitle: "Diseño de Interiores Varna | Studio Arteamo",
            ogDescription: "Diseño de interiores de lujo en Varna. Creando espacios únicos desde 2008.",
            language: "es",
            locale: "es_ES"
        },
        he: {
            title: "עיצוב פנים וארנה | Studio Arteamo - עיצוב יוקרתי מאז 2008",
            description: "Studio Arteamo - סטודיו מוביל לעיצוב פנים בוארנה. יוצרים פנים יוקרתיים לבתים ומשרדים. ✓ 15+ שנות ניסיון ✓ פרסים ✓ ייעוץ חינם",
            keywords: "עיצוב פנים וארנה, מעצב פנים וארנה, עיצוב פנים יוקרתי, סטודיו ארטאמו, עיצוב דירות וארנה, עיצוב משרדים וארנה, פנים וארנה, סטודיו עיצוב וארנה",
            ogTitle: "עיצוב פנים וארנה | Studio Arteamo",
            ogDescription: "עיצוב פנים יוקרתי בוארנה. יוצרים חללים ייחודיים מאז 2008.",
            language: "he",
            locale: "he_IL"
        },
        zh: {
            title: "瓦尔纳室内设计 | Studio Arteamo - 2008年以来的奢华设计",
            description: "Studio Arteamo - 瓦尔纳领先的室内设计工作室。为家庭和办公室创造奢华的室内设计。✓ 15年以上经验 ✓ 获奖 ✓ 免费咨询",
            keywords: "瓦尔纳室内设计, 瓦尔纳室内设计师, 豪华室内设计, studio arteamo, 瓦尔纳公寓设计, 瓦尔纳办公室设计, 瓦尔纳室内, 瓦尔纳设计工作室",
            ogTitle: "瓦尔纳室内设计 | Studio Arteamo",
            ogDescription: "瓦尔纳的豪华室内设计。自2008年以来创造独特的空间。",
            language: "zh",
            locale: "zh_CN"
        }
    },

    // Update meta tags based on language
    updateMetaTags(lang) {
        const data = this.data[lang] || this.data.en;
        
        // Update title
        document.title = data.title;
        
        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = data.description;
        
        // Update meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) metaKeywords.content = data.keywords;
        
        // Update language
        document.documentElement.lang = data.language;
        const metaLang = document.querySelector('meta[name="language"]');
        if (metaLang) metaLang.content = data.language.charAt(0).toUpperCase() + data.language.slice(1);
        
        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.content = data.ogTitle;
        
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.content = data.ogDescription;
        
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) ogLocale.content = data.locale;
        
        // Update Twitter tags
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) twitterTitle.content = data.ogTitle;
        
        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        if (twitterDesc) twitterDesc.content = data.ogDescription;
        
        // Update canonical with language parameter
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            const baseUrl = 'https://studio-arteamo.netlify.app';
            canonical.href = lang === 'bg' ? baseUrl : `${baseUrl}?lang=${lang}`;
        }
    },

    // Initialize on page load
    init() {
        // Get current language
        const currentLang = localStorage.getItem('selectedLanguage') || 'bg';
        
        // Update meta tags
        this.updateMetaTags(currentLang);
        
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.updateMetaTags(e.detail || currentLang);
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => seoMeta.init());
} else {
    seoMeta.init();
}