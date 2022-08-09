import { some } from 'fp-ts/lib/Option'

import { Pair } from '../types/asgardex'
import { getPair, compareShallowStr, truncateMiddle } from './stringHelper'

describe('helpers/stringHelper/', () => {
  describe('getPair', () => {
    it('returns a valid value pair for "-" separated strings', () => {
      const result: Pair = getPair('HELLO-WORLD')
      expect(result).toEqual({ source: some('hello'), target: some('world') })
    })
    it('returns a valid source value for non "-" separated strings', () => {
      const result: Pair = getPair('HELLO')
      expect(result.source).toEqual(some('hello'))
      expect(result.target).toBeNone()
    })
    it('returns a null value pair if no value entered', () => {
      const result: Pair = getPair()
      expect(result.source).toBeNone()
      expect(result.target).toBeNone()
    })
  })

  describe('compareShallowStr', () => {
    it('returns false if strings do not match', () => {
      const result = compareShallowStr('hello', 'world')
      expect(result).toEqual(false)
    })
    it('returns true if strings match', () => {
      const result = compareShallowStr('hello', 'hello')
      expect(result).toEqual(true)
    })
    it('returns true if numerical strings are input to function', () => {
      const result = compareShallowStr('123', '123')
      expect(result).toEqual(true)
    })
  })

  describe('truncateMiddle', () => {
    it('default', () => {
      const result = truncateMiddle('hello-world')
      expect(result).toEqual('hel...rld')
    })
    it('max', () => {
      let result = truncateMiddle('hello-world', { max: 5 })
      expect(result).toEqual('hel...rld')
      result = truncateMiddle('hello-world', { max: 1 })
      expect(result).toEqual('hel...rld')
      result = truncateMiddle('helloworld', { max: 10 })
      expect(result).toEqual('helloworld')
    })
    it('start', () => {
      let result = truncateMiddle('hello-world', { start: 2 })
      expect(result).toEqual('he...rld')
      result = truncateMiddle('hello-world', { start: 1 })
      expect(result).toEqual('h...rld')
      result = truncateMiddle('hello-world', { start: 5 })
      expect(result).toEqual('hello-world')
    })
    it('end', () => {
      let result = truncateMiddle('hello-world', { end: 2 })
      expect(result).toEqual('hel...ld')
      result = truncateMiddle('hello-world', { end: 1 })
      expect(result).toEqual('hel...d')
      result = truncateMiddle('hello-world', { end: 5 })
      expect(result).toEqual('hello-world')
    })
    it('delimiter', () => {
      let result = truncateMiddle('hello-world', { delimiter: '#-#' })
      expect(result).toEqual('hel#-#rld')
      result = truncateMiddle('hello-world', { delimiter: '############' })
      expect(result).toEqual('hello-world')
    })
  })
})
