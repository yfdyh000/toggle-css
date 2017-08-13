function toggleCss() {
    browser.tabs.query({
            active: true,
            currentWindow: true
        })
        .then((tabs) => {
            tabs.forEach((tab) => {
                // Need to tell the tab whether to enable or disable CSS
                browser.tabs.sendMessage(tab.id, {
                    disableCss: true
                });
            });
        });
}

browser.browserAction.onClicked.addListener(toggleCss);
