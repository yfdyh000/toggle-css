var disabledTabIds = [];

function updateIcon() {
    browser.tabs.query({
            active: true,
            currentWindow: true
        })
        .then((tabs) => {
            tabs.forEach((tab) => {
                var iconTitle;
                var iconPath;
                if (disabledTabIds.includes(tab.id)) {
                    iconPath = {
                        "16": "assets/css-disabled.svg",
                        "32": "assets/css-disabled.svg",
                        "64": "assets/css-disabled.svg"
                    };
                    iconTitle = "Click to enable CSS";
                } else {
                    iconPath = {
                        "16": "assets/css-enabled.svg",
                        "32": "assets/css-enabled.svg",
                        "64": "assets/css-enabled.svg"
                    };
                    iconTitle = "Click to disable CSS";
                }

                browser.browserAction.setIcon({
                    path: iconPath,
                    tabId: tab.id
                });
                browser.browserAction.setTitle({
                    title: iconTitle,
                    tabId: tab.id
                });
            });
        })
        .catch(() => {
            // Ignore
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
        var idx = disabledTabIds.indexOf(tabId);

        while (idx !== -1) {
            disabledTabIds.splice(idx, 1);
            idx = disabledTabIds.indexOf(tabId);
        }
    }
    updateIcon();
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
        })
        .catch(() => {
            // Disabling the CSS can fail if the tab is not on a webpage
            // Ignore the error - when the tab loads a webpage, disable the
            // CSS at that time
        });
}

browser.browserAction.onClicked.addListener((activeTab) => {
    toggleCss(activeTab);

    console.log('Button clicked for tab: ' + activeTab.id);
    console.log('Disabled tab IDs: [' + disabledTabIds.join(', ') + ']');
});

browser.tabs.onActivated.addListener((activeInfo) => {
    updateIcon();

    console.log('Activated tab: ' + activeInfo.tabId);
    console.log('Disabled tab IDs: [' + disabledTabIds.join(', ') + ']');
});

browser.tabs.onRemoved.addListener((tabId) => {
    setTabCssDisabled(tabId, false);

    console.log('Removed tab: ' + tabId);
    console.log('Disabled tab IDs: [' + disabledTabIds.join(', ') + ']');
});

browser.tabs.onReplaced.addListener((tabId) => {
    setTabCssDisabled(tabId, false);

    console.log('Replaced tab: ' + tabId);
    console.log('Disabled tab IDs: [' + disabledTabIds.join(', ') + ']');
});

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // If the tab finished loading and CSS is supposed to be disabled, tell the
    // tab to disable CSS
    if (changeInfo.status === 'complete') {
        if (tabCssIsDisabled(tabId)) {
            browser.tabs.sendMessage(tabId, {
                    disableCss: true
                })
                .catch(() => {
                    // Disabling the CSS can fail if the tab is not on a webpage
                    // Ignore the error - when the tab loads a webpage, disable the
                    // CSS at that time
                });
        }
    }

    updateIcon();
    console.log('Updated tab: ' + tabId);
    console.log('Disabled tab IDs: [' + disabledTabIds.join(', ') + ']');
});

browser.windows.onFocusChanged.addListener((windowId) => {
    updateIcon();

    console.log('Changed focus to window' + windowId);
    console.log('Disabled tab IDs: [' + disabledTabIds.join(', ') + ']');
})
