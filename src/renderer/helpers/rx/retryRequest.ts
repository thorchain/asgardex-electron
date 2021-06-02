/**
 * Helper to re-start requests in case of failures
 *
 * Based on "Example 2: Customizable retry with increased duration"
 * @see https://www.learnrxjs.io/learn-rxjs/operators/error_handling/retrywhen
 */

import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

export const retryRequest =
  <T extends { status?: number } /* error type with possible status code */>({
    maxRetryAttempts = 3,
    scalingDuration = 1000,
    excludedStatusCodes = []
  }: {
    maxRetryAttempts?: number
    scalingDuration?: number
    excludedStatusCodes?: number[]
  } = {}) =>
  (attempts: Rx.Observable<T>) => {
    return attempts.pipe(
      RxOp.mergeMap((error, i) => {
        const retryAttempt = i + 1

        if (retryAttempt > maxRetryAttempts || excludedStatusCodes.find((e) => e === error.status)) {
          return Rx.throwError(error)
        }
        console.log(`Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`)

        return Rx.timer(retryAttempt * scalingDuration)
      }),
      RxOp.finalize(() => console.log('We are done!'))
    )
  }
