import * as RD from '@devexperts/remote-data-ts'
import { Keystore } from '@xchainjs/xchain-crypto'
import { BTCChain, BCHChain, BNBChain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { WalletAddresses } from '../wallet/types'

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

export const MOCK_WALLET_ADDRESSES: WalletAddresses = [
  {
    address: 'tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa',
    type: 'ledger',
    chain: BNBChain,
    walletIndex: 0,
    hdMode: 'default'
  },
  {
    address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
    type: 'ledger',
    chain: THORChain,
    walletIndex: 0,
    hdMode: 'default'
  },
  {
    address: '0x33292c1d02c432d323fb62c57fb327da45e1bdde',
    type: 'keystore',
    chain: ETHChain,
    walletIndex: 0,
    hdMode: 'default'
  },
  {
    address: 'tb1qtephp596jhpwrawlp67junuk347zl2cwc56xml',
    type: 'keystore',
    chain: BTCChain,
    walletIndex: 0,
    hdMode: 'default'
  },
  {
    address: 'qr20g55jd7x3dalp4qxjfgfvda0nwr8cfccrgxd0dw',
    type: 'keystore',
    chain: BCHChain,
    walletIndex: 0,
    hdMode: 'default'
  },
  {
    address: 'tltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk',
    type: 'keystore',
    chain: LTCChain,
    walletIndex: 0,
    hdMode: 'default'
  }
]

export const MOCK_KEYSTORE: Keystore = {
  crypto: {
    cipher: 'cipher',
    ciphertext: 'ciphertext',
    cipherparams: {
      iv: 'iv'
    },
    kdf: 'kdf',
    kdfparams: {
      prf: 'prf',
      dklen: 0,
      salt: 'salt',
      c: 0
    },
    mac: 'mac'
  },
  id: 'id',
  version: 0,
  meta: 'xchain-keystore'
}
