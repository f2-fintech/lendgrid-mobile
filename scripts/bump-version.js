const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const appConfigPath = path.join(__dirname, '../app.config.js');

// 1. Bump package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const oldVersion = packageJson.version;
const versionParts = oldVersion.split('.');
versionParts[2] = parseInt(versionParts[2], 10) + 1;
const newVersion = versionParts.join('.');
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// 2. Bump app.config.js
let appConfig = fs.readFileSync(appConfigPath, 'utf8');
appConfig = appConfig.replace(/version: "(.*)"/, `version: "${newVersion}"`);
fs.writeFileSync(appConfigPath, appConfig);

console.log(`Version bumped from ${oldVersion} to ${newVersion}`);
