import {describe, expect, it} from 'vitest'

import {
  detectSafariToolchain,
  isMacOS,
  type SpawnSyncLike
} from '../src/toolchain'

const fakeSpawn =
  (responses: Record<string, {status: number; stdout: string}>): SpawnSyncLike =>
    (command, args) => {
      const key = [command, ...args].join(' ')

      return responses[key] ?? {status: 1, stdout: ''}
    }

describe('isMacOS', () => {
  it('returns true for darwin', () => {
    expect(isMacOS('darwin')).toBe(true)
  })

  it('returns false for other platforms', () => {
    expect(isMacOS('linux')).toBe(false)
    expect(isMacOS('win32')).toBe(false)
  })
})

describe('detectSafariToolchain', () => {
  it('short-circuits on non-macOS platforms', () => {
    const result = detectSafariToolchain({platform: 'linux'})

    expect(result).toEqual({
      platformOk: false,
      developerDir: null,
      needsFullXcode: false,
      converter: null,
      xcodebuild: null,
      ok: false
    })
  })

  it('reports a complete toolchain with full Xcode', () => {
    const spawn = fakeSpawn({
      'xcode-select -p': {
        status: 0,
        stdout: '/Applications/Xcode.app/Contents/Developer\n'
      },
      'xcrun --find safari-web-extension-converter': {
        status: 0,
        stdout: '/usr/bin/safari-web-extension-converter\n'
      },
      'xcrun --find xcodebuild': {
        status: 0,
        stdout: '/usr/bin/xcodebuild\n'
      }
    })

    const result = detectSafariToolchain({platform: 'darwin', spawnSync: spawn})

    expect(result.developerDir).toBe(
      '/Applications/Xcode.app/Contents/Developer'
    )
    expect(result.needsFullXcode).toBe(false)
    expect(result.converter).toBe('/usr/bin/safari-web-extension-converter')
    expect(result.xcodebuild).toBe('/usr/bin/xcodebuild')
    expect(result.ok).toBe(true)
  })

  it('flags Command Line Tools as needing full Xcode', () => {
    const spawn = fakeSpawn({
      'xcode-select -p': {
        status: 0,
        stdout: '/Library/Developer/CommandLineTools\n'
      }
    })

    const result = detectSafariToolchain({platform: 'darwin', spawnSync: spawn})

    expect(result.needsFullXcode).toBe(true)
    expect(result.converter).toBeNull()
    expect(result.ok).toBe(false)
  })

  it('handles a missing developer dir', () => {
    const result = detectSafariToolchain({
      platform: 'darwin',
      spawnSync: fakeSpawn({})
    })

    expect(result.developerDir).toBeNull()
    expect(result.needsFullXcode).toBe(true)
    expect(result.ok).toBe(false)
  })

  it('requires both converter and xcodebuild for ok', () => {
    const spawn = fakeSpawn({
      'xcode-select -p': {
        status: 0,
        stdout: '/Applications/Xcode.app/Contents/Developer\n'
      },
      'xcrun --find xcodebuild': {status: 0, stdout: '/usr/bin/xcodebuild\n'}
    })

    const result = detectSafariToolchain({platform: 'darwin', spawnSync: spawn})

    expect(result.xcodebuild).toBe('/usr/bin/xcodebuild')
    expect(result.converter).toBeNull()
    expect(result.ok).toBe(false)
  })
})
