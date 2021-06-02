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
    maxRetry = 3,
    scalingDuration = 1000,
    excludedStatusCodes = []
  }: {
    /* max. amount to retry */
    maxRetry?: number
    /* in ms */
    scalingDuration?: number
    /* status codes to ignore */
    excludedStatusCodes?: number[]
  } = {}) =>
  (attempts: Rx.Observable<T>) => {
    return attempts.pipe(
      RxOp.mergeMap((error, i) => {
        const retryAttempt = i + 1

        if (retryAttempt > maxRetry || excludedStatusCodes.find((e) => e === error.status)) {
          return Rx.throwError(error)
        }
        const delay = retryAttempt * scalingDuration
        // console.log(`Attempt ${retryAttempt}: retrying in ${delay}ms`)
        return Rx.timer(delay)
      })
    )
  }
