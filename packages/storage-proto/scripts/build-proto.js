#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

// Определяем правильный плагин в зависимости от платформы
const platform = os.platform();
let pluginName = 'protoc-gen-ts_proto';

if (platform === 'win32') {
  pluginName = 'protoc-gen-ts_proto.CMD';
}

const pluginPath = path.join(__dirname, '..', 'node_modules', '.bin', pluginName);

const command = `npx protoc --plugin="${pluginPath}" --ts_proto_out="./src" --ts_proto_opt="esModuleInterop=true,forceLong=string,outputServices=false" --proto_path="./src" ./src/storage.proto && tsc`;

console.log(`Building proto files for ${platform}...`);
console.log(`Using plugin: ${pluginPath}`);

try {
  execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('Proto build completed successfully!');
} catch (error) {
  console.error('Proto build failed:', error.message);
  process.exit(1);
}
