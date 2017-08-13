function toggleCss() {
    alert('Toggling CSS');
}

browser.runtime.onMessage.addListener(toggleCss);
