function toggleCss(request) {
    var i;

    for (i = 0; i < document.styleSheets.length; i++) {
        void(document.styleSheets.item(i).disabled = request.disableCss);
    }
}

browser.runtime.onMessage.addListener(toggleCss);
