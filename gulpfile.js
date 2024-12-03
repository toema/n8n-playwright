const path = require('path');
const { task, src, dest, parallel } = require('gulp');

task('build:icons', copyIcons);
task('build:browsers', copyBrowsers);

function copyIcons() {
    const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
    const nodeDestination = path.resolve('dist', 'nodes');

    return src(nodeSource).pipe(dest(nodeDestination));
}

function copyBrowsers() {
    const browserSource = path.resolve('nodes', 'browsers', '**', '*');
    const browserDestination = path.resolve('dist', 'nodes', 'browsers');

    return src(browserSource).pipe(dest(browserDestination));
}

exports.default = parallel(copyIcons, copyBrowsers);
