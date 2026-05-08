chrome.runtime.onInstalled.addListener(() => {
    console.log("KeywordSpy Pro initialized.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'KEYWORDS_EXTRACTED') {
        chrome.storage.local.set({ lastExtraction: request.data }, () => {
            console.log("Intelligence synced for:", request.data.url);
        });
    }
});
