import { spawn, exec, type ChildProcess, type SpawnOptions } from 'node:child_process'
import { promisify } from 'node:util'
import * as fs from 'node:fs'

const execPromise = promisify(exec)

/**
 * Detect whether the app is running inside a Flatpak sandbox.
 * Flatpak sets `FLATPAK_ID` env var and mounts `/.flatpak-info`.
 */
export const isFlatpak = (): boolean =>
    !!process.env.FLATPAK_ID || fs.existsSync('/.flatpak-info')

/**
 * Environment variables that must be forwarded to host processes via flatpak-spawn.
 * Without these, graphical apps like linux-wallpaperengine can't connect to the display server.
 */
const HOST_ENV_VARS = [
    'DISPLAY',
    'WAYLAND_DISPLAY',
    'XDG_RUNTIME_DIR',
    'XDG_SESSION_TYPE',
    'DBUS_SESSION_BUS_ADDRESS',
] as const

/**
 * Build `--env=KEY=VALUE` args for flatpak-spawn from the current environment.
 */
const getEnvForwardArgs = (): string[] =>
    HOST_ENV_VARS.flatMap((key) => {
        const value = process.env[key]
        return value != null ? [`--env=${key}=${value}`] : []
    })

/**
 * Spawn a process, routing through `flatpak-spawn --host` when inside a Flatpak.
 */
export const hostSpawn = (
    command: string,
    args: string[],
    options: SpawnOptions = {},
): ChildProcess => {
    if (isFlatpak()) {
        return spawn('flatpak-spawn', [...getEnvForwardArgs(), '--host', command, ...args], options)
    }
    return spawn(command, args, options)
}

/**
 * Promisified exec that routes through `flatpak-spawn --host` when inside a Flatpak.
 */
export const hostExecAsync = (
    command: string,
): Promise<{ stdout: string; stderr: string }> => {
    const envArgs = getEnvForwardArgs().join(' ')
    const cmd = isFlatpak()
        ? `flatpak-spawn ${envArgs} --host sh -c '${command.replace(/'/g, "'\\''")}'`
        : command
    return execPromise(cmd) as Promise<{ stdout: string; stderr: string }>
}
