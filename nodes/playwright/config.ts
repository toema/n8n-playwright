import { BrowserPaths } from './types';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';


export const browserPaths: BrowserPaths = {
    'chromium': {
        windows: ['chrome-win', 'chrome.exe'],
        linux: ['chrome-linux', 'chrome'],
        darwin: ['chrome-mac', 'Chrome']
    },
    'firefox': {
        windows: ['firefox', 'firefox.exe'],
        linux: ['firefox', 'firefox'],
        darwin: ['firefox', 'Firefox']
    },
    'webkit': {
        windows: ['Playwright.exe'],
        linux: ['playwright-webkit'],
        darwin: ['Playwright']
    }
};