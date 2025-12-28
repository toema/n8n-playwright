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

function checkAndInstallLinuxDependencies(): boolean {
	const os = platform();
	
	// Only run on Linux
	if (os !== 'linux') {
		return true;
	}

	console.log('\n🐧 Linux detected - checking system dependencies...');

	try {
		// Check if we have sudo access
		const hasRoot = process.getuid && process.getuid() === 0;
		
		if (!hasRoot) {
			console.log('⚠️  Not running as root. Attempting to install dependencies with sudo...');
		}

		// Try to use Playwright's built-in dependency installer
		console.log('Installing Playwright system dependencies...');
		
		try {
			execSync('npx playwright install-deps chromium', { 
				stdio: 'inherit',
				encoding: 'utf-8'
			});
			console.log('✅ System dependencies installed successfully!');
			return true;
		} catch (error) {
			console.warn('⚠️  Automatic dependency installation failed.');
			console.log('\n📋 Please install the following dependencies manually:');
			console.log('sudo apt-get update && sudo apt-get install -y \\');
			console.log('    libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \\');
			console.log('    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \\');
			console.log('    libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \\');
			console.log('    libasound2 libatspi2.0-0 libnspr4 libnss3 \\');
			console.log('    libxshmfence1 libglib2.0-0 fonts-liberation');
			console.log('\nOr run: npx playwright install-deps chromium\n');
			
			// Don't fail the installation, just warn
			return false;
		}
	} catch (error) {
		console.error('Error checking Linux dependencies:', error);
		return false;
	}
}

function verifyLinuxDependencies(): void {
	const os = platform();
	
	if (os !== 'linux') {
		return;
	}

	console.log('\n🔍 Verifying Linux dependencies...');

	const requiredLibs = [
		'libatk-1.0.so.0',
		'libatk-bridge-2.0.so.0',
		'libcups.so.2',
		'libnss3.so',
		'libgbm.so.1'
	];

	const missingLibs: string[] = [];

	for (const lib of requiredLibs) {
		try {
			// Try to locate the library
			execSync(`ldconfig -p | grep ${lib}`, { 
				stdio: 'pipe',
				encoding: 'utf-8' 
			});
		} catch (error) {
			missingLibs.push(lib);
		}
	}

	if (missingLibs.length > 0) {
		console.log('⚠️  Missing system libraries detected:');
		missingLibs.forEach(lib => console.log(`   - ${lib}`));
		console.log('\n⚠️  Chromium may fail to launch. Run the following command:');
		console.log('   npx playwright install-deps chromium\n');
	} else {
		console.log('✅ All required system libraries found!');
	}
}

async function setupBrowsers() {
	try {
		// 1. First log the environment
		console.log('Current working directory:', process.cwd());
		console.log('Operating System:', platform());
		console.log('Node version:', process.version);

		// 2. Check and install Linux dependencies if needed
		if (platform() === 'linux') {
			checkAndInstallLinuxDependencies();
		}

		// 3. Determine paths
		const sourcePath = getPlaywrightCachePath();
		const browsersPath = join(__dirname, '..', 'browsers');

		console.log('\nPaths:');
		console.log('Source path:', sourcePath);
		console.log('Destination path:', browsersPath);

		// 4. Check if source exists
		if (!existsSync(sourcePath)) {
			console.log('\nSource path does not exist. Installing Playwright browsers...');
			execSync('npx --yes playwright install', { stdio: 'inherit' });

			// Verify installation succeeded
			if (!existsSync(sourcePath)) {
				throw new Error(`Failed to install browsers. Expected path ${sourcePath} does not exist after installation.`);
			}
		}

		// 5. Clean destination if it exists
		if (existsSync(browsersPath)) {
			console.log('\nCleaning existing browsers directory...');
			rmSync(browsersPath, { recursive: true, force: true });
		}

		// 6. Create fresh browsers directory
		console.log('Creating browsers directory...');
		mkdirSync(browsersPath, { recursive: true });

		// 7. Copy browser files with detailed logging
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

		// 8. Verify installation
		console.log('\nVerifying installation...');
		const installedFiles = readdirSync(browsersPath);
		console.log('Installed browsers:', installedFiles);

		if (installedFiles.length === 0) {
			throw new Error('No browsers were copied. Installation may have failed.');
		}

		// 9. Verify each browser executable
		const browsers: BrowserType[] = ['chromium', 'firefox', 'webkit'];
		for (const browserType of browsers) {
			const browserDir = installedFiles.find(f => f.startsWith(browserType));

			if (!browserDir) {
				console.log(`\nBrowser ${browserType} not found, installing...`);
				await installBrowser(browserType);
			}
		}

		// 10. Final verification for Linux
		if (platform() === 'linux') {
			verifyLinuxDependencies();
		}

		console.log('\n✅ Browser setup completed successfully!');
	} catch (error) {
		console.error('\n❌ Error during browser setup:', error);
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