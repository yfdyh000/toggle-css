function toggleCss(request) {
    for (let s of document.styleSheets) {
        s.disabled = request.disableCss;
    }
}

browser.runtime.onMessage.addListener(toggleCss);
