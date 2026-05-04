import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const isWindows = process.platform === 'win32'
const rawPort = process.env.PORT?.trim() || '4173'
const port = Number(rawPort)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`PORT invalido para preview: ${rawPort}`)
  process.exit(1)
}

const viteBin = path.join(process.cwd(), 'node_modules', '.bin', isWindows ? 'vite.cmd' : 'vite')

if (!existsSync(viteBin)) {
  console.error('Vite nao encontrado. Rode npm install antes de iniciar o preview.')
  process.exit(1)
}

const child = spawn(viteBin, ['preview', '--host', '0.0.0.0', '--port', String(port)], {
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
