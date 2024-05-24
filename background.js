const POPUP_PORT_NAME = 'popupPort';
const CONTENT_PORT_NAME = 'contentPort';
const MSG_TYPE_GET_ISSUE_DATA = 'getIssueData';
const MSG_TYPE_ISSUE_DATA = 'issueData';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id === chrome.runtime.id) {
        // Message is from our own extension (either popup or background)
        if (sender.tab) {
            chrome.runtime.sendMessage(message)
        } else {
            console.log('Received message from background script:', message);
            // Handle message from background script
            // ...
        }
    }
    return true;
});
