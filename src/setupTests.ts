// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'
import { Option, isNone } from 'fp-ts/lib/Option'
import { TestScheduler } from 'rxjs/testing'

declare global {
  const runObservable: typeof TestScheduler.prototype.run
  // eslint-disable-next-line no-redeclare, @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      runObservable: () => typeof TestScheduler.prototype.run
    }
  }

  // eslint-disable-next-line no-redeclare, @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeNone(): R
    }
  }
}

const createScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(expected).toEqual(actual)
  })

global.runObservable = () => createScheduler().run

/**
 * Definition of custom matchers
 *
 * More information about custom matchers:
 * https://jestjs.io/docs/en/expect.html#expectextendmatchers
 *
 * */
expect.extend({
  toBeNone<T>(received: Option<T>) {
    const pass = isNone(received)

    if (pass) {
      return {
        message: () => `Expected ${received} not to be None`,
        pass: true
      }
    } else {
      return {
        message: () => `Expected ${received} to be None`,
        pass: false
      }
    }
  }
})
