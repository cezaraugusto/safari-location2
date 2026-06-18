import {expect, test, describe} from 'vitest'

import safariLocation from '../src/index'

describe('safari-location2 module', () => {
  it('returns string or null', () => {
    const res = safariLocation()

    expect(typeof res === 'string' || res === null).toBe(true)
  })
})
