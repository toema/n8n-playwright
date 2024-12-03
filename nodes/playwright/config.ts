import { BrowserPaths } from './types';

export const browserVersions = {
    chromium: '1140',
    firefox: '1465',
    webkit: '2083'
};

export const browserPaths: BrowserPaths = {
    'chromium': {
        windows: [`chromium-${browserVersions.chromium}`, 'chrome-win', 'chrome.exe'],
        linux: [`chromium-${browserVersions.chromium}`, 'chrome-linux', 'chrome'],
        darwin: [`chromium-${browserVersions.chromium}`, 'chrome-mac', 'Chrome']
    },
    'firefox': {
        windows: [`firefox-${browserVersions.firefox}`, 'firefox', 'firefox.exe'],
        linux: [`firefox-${browserVersions.firefox}`, 'firefox', 'firefox'],
        darwin: [`firefox-${browserVersions.firefox}`, 'firefox', 'Firefox']
    },
    'webkit': {
        windows: [`webkit-${browserVersions.webkit}`, 'Playwright.exe'],
        linux: [`webkit-${browserVersions.webkit}`, 'playwright-webkit'],
        darwin: [`webkit-${browserVersions.webkit}`, 'Playwright']
    }
};
