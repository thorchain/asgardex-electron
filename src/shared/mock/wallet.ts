import * as RD from '@devexperts/remote-data-ts'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

export const mockValidatePassword$ = (password: string) =>
  Rx.of(password).pipe(
    // ignore emtpy strings
    RxOp.takeWhile((v) => !!v),
    // short delay needed to render modal, which will close in other cases
    RxOp.debounceTime(500),
    RxOp.tap((pw) => console.log('validatePassword$ ', pw)),
    RxOp.switchMap((pw) =>
      Rx.iif(() => pw === '123', Rx.of(RD.success(undefined)), Rx.of(RD.failure(new Error('invalid password'))))
    )
  )
