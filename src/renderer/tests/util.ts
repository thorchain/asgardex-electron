import { TestScheduler } from 'rxjs/testing'

export function createScheduler() {
  return new TestScheduler((actual, expected) => {
    expect(expected).toEqual(actual)
  })
}
