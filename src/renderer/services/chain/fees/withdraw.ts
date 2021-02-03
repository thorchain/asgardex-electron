import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as THOR from '../../thorchain'
import { FeeLD, Memo } from '../types'

const reloadWithdrawFee = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      BNB.reloadFees()
      break
    case 'BTC':
      BTC.reloadFees()
      break
    case 'THOR':
      THOR.reloadFees()
      break
    case 'ETH':
      // not implemented yet
      break
    case 'GAIA':
      // not implemented yet
      break
    case 'POLKA':
      // not implemented yet
      break
  }
}

const withdrawFee$ = (chain: Chain, memo: Memo): FeeLD => {
  switch (chain) {
    case 'BNB':
      return BNB.fees$().pipe(liveData.map(({ fast }) => fast))
    case 'BTC':
      // withdraw fee for BTC txs based on withdraw memo
      return BTC.memoFees$(memo).pipe(liveData.map(({ fees }) => fees.fast))
    case 'THOR':
      return THOR.fees$().pipe(liveData.map(({ fast }) => fast))
    case 'ETH':
      return Rx.of(RD.failure(Error(`Withdraw fee for ETH has not been implemented`)))
    case 'GAIA':
      return Rx.of(RD.failure(Error(`Withdraw fee for Cosmos has not been implemented`)))
    case 'POLKA':
      return Rx.of(RD.failure(Error(`Withdraw fee for Polkadot has not been implemented`)))
    case 'BCH':
      return Rx.of(RD.failure(Error(`Withdraw fee for Bitcoin Cash has not been implemented`)))
    case 'LTC':
      return Rx.of(RD.failure(Error(`Withdraw fee for Litecoin has not been implemented`)))
  }
}

export { reloadWithdrawFee, withdrawFee$ }
