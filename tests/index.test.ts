import {expect, it, describe} from 'vitest'

import safariLocation, {getInstallGuidance} from '../src/index'

describe('safari-location2 module', () => {
  it('returns string or null', () => {
    const res = safariLocation()

    expect(typeof res === 'string' || res === null).toBe(true)
  })

  it('getInstallGuidance renders caller-provided install steps in order', () => {
    const msg = getInstallGuidance({
      steps: [
        {
          summary: 'Install Safari Technology Preview',
          command: 'brew install --cask safari-technology-preview'
        },
        {
          summary: 'Install the Xcode command line tools',
          command: 'xcode-select --install'
        }
      ]
    })

    const first =
      '1) Install Safari Technology Preview\n' +
      '   brew install --cask safari-technology-preview'

    const second =
      '2) Install the Xcode command line tools\n   xcode-select --install'

    expect(msg).toContain(first)
    expect(msg).toContain(second)
    expect(msg.indexOf(first)).toBeLessThan(msg.indexOf(second))
    expect(msg).not.toMatch(/Safari is only available on macOS\./)
    expect(msg).toMatch(/We couldn't find a Safari browser/)
  })

  it('getInstallGuidance with empty steps keeps the default hint', () => {
    expect(getInstallGuidance({steps: []})).toBe(getInstallGuidance())
  })
})
