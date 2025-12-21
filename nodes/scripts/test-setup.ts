import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { platform, homedir } from 'os';

function getPlaywrightCachePath(): string {
    const os = platform();

    if (os === 'win32') {
        return join(process.env.USERPROFILE || '', 'AppData', 'Local', 'ms-playwright');
    } else if (os === 'darwin') {
        // macOS uses Library/Caches instead of .cache
        return join(homedir(), 'Library', 'Caches', 'ms-playwright');
    } else {
        // Linux and other Unix-like systems
        return join(homedir(), '.cache', 'ms-playwright');
    }
}

function testPaths() {
    const sourcePath = getPlaywrightCachePath();

    console.log('Testing paths:');
    console.log('Operating System:', platform());
    console.log('Source path:', sourcePath);
    console.log('Source path exists:', existsSync(sourcePath));

    if (existsSync(sourcePath)) {
        const contents = readdirSync(sourcePath);
        console.log('Source contents:', contents);

        // Show details of each browser
        contents.forEach(item => {
            if (item.startsWith('chromium-') ||
                item.startsWith('firefox-') ||
                item.startsWith('webkit-')) {
                const itemPath = join(sourcePath, item);
                console.log(`\n${item}:`);
                try {
                    const subContents = readdirSync(itemPath);
                    console.log('  Contents:', subContents.slice(0, 5).join(', '),
                               subContents.length > 5 ? '...' : '');
                } catch (e) {
                    console.log('  Error reading:', e.message);
                }
            }
        });
    }
}

function testBrowserVersions() {
    const browsersPath = join(process.cwd(), 'browsers');
    console.log('\n\nTesting browser versions:');
    console.log('Browsers path:', browsersPath);
    console.log('Browsers path exists:', existsSync(browsersPath));

    if (existsSync(browsersPath)) {
        const browsers = readdirSync(browsersPath);
        console.log('Installed browsers:', browsers);

        // Show structure of each browser
        browsers.forEach(browser => {
            const browserPath = join(browsersPath, browser);
            console.log(`\n${browser}:`);
            try {
                const contents = readdirSync(browserPath);
                console.log('  Contents:', contents.join(', '));
            } catch (e) {
                console.log('  Error reading:', e.message);
            }
        });
    }
}

console.log('Running setup tests...\n');
console.log('='.repeat(60));
testPaths();
console.log('\n' + '='.repeat(60));
testBrowserVersions();
console.log('\n' + '='.repeat(60));
