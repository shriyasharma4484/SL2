import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[32m%s\x1b[0m', '🌱 Starting Sevadeep CivicConnect (Full-Stack Platform)');
console.log('\x1b[36m%s\x1b[0m', '   Customized for Sevadeep NGO, Pune, Maharashtra');
console.log('\x1b[36m%s\x1b[0m', '=====================================================');

const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\nShutting down Sevadeep CivicConnect processes...');
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
