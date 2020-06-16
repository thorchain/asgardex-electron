import { Maybe, Nothing } from './types/asgardex'
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

declare global {
  // eslint-disable-next-line no-redeclare, @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeNothing(): R
    }
  }
}

/**
 * Definition of custom matchers
 *
 * More information about custom matchers:
 * https://jestjs.io/docs/en/expect.html#expectextendmatchers
 * */
expect.extend({
  toBeNothing<T>(received: Maybe<T>) {
    const pass = received === Nothing

    if (pass) {
      return {
        message: () => `Expected ${received} not to be Nothing`,
        pass: true
      }
    } else {
      return {
        message: () => `Expected ${received} to be Nothing`,
        pass: false
      }
    }
  }
})
