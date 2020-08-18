import { scan, take, takeLast } from 'rxjs/operators'

import { fromPromise$ } from './fromPromise'

describe('/helpers/rx/fromPromise', () => {
  it('should trigger next value in case Promise resolved', (done) => {
    const targetStream$ = fromPromise$((val) => Promise.resolve(val), 0)

    targetStream$(1)
    targetStream$(2)

    targetStream$(3)
      .pipe(
        take(4),
        scan((acc, cur) => {
          acc.push(cur)
          return acc
        }, []),
        takeLast(1)
      )
      .subscribe((val) => {
        expect(val).toEqual([0, 1, 2, 3])
        done()
      })
  })

  describe('Promise rejected', () => {
    it('should trigger default onError cb if on error not provided', (done) => {
      const targetStream$ = fromPromise$((val) => Promise.reject(val), 3)

      targetStream$(2)
        .pipe(take(1), takeLast(1))
        .subscribe((val) => {
          expect(val).toEqual(3)
          done()
        })
    })

    it('should trigger onError cb ', (done) => {
      const targetStream$ = fromPromise$(
        () => Promise.reject(3),
        1,
        (e) => e * 2
      )

      targetStream$(3)
        .pipe(
          take(2),
          scan((acc, cur) => {
            acc.push(cur)
            return acc
          }, []),
          takeLast(1)
        )
        .subscribe((val) => {
          expect(val).toEqual([1, 6])
          done()
        })
    })
  })
})
