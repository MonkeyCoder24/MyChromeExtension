document.getElementById('clearCache').addEventListener('click', () => {
    chrome.browsingData.remove(
        {since: 0},
        {
            cache: true,
            cookies: true,
            localStorage: true,
        }
    );
    alert('Cache Cleared!');
});

document.getElementById('discardTabs').addEventListener('click', () => {
    chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
            if (!tab.active) {
                chrome.tabs.discard(tab.id);
            }
        });
    });
    alert('Inactive Tabs Discarded!');
});