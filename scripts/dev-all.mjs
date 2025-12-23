import { spawn } from 'node:child_process'

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const processes = [
  spawn(npmCmd, ['--prefix', 'eats-frontend', 'run', 'dev'], { stdio: 'inherit' }),
  spawn(npmCmd, ['--prefix', 'sanity', 'run', 'dev'], { stdio: 'inherit' }),
]

const shutdown = (signal = 'SIGTERM') => {
  for (const proc of processes) {
    if (!proc.pid) continue
    try {
      proc.kill(signal)
    } catch {
      // Ignore
    }
  }
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

let exited = false
for (const proc of processes) {
  proc.on('exit', code => {
    if (exited) return
    exited = true
    shutdown()
    process.exit(code ?? 0)
  })
}

