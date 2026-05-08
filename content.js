(function() {
    if (typeof chrome === 'undefined' || !chrome.runtime) return;

    function extract() {
        const isAppStore = window.location.host.includes('apple.com');
        const data = {
            title: document.title,
            url: window.location.href,
            type: isAppStore ? 'App Store' : 'Website',
            timestamp: new Date().toLocaleTimeString(),
            rawKeywords: {}
        };

        const text = document.body.innerText.toLowerCase();
        const tokens = text.match(/\b\w{4,}\b/g) || [];
        const stopwords = ['the', 'and', 'with', 'your', 'from', 'this', 'that', 'apps', 'store', 'apple'];

        tokens.forEach(token => {
            if (!stopwords.includes(token)) {
                data.rawKeywords[token] = (data.rawKeywords[token] || 0) + 1;
            }
        });

        chrome.runtime.sendMessage({ type: 'KEYWORDS_EXTRACTED', data: data });
    }

    setTimeout(extract, 2000);
})();
