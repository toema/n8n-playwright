// nodes/scripts/setup-browsers.ts
import { mkdirSync, existsSync, readdirSync, cpSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { platform } from 'os';
import { BrowserType } from '../playwright/config';

async function setupBrowsers() {
    try {
        console.log('Current working directory:', process.cwd());
        console.log('Operating System:', platform());
        console.log('Node version:', process.version);

        const os = platform();
        const sourcePath = os === 'win32'
            ? join(process.env.USERPROFILE || '', 'AppData', 'Local', 'ms-playwright')
            : join(process.env.HOME || '', '.cache', 'ms-playwright');

        const browsersPath = join(__dirname, '..', 'browsers');

        console.log('\nPaths:');
        console.log('Source path:', sourcePath);
        console.log('Destination path:', browsersPath);

        if (!existsSync(sourcePath)) {
            console.log('\nInstalling Playwright browsers...');
            execSync('npx --yes playwright install', { stdio: 'inherit' });
        }

        if (existsSync(browsersPath)) {
            console.log('\nCleaning existing browsers directory...');
            rmSync(browsersPath, { recursive: true, force: true });
        }

        console.log('Creating browsers directory...');
        mkdirSync(browsersPath, { recursive: true });

        console.log('\nCopying browser files...');
        const files = readdirSync(sourcePath);

        for (const file of files) {
            if (file.startsWith('chromium') ||
                file.startsWith('firefox') ||
                file.startsWith('webkit')) {

                const sourceFull = join(sourcePath, file);
                const destFull = join(browsersPath, file);

                console.log(`Copying ${file}...`);
                cpSync(sourceFull, destFull, { recursive: true });
            }
        }

        console.log('\nVerifying installation...');
        const installedFiles = readdirSync(browsersPath);
        console.log('Installed browsers:', installedFiles);

        const browsers: BrowserType[] = ['chromium', 'firefox', 'webkit'];
        for (const browserType of browsers) {
            const browserDir = installedFiles.find(f => f.startsWith(browserType));

            if (!browserDir) {
                console.log(`\nInstalling ${browserType}...`);
                await installBrowser(browserType);
            }
        }

        console.log('\nBrowser setup completed successfully!');
    } catch (error) {
        console.error('\nError during browser setup:', error);
        process.exit(1);
    }
}

export async function installBrowser(browserType: BrowserType) {
    try {
        console.log(`Installing ${browserType}...`);
        execSync(`npx --yes playwright install ${browserType}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to install ${browserType}:`, error);
    }
}

console.log('Starting browser setup...\n');
setupBrowsers().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
