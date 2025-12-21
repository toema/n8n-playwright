import { mkdirSync, existsSync, readdirSync, rmSync, cpSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { platform, homedir } from 'os';
import { BrowserType } from '../playwright/config';

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

async function setupBrowsers() {
	try {
		// 1. First log the environment
		console.log('Current working directory:', process.cwd());
		console.log('Operating System:', platform());
		console.log('Node version:', process.version);

		// 2. Determine paths
		const sourcePath = getPlaywrightCachePath();
		const browsersPath = join(__dirname, '..', 'browsers');

		console.log('\nPaths:');
		console.log('Source path:', sourcePath);
		console.log('Destination path:', browsersPath);

		// 3. Check if source exists
		if (!existsSync(sourcePath)) {
			console.log('\nSource path does not exist. Installing Playwright browsers...');
			execSync('npx --yes playwright install', { stdio: 'inherit' });

			// Verify installation succeeded
			if (!existsSync(sourcePath)) {
				throw new Error(`Failed to install browsers. Expected path ${sourcePath} does not exist after installation.`);
			}
		}

		// 4. Clean destination if it exists
		if (existsSync(browsersPath)) {
			console.log('\nCleaning existing browsers directory...');
			rmSync(browsersPath, { recursive: true, force: true });
		}

		// 5. Create fresh browsers directory
		console.log('Creating browsers directory...');
		mkdirSync(browsersPath, { recursive: true });

		// 6. Copy browser files with detailed logging
		console.log('\nCopying browser files...');
		const files = readdirSync(sourcePath);

		for (const file of files) {
			// Only copy browser directories we need
			if (file.startsWith('chromium-') ||
				file.startsWith('firefox-') ||
				file.startsWith('webkit-')) {

				const sourceFull = join(sourcePath, file);
				const destFull = join(browsersPath, file);

				console.log(`Copying ${file}...`);
				cpSync(sourceFull, destFull, { recursive: true });
			}
		}

		// 7. Verify installation
		console.log('\nVerifying installation...');
		const installedFiles = readdirSync(browsersPath);
		console.log('Installed browsers:', installedFiles);

		if (installedFiles.length === 0) {
			throw new Error('No browsers were copied. Installation may have failed.');
		}

		// 8. Verify each browser executable
		const browsers: BrowserType[] = ['chromium', 'firefox', 'webkit'];
		for (const browserType of browsers) {
			const browserDir = installedFiles.find(f => f.startsWith(browserType));

			if (!browserDir) {
				console.log(`\nBrowser ${browserType} not found, installing...`);
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
		const browsersPath = join(__dirname, '..', 'browsers');

		// Set the browsers path for Playwright
		const env = {
			...process.env,
			PLAYWRIGHT_BROWSERS_PATH: browsersPath
		};

		execSync(`npx --yes playwright install ${browserType}`, {
			stdio: 'inherit',
			env
		});
	} catch (error) {
		console.error(`Failed to install ${browserType}:`, error);
	}
}

// Run the setup
console.log('Starting browser setup...\n');
setupBrowsers().catch(error => {
	console.error('Unhandled error:', error);
	process.exit(1);
});
