const CONFIG = {
    appStoreSelectors: {
        title: 'h1.product-header__title',
        subtitle: 'h2.product-header__subtitle',
        description: '.section__description .section__description-proposal',
        releaseNotes: '.whats-new__content',
        category: '.information-list__item--genre .information-list__item__definition'
    },
    stopWords: new Set(['the', 'and', 'for', 'with', 'your', 'this', 'that', 'from', 'app', 'store', 'apple', 'is', 'in', 'it', 'to', 'of', 'on', 'at', 'by', 'an', 'as', 'be', 'or'])
};

function extractKeywords() {
    const isAppStore = window.location.host === 'apps.apple.com';
    let data = {
        url: window.location.href,
        domain: window.location.host,
        title: document.title,
        type: isAppStore ? 'appstore' : 'web',
        timestamp: Date.now(),
        rawKeywords: {}
    };

    if (isAppStore) {
        processAppStore(data);
    } else {
        processWebsite(data);
    }

    chrome.runtime.sendMessage({ type: 'KEYWORDS_EXTRACTED', data: data });
}

function processAppStore(data) {
    const fields = CONFIG.appStoreSelectors;
    const sources = {
        title: document.querySelector(fields.title)?.innerText || '',
        subtitle: document.querySelector(fields.subtitle)?.innerText || '',
        description: document.querySelector(fields.description)?.innerText || '',
        releaseNotes: document.querySelector(fields.releaseNotes)?.innerText || ''
    };

    Object.entries(sources).forEach(([field, text]) => {
        tokenize(text, field, data.rawKeywords);
    });
}

function processWebsite(data) {
    // Metadata extraction
    const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';
    const h1s = Array.from(document.querySelectorAll('h1')).map(el => el.innerText).join(' ');

    tokenize(document.title, 'meta_title', data.rawKeywords);
    tokenize(metaDesc, 'meta_description', data.rawKeywords);
    tokenize(metaKeywords.replace(/,/g, ' '), 'meta_keywords', data.rawKeywords);
    tokenize(h1s, 'headings', data.rawKeywords);
}

function tokenize(text, field, targetObj) {
    if (!text) return;
    const words = text.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !CONFIG.stopWords.has(w));

    words.forEach(word => {
        if (!targetObj[word]) {
            targetObj[word] = { freq: 0, sources: new Set() };
        }
        targetObj[word].freq++;
        targetObj[word].sources.add(field);
    });
}

// Trigger extraction after page load
window.addEventListener('load', () => {
    setTimeout(extractKeywords, 2000); // Wait for dynamic content
});
