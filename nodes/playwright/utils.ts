// src/utils.ts
import { join } from 'path';
import { platform } from 'os';
import { browserPaths } from './config';

export function getBrowserExecutablePath(browserType: string, basePath: string): string {
    const os = platform();
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

    return join(basePath, ...pathSegments);
}
