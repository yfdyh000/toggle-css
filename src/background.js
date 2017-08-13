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

function handleTabUpdate(tabId) {
    // TODO: Reset tab state if URL changed
    // setTabCssDisabled(tabId, false);
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

browser.tabs.onRemoved.addListener(resetTabState);

browser.tabs.onActivated.addListener(updateIcon);
browser.tabs.onReplaced.addListener(updateIcon);

browser.tabs.onUpdated.addListener(handleTabUpdate);
