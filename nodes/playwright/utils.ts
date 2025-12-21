import { join } from 'path';
import { BrowserType, browserPaths } from './config';
import { platform } from 'os';
import { readdirSync, existsSync } from 'fs';

export function getBrowserExecutablePath(browserType: BrowserType, basePath: string): string {
    const os = platform();
    const files = readdirSync(basePath);

    // Find any directory that starts with the browser type
    const browserDir = files.find(f => f.startsWith(browserType));
    if (!browserDir) {
        throw new Error(`Browser ${browserType} not found in ${basePath}. Available: ${files.join(', ')}`);
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

    // Handle wildcards in path segments (like webkit-*)
    const resolvedSegments: string[] = [];
    let currentPath = join(basePath, browserDir);

    for (const segment of pathSegments) {
        if (segment.includes('*')) {
            // This is a wildcard - find matching directory
            const pattern = segment.replace('*', '');
            const dirContents = existsSync(currentPath) ? readdirSync(currentPath) : [];
            const match = dirContents.find(f => f.startsWith(pattern));

            if (match) {
                resolvedSegments.push(match);
                currentPath = join(currentPath, match);
            } else {
                resolvedSegments.push(segment); // Keep as-is if no match
                currentPath = join(currentPath, segment);
            }
        } else {
            resolvedSegments.push(segment);
            currentPath = join(currentPath, segment);
        }
    }

    const fullPath = join(basePath, browserDir, ...resolvedSegments);

    // Verify the path exists
    if (!existsSync(fullPath)) {
        throw new Error(
            `Browser executable not found at ${fullPath}\n` +
            `Browser directory: ${join(basePath, browserDir)}\n` +
            `Expected segments: ${pathSegments.join(' > ')}\n` +
            `Resolved path: ${fullPath}`
        );
    }

    return fullPath;
}
