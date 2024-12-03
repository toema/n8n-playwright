import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { platform } from 'os';

function testPaths() {
    const os = platform();
    const sourcePath = os === 'win32'
        ? join(process.env.USERPROFILE || '', 'AppData', 'Local', 'ms-playwright')
        : join(process.env.HOME || '', '.cache', 'ms-playwright');
    
    console.log('Testing paths:');
    console.log('Source path exists:', existsSync(sourcePath));
    if (existsSync(sourcePath)) {
        console.log('Source contents:', readdirSync(sourcePath));
    }
}

function testBrowserVersions() {
    const browsersPath = join(process.cwd(), 'browsers');
    console.log('\nTesting browser versions:');
    console.log('Browsers path exists:', existsSync(browsersPath));
    if (existsSync(browsersPath)) {
        console.log('Installed browsers:', readdirSync(browsersPath));
    }
}

console.log('Running setup tests...\n');
testPaths();
testBrowserVersions();
