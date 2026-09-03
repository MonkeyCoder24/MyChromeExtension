const status = document.getElementById('status');
const tabCount = document.getElementById('tabCount');
const extensionCount = document.getElementById('extensionCount');
const extensionList = document.getElementById('extensionList');

const showStatus = message => {
    status.textContent = message;
};

const clearBrowsingData = () => new Promise(resolve => {
    chrome.browsingData.remove({ since: 0 }, {
        cache: true,
        cookies: true,
        localStorage: true,
        serviceWorkers: true,
        cacheStorage: true,
    }, resolve);
});

const discardInactiveTabs = () => new Promise(resolve => {
    chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
            if (!tab.active && !tab.discarded) {
                chrome.tabs.discard(tab.id);
            }
        });
        resolve();
    });
});

const refreshHealthMonitor = () => {
    chrome.tabs.query({}, tabs => {
        tabCount.textContent = tabs.length;
    });

    if (!chrome.management) {
        extensionCount.textContent = 'N/A';
        extensionList.textContent = 'Extension management is not available in this browser context.';
        return;
    }

    chrome.management.getAll(extensions => {
        extensionCount.textContent = extensions.length;
        renderExtensionList(extensions);
    });
};

const renderExtensionList = extensions => {
    const visibleExtensions = extensions.filter(ext => !ext.isApp && ext.type !== 'theme');
    if (visibleExtensions.length === 0) {
        extensionList.textContent = 'No manageable extensions found.';
        return;
    }

    extensionList.innerHTML = '';
    visibleExtensions.forEach(extension => {
        const row = document.createElement('div');
        row.className = 'extension-row';

        const name = document.createElement('span');
        name.textContent = `${extension.name} ${extension.enabled ? '(enabled)' : '(disabled)'}`;

        const toggle = document.createElement('button');
        toggle.textContent = extension.enabled ? 'Disable' : 'Enable';
        toggle.addEventListener('click', () => {
            chrome.management.setEnabled(extension.id, !extension.enabled, refreshHealthMonitor);
            showStatus(`Updating ${extension.name}…`);
        });

        row.appendChild(name);
        row.appendChild(toggle);
        extensionList.appendChild(row);
    });
};

const runAction = async (label, action) => {
    showStatus(`${label} started...`);
    await action();
    showStatus(`${label} complete.`);
    refreshHealthMonitor();
};

document.getElementById('quickOptimize').addEventListener('click', () => {
    runAction('Quick Optimize', async () => {
        await clearBrowsingData();
        await discardInactiveTabs();
    });
});

document.getElementById('discardTabs').addEventListener('click', () => {
    runAction('Discard Inactive Tabs', discardInactiveTabs);
});

document.getElementById('repairConnection').addEventListener('click', () => {
    runAction('Connection Repair', clearBrowsingData);
});

document.getElementById('performanceBoost').addEventListener('click', () => {
    runAction('Performance Boost', async () => {
        await clearBrowsingData();
        await discardInactiveTabs();
    });
});

document.addEventListener('DOMContentLoaded', refreshHealthMonitor);