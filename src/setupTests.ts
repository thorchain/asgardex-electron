// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'
import { isLeft, Either } from 'fp-ts/lib/Either'
import { Option, isNone } from 'fp-ts/lib/Option'
import { RunHelpers } from 'rxjs/internal/testing/TestScheduler'
import { TestScheduler } from 'rxjs/testing'

import { ApiKeystore, ApiLang, ApiUrl, ApiHDWallet } from './shared/api/types'
import * as mockApi from './shared/mock/api'

type RunObservableCallback<T> = (helpers: RunHelpers) => T
type RunObservable = <T>(callback: RunObservableCallback<T>) => T

declare global {
  const runObservable: RunObservable
  // eslint-disable-next-line no-redeclare, @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      runObservable: RunObservable
    }
  }

  interface Window {
    apiHDWallet: ApiHDWallet
    apiKeystore: ApiKeystore
    apiLang: ApiLang
    apiUrl: ApiUrl
  }

  // eslint-disable-next-line no-redeclare, @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeNone(): R
      toBeLeft(): R
    }
  }
}

// Wrapper around `testScheduler.run` to provide it globally
global.runObservable = <T>(callback: RunObservableCallback<T>) => {
  const ts = new TestScheduler((actual, expected) => expect(expected).toStrictEqual(actual))
  return ts.run(callback)
}

// Mock "api" objects on `window` provided by main renderer
// all can be overridden in tests if needed
global.window.apiKeystore = { ...mockApi.apiKeystore }
global.window.apiLang = { ...mockApi.apiLang }
global.window.apiUrl = { ...mockApi.apiUrl }
global.window.apiHDWallet = { ...mockApi.apiHDWallet }
global.window.apiCommonStorage = { ...mockApi.apiCommonStorage }
global.window.apiUserNodesStorage = { ...mockApi.apiUserNodesStorage }
global.window.apiPoolsStorage = { ...mockApi.apiPoolsStorage }

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
