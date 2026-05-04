import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm.cmd' : 'npm'
const args = process.argv.slice(2)
const runAll = args[0] === 'all' || args[0] === ':all'

const child = runAll
  ? spawn(process.execPath, ['scripts/dev-all.mjs'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    })
  : spawn(npmCommand, ['run', 'dev:web', '--', ...args], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      shell: isWindows,
    })

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
