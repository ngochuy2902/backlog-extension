chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id === chrome.runtime.id) {
        if (sender.tab) {
            console.log('Received message from tab script:', message);
        } else {
            console.log('Received message from background script:', message);
            if (message.type === "getIssueData") {
                executeScript(sendResponse);
            }
        }
    }
});

function getIssueData() {
    ticketId = document.querySelector('.ticket__key-number')?.textContent.trim() || '';
    ticketSubject = document.querySelector('.markdown-body')?.textContent.trim() || '';
    return { ticketId, ticketSubject };
}

function executeScript(sendResponse) {
    chrome.runtime.sendMessage({
        type: "issueData",
        value: getIssueData()
    })
}