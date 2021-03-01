import * as RD from '@devexperts/remote-data-ts'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { FeeLD, Memo } from '../types'

const reloadWithdrawFee = (chain: Chain) => {
  switch (chain) {
    case BNBChain:
      BNB.reloadFees()
      break
    case BTCChain:
      BTC.reloadFees()
      break
    case THORChain:
      THOR.reloadFees()
      break
    case LTCChain:
      LTC.reloadFees()
      break
    case ETHChain:
      // not implemented yet
      break
    case CosmosChain:
      // not implemented yet
      break
    case PolkadotChain:
      // not implemented yet
      break
  }
}

const withdrawFee$ = (chain: Chain, memo: Memo): FeeLD => {
  switch (chain) {
    case BNBChain:
      return BNB.fees$().pipe(liveData.map(({ fast }) => fast))
    case BTCChain:
      // withdraw fee for BTC txs based on withdraw memo
      return BTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees.fast))
    case THORChain:
      return THOR.fees$().pipe(liveData.map(({ fast }) => fast))
    case ETHChain:
      return Rx.of(RD.failure(Error(`Withdraw fee for ETH has not been implemented`)))
    case CosmosChain:
      return Rx.of(RD.failure(Error(`Withdraw fee for Cosmos has not been implemented`)))
    case PolkadotChain:
      return Rx.of(RD.failure(Error(`Withdraw fee for Polkadot has not been implemented`)))
    case BCHChain:
      return Rx.of(RD.failure(Error(`Withdraw fee for Bitcoin Cash has not been implemented`)))
    case LTCChain:
      return LTC.feesWithRates$(memo).pipe(liveData.map(({ fees: { fast } }) => fast))
  }
}

export { reloadWithdrawFee, withdrawFee$ }
