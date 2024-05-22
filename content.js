const contentPort = chrome.runtime.connect({ name: "contentPort" });
let ticketId;
let ticketSubject;

contentPort.postMessage({
    type: "initPort"
});

function getIssueData() {
    ticketId = document.querySelector('.ticket__key-number')?.textContent.trim() || '';
    ticketSubject = document.querySelector('.markdown-body')?.textContent.trim() || '';
}

function executeScript() {
    getIssueData();
    contentPort.postMessage({
        type: "issueData",
        value: {
            ticketId,
            ticketSubject,
        }
    });
}

contentPort.onMessage.addListener(function (msg, sender) {
    if (msg.type === "getIssueData") {
        executeScript();
    }
});

document.addEventListener('DOMContentLoaded', executeScript);
