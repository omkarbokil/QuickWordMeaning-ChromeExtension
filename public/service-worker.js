let selectedText = '';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TEXT_SELECTED') {
        selectedText = message.text;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_SELECTED_TEXT') {
        sendResponse({ text: selectedText });
    }
});