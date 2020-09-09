import { envOrDefault, isEnv } from './envHelper'

describe('helpers/envHelper/', () => {
  describe('isEnv', () => {
    it('returns true if valid', () => {
      expect(isEnv('ANY_ENV')).toBeTruthy()
    })
    it('returns false if empty (invalid)', () => {
      expect(isEnv('')).toBeFalsy()
    })
    it('returns false for undefined', () => {
      expect(isEnv(undefined)).toBeFalsy()
    })
  })
  describe('envOrDefault', () => {
    it('returns ENV value if valid', () => {
      const env = 'valid-env-value'
      const result = envOrDefault(env, 'default-value')
      expect(result).toEqual(env)
    })

    it('returns a default value for invalid ENV values', () => {
      const defaultValue = 'default-value'
      let result = envOrDefault(undefined, defaultValue)
      expect(result).toEqual(defaultValue)
      result = envOrDefault('', defaultValue)
      expect(result).toEqual(defaultValue)
    })
  })
})
