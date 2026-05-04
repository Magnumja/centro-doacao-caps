import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm.cmd' : 'npm'

const processes = [
  { name: 'web', args: ['run', 'dev:web'], required: true },
  { name: 'api', args: ['--prefix', 'server', 'run', 'dev'], required: false },
]

const children = new Set()
let shuttingDown = false

function writePrefixed(name, chunk, output) {
  const lines = String(chunk).split(/\r?\n/)
  for (const line of lines) {
    if (line.length > 0) {
      output.write(`[${name}] ${line}\n`)
    }
  }
}

function stopAll(signal = 'SIGTERM') {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal)
    }
  }
}

for (const processConfig of processes) {
  const child = spawn(npmCommand, processConfig.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWindows,
  })

  children.add(child)
  child.stdout.on('data', (chunk) => writePrefixed(processConfig.name, chunk, process.stdout))
  child.stderr.on('data', (chunk) => writePrefixed(processConfig.name, chunk, process.stderr))

  child.on('exit', (code, signal) => {
    children.delete(child)
    if (!shuttingDown && (code !== 0 || signal)) {
      if (processConfig.required) {
        stopAll()
        process.exitCode = code ?? 1
        return
      }

      process.stderr.write(
        `[${processConfig.name}] processo encerrado. O frontend continua em execucao; verifique as variaveis do backend se precisar da API.\n`,
      )
    }
  })
}

process.on('SIGINT', () => stopAll('SIGINT'))
process.on('SIGTERM', () => stopAll('SIGTERM'))
