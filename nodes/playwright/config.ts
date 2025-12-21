import { BrowserPaths } from './types';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export const browserPaths: BrowserPaths = {
    'chromium': {
        windows: ['chrome-win', 'chrome.exe'],
        linux: ['chrome-linux', 'chrome'],
        darwin: ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium']
    },
    'firefox': {
        windows: ['firefox', 'firefox.exe'],
        linux: ['firefox', 'firefox'],
        darwin: ['firefox', 'Firefox.app', 'Contents', 'MacOS', 'firefox']
    },
    'webkit': {
        windows: ['webkit-*', 'Playwright.exe'],
        linux: ['webkit-*', 'minibrowser-gtk', 'pw_run.sh'],
        darwin: ['webkit-*', 'Playwright.app', 'Contents', 'MacOS', 'Playwright']
    }
};
