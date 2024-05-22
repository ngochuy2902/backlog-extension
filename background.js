const ports = {};

chrome.runtime.onConnect.addListener(port => {
    if (port.name == 'popupPort') {
        let popupTabId;
        port.onMessage.addListener(function (msg, sender) {
            popupTabId = msg.tabId;
            
            if (!ports[popupTabId]) {
                ports[popupTabId] = {};
            }
            ports[popupTabId].popupPort = port;
            if (msg.type === 'getIssueData') {
                if (ports[popupTabId].contentPort) {
                    ports[popupTabId].contentPort.postMessage({
                        type: msg.type,
                    });
                }
            }

            if (msg.type === 'issueData') {
                if (ports[popupTabId].popupPort) {
                    ports[popupTabId].popupPort.postMessage({
                        type: msg.type,
                        value: msg.value
                    });
                }
            }
        });
    }

    if (port.name === 'contentPort') {
        const contentTabId = port.sender?.tab?.id;
        if (contentTabId && !ports[contentTabId]) {
            ports[contentTabId] = {};
        }
        ports[contentTabId].contentPort = port;

        port.onMessage.addListener(msg => {
            if (ports[contentTabId].popupPort) {
                ports[contentTabId].popupPort.postMessage({
                    type: msg.type,
                    value: msg.value
                });
            }
        });

        port.onDisconnect.addListener(() => {
            delete ports[contentTabId];
        });
    }
});
