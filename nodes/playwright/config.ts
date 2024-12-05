import { BrowserPaths } from './types';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export const browserVersions: Record<BrowserType, string> = {
    chromium: '1140',
    firefox: '1465',
    webkit: '2083'
};
export function matchBrowserVersion(folderName: string, browserType: BrowserType): boolean {
    const version = browserVersions[browserType];
    // Handle partial version matches and different formats
    return folderName.startsWith(`${browserType}-`) &&
        folderName.includes(version.substring(0, 4)); // Match first 4 digits
}


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
