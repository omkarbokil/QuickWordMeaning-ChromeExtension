document.addEventListener('click', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        chrome.runtime.sendMessage({ type: 'TEXT_SELECTED', text: selectedText });
    }
});