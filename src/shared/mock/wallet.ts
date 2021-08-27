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

// Note: This MOCK phrase is created by https://iancoleman.io/bip39/ and will NEVER been used in a real-world
// Copied from https://github.com/xchainjs/xchainjs-lib/blob/c17c625b666c0113779db62db2f585c076be587d/packages/xchain-binance/__tests__/client.test.ts#L60
export const MOCK_PHRASE = 'rural bright ball negative already grass good grant nation screen model pizza'
