const btnGetData = document.getElementById('get-data');
const btnGitBranch = document.getElementById('btn-git-branch');
const btnGitCommitMsg = document.getElementById('btn-git-commit-msg');
const btnGitCheckoutCmd = document.getElementById('btn-git-checkout-cmd');
const btnGitCommitCmd = document.getElementById('btn-git-commit-cmd');

const radioType_bug = document.getElementById('radioType_bug');
const radioType_feature = document.getElementById('radioType_feature');

const handleRadioChange = e => {
    const issueType = e.target.value;
    console.log(' handleRadioChange ', issueType);
    chrome.storage.local.set({ issueType });

    chrome.storage.local.get(["ticketId", "ticketSubject"]).then(({ ticketId, ticketSubject }) => {
        updateSummary(issueType, ticketId, ticketSubject);
    });
}
radioType_bug.addEventListener('change', handleRadioChange);
radioType_feature.addEventListener('change', handleRadioChange);

const inputGitBranch = document.getElementById('git-branch');
const inputGitCommitMsg = document.getElementById('git-commit-msg');
const inputGitCheckoutCmd = document.getElementById('git-checkout-cmd');
const inputGitCommitCmd = document.getElementById('git-commit-cmd');

let issueType = 'feature';

function sendMessageToContentScript(msg) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            let activeTab = tabs[0];
            msg.tabId = activeTab.id;
            // Send the message
            chrome.tabs.sendMessage(activeTab.id, msg, function (response) {
                console.log(response);
            });
        }
    });
}
chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.id === chrome.runtime.id) {
        // Message is from our own extension (either popup or background)
        if (sender.tab) {
            console.log('Received message from content script:', message);
            // Handle message from content script
        } else {
            console.log('Received message from background script:', message);
            // Handle message from background script
            if (message.type == "issueData") {
                const { ticketId, ticketSubject } = message.value;
                chrome.storage.local.set({ ticketId, ticketSubject });
                chrome.storage.local.get(["issueType"]).then(({ issueType }) => {
                    updateSummary(issueType, ticketId, ticketSubject);
                });
            }
        }
    }
    return true; // Keeps the message channel open for asynchronous responses
});

chrome.storage.local.get(["issueType", "ticketId", "ticketSubject"]).then(({ issueType, ticketId, ticketSubject }) => {
    if (!issueType) {
        issueType = 'feature';
    }
    updateSummary(issueType, ticketId, ticketSubject);
});

btnGetData.onclick = () => {
    sendMessageToContentScript({
        type: "getIssueData",
    });
};

btnGitBranch.onclick = () => copyToClipboard(inputGitBranch.value);
btnGitCommitMsg.onclick = () => copyToClipboard(inputGitCommitMsg.value);
btnGitCheckoutCmd.onclick = () => copyToClipboard(inputGitCheckoutCmd.value);
btnGitCommitCmd.onclick = () => copyToClipboard(inputGitCommitCmd.value);

function getStorageData() {
    chrome.storage.local.get(["issueType", "ticketId", "ticketSubject"]).then(({ issueType, ticketId, ticketSubject }) => {
        return { issueType, ticketId, ticketSubject };
    });
}

function updateIssueType(issueType) {
    chrome.storage.local.set({ issueType });

    chrome.storage.local.get(["ticketId", "ticketSubject"]).then(({ ticketId, ticketSubject }) => {
        updateSummary(issueType, ticketId, ticketSubject);
    });
}

function updateSummary(issueType, ticketId, subjectRaw) {
    const { gitBranch, gitCommitMsg, gitCheckoutCmd, gitCommitCmd } = getIssueData(issueType, ticketId, subjectRaw);
    inputGitBranch.value = gitBranch;
    inputGitCommitMsg.value = gitCommitMsg;
    inputGitCheckoutCmd.value = gitCheckoutCmd;
    inputGitCommitCmd.value = gitCommitCmd;
}

function getIssueData(issueType, ticketId, subjectRaw) {
    if (!issueType || !ticketId || !subjectRaw) {
        return {
            gitBranch: '',
            gitCommitMsg: '',
            gitCheckoutCmd: '',
            gitCommitCmd: '',
        };
    }
    const subject = subjectRaw.replace(/\[.*\]/, '').replace(/^[^a-zA-Z0-9]+/, '').split(' ').filter(e => e).join(' ');
    const subjectLowcase = subjectRaw.replace(/\[.*\]/, '').replace(/[^a-zA-Z0-9\s]/g, '').split(' ').filter(e => e).map(e => e.toLowerCase()).join('_');
    const gitBranch = `${issueType}/${ticketId}-${subjectLowcase}`;
    const gitCommitMsg = `[${ticketId}]: ${subject}`;
    const gitCheckoutCmd = `git checkout -b ${issueType}/${ticketId}-${subjectLowcase}`;
    const gitCommitCmd = `git add . && git commit -m "[${ticketId}] ${subject}"`;

    return {
        gitBranch,
        gitCommitMsg,
        gitCheckoutCmd,
        gitCommitCmd,
    };
}

function copyToClipboard(value) {
    navigator.clipboard.writeText(value).then(function () { }, function (err) {
        console.error('Could not copy text: ', err);
    });
}
