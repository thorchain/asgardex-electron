import { envOrDefault } from './envHelper'

describe('helpers/envHelper/', () => {
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
