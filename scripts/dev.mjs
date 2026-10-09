import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

function startProcess(name, args, cwd, colorPrefix) {
  const proc = spawn(npmCmd, args, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: isWindows
  });

  proc.stdout?.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        process.stdout.write(`${colorPrefix}[${name}]\x1b[0m ${line}\n`);
      }
    });
  });

  proc.stderr?.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        process.stderr.write(`${colorPrefix}[${name}]\x1b[0m ${line}\n`);
      }
    });
  });

  proc.on('close', (code) => {
    console.log(`${colorPrefix}[${name}]\x1b[0m exited with code ${code ?? 0}`);
  });

  return proc;
}

console.log('\x1b[35m[Form Mitra]\x1b[0m Starting backend and frontend concurrently...\n');

const serverProc = startProcess(
  'server',
  ['run', 'dev'],
  path.join(rootDir, 'server'),
  '\x1b[36m' // Cyan
);

const clientProc = startProcess(
  'client',
  ['run', 'dev'],
  path.join(rootDir, 'client'),
  '\x1b[32m' // Green
);

function cleanup() {
  console.log('\n\x1b[35m[Form Mitra]\x1b[0m Shutting down all processes...');
  if (isWindows) {
    if (serverProc.pid) spawn('taskkill', ['/pid', String(serverProc.pid), '/T', '/F']);
    if (clientProc.pid) spawn('taskkill', ['/pid', String(clientProc.pid), '/T', '/F']);
  } else {
    serverProc.kill();
    clientProc.kill();
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
