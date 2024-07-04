chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Chat Extension installed');

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
            chrome.sidePanel.open({ tabId: tab.id }).then(() => {
                chrome.tabs.sendMessage(tab.id, {
                    action: "summarizeText",
                    text: info.selectionText
                });
            });
        } else {
            console.error("No text selected");
        }
    }
});
