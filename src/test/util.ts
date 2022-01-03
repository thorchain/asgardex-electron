import { TestScheduler } from 'rxjs/testing'
import { expect } from 'vitest'

import { RunObservableCallback } from './types'

// Wrapper around `testScheduler.run` to provide it globally
export const runObservable = <T>(callback: RunObservableCallback<T>) => {
  const ts = new TestScheduler((actual, expected) => expect(expected).toStrictEqual(actual))
  return ts.run(callback)
}
