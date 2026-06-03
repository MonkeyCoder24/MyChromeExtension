chrome.webRequest.onBeforeRequest.addListener(
    () => ({ cancel: true }),
    { urls: ['*://*.doubleclick.net/*', '*://*.google-analytics.com/*'] },
    ['blocking']
);