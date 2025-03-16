import { join } from 'path';
import { BrowserType, browserPaths } from './config';
import { platform } from 'os';
import { readdirSync } from 'fs';

export function getBrowserExecutablePath(browserType: BrowserType, basePath: string): string {
    const os = platform();
    const files = readdirSync(basePath);

    // Find any directory that starts with the browser type
    const browserDir = files.find(f => f.startsWith(browserType));
    if (!browserDir) {
        throw new Error(`Browser ${browserType} not found in ${basePath}`);
    }

    let pathSegments: string[];
    switch (os) {
        case 'win32':
            pathSegments = browserPaths[browserType].windows;
            break;
        case 'linux':
            pathSegments = browserPaths[browserType].linux;
            break;
        case 'darwin':
            pathSegments = browserPaths[browserType].darwin;
            break;
        default:
            throw new Error(`Unsupported operating system: ${os}`);
    }

    return join(basePath, browserDir, ...pathSegments);
}
