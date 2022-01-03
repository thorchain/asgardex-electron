// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'
import { isLeft, Either } from 'fp-ts/lib/Either'
import { Option, isNone } from 'fp-ts/lib/Option'

import * as mockApi from '../shared/mock/api'

// Mock "api" objects on `window` provided by main renderer
// all can be overridden in tests if needed

global.window.apiKeystore = { ...mockApi.apiKeystore }
global.window.apiLang = { ...mockApi.apiLang }
global.window.apiUrl = { ...mockApi.apiUrl }
global.window.apiHDWallet = { ...mockApi.apiHDWallet }

/**
 * Definition of custom matchers
 *
 * More information about custom matchers:
 * https://jestjs.io/docs/en/expect.html#expectextendmatchers
 *
 * */
expect.extend({
  toBeNone<T>(received: Option<T>) {
    if (isNone(received)) {
      return {
        message: () => `Expected ${received} not to be None`,
        pass: true
      }
    }
    return {
      message: () => `Expected ${received} to be None`,
      pass: false
    }
  },
  toBeLeft<E, A>(received: Either<E, A>) {
    if (isLeft(received)) {
      return {
        message: () => `Expected ${received} not to be "Left"`,
        pass: true
      }
    }
    return {
      message: () => `Expected ${received} to be "Left"`,
      pass: false
    }
  }
})
