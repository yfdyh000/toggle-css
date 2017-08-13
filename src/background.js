var disabledTabIds = [];

function updateIcon(activeTabId) {
    var iconPath;
    if (!activeTabId || disabledTabIds.includes(activeTabId)) {
        iconPath = {
            16: "assets/css-disabled.svg",
            32: "assets/css-disabled.svg"
        };
    } else {
        iconPath = {
            16: "assets/css-enabled.svg",
            32: "assets/css-enabled.svg"
        };
    }

    browser.browserAction.setIcon({
        path: iconPath,
        tabId: activeTabId
    });
}

function tabCssIsDisabled(tabId) {
    return disabledTabIds.includes(tabId);
}

function setTabCssDisabled(tabId, disabled) {
    if (disabled) {
        if (!tabCssIsDisabled(tabId)) {
            disabledTabIds.push(tabId);
        }
    } else {
        // Remove tabId from disabledTabIds
        disabledTabIds.splice(disabledTabIds.indexOf(tabId), 1);
    }
    updateIcon(tabId);
}

function toggleCss(activeTab) {
    if (!activeTab.id) {
        return;
    }

    var disableCss = !tabCssIsDisabled(activeTab.id);
    if (disableCss) {
        setTabCssDisabled(activeTab.id, true);
    } else {
        setTabCssDisabled(activeTab.id, false);
    }

    // Tell the content script to enable/disable CSS
    browser.tabs.sendMessage(activeTab.id, {
        disableCss
    });
}

browser.browserAction.onClicked.addListener(toggleCss);

browser.tabs.onActivated.addListener((activeInfo) => {
    updateIcon(activeInfo.tabId);
});

browser.tabs.onRemoved.addListener((tabId) => {
    setTabCssDisabled(tabId, false);
});

browser.tabs.onReplaced.addListener((tabId) => {
    setTabCssDisabled(tabId, false);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // If the tab finished loading and CSS is supposed to be disabled, tell the
    // tab to disable CSS
    if (changeInfo.status === 'complete') {
        if (tabCssIsDisabled(tabId)) {
            browser.tabs.sendMessage(tabId, {
                disableCss: true
            });
        }
    }
});
