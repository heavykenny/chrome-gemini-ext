chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        "id": "summarize-selection",
        "title": "Summarize Selection",
        "contexts": ["selection"]
    });
});

chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ tabId: tab.id });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize-selection") {
        if (info.selectionText) {
            chrome.sidePanel.open({ tabId: tab.id })
                .then(() => {
                    return new Promise(resolve => setTimeout(resolve, 500)); // Wait for 500ms
                })
                .then(() => {
                    return chrome.runtime.sendMessage({
                        action: "summarizeText",
                        text: info.selectionText
                    });
                });
        } else {
            console.error("No text selected");
        }
    }
});
