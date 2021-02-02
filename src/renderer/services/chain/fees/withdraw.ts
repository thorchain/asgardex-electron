import * as RD from '@devexperts/remote-data-ts'
import { getWithdrawMemo } from '@thorchain/asgardex-util'
import { Chain, Asset } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as THOR from '../../thorchain'
import { FeeLD } from '../types'

const reloadWithdrawFeeByChain = (chain: Chain) => {
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

const reloadWithdrawFee = ({ chain }: Asset) => reloadWithdrawFeeByChain(chain)

const withdrawFeeByChain$ = (chain: Chain, memo: string): FeeLD => {
  switch (chain) {
    case 'BNB':
      return BNB.fees$().pipe(liveData.map(({ fast }) => fast))
    case 'BTC':
      // withdraw fee for BTC txs based on withdraw memo
      return BTC.memoFees$(memo).pipe(liveData.map(({ fees }) => fees.fast))
    case 'THOR':
      return THOR.fees$().pipe(liveData.map(({ fast }) => fast))
    case 'ETH':
      return Rx.of(RD.failure(Error(`Deposit fee for ETH has not been implemented`)))
    case 'GAIA':
      return Rx.of(RD.failure(Error(`Deposit fee for Cosmos has not been implemented`)))
    case 'POLKA':
      return Rx.of(RD.failure(Error(`Deposit fee for Polkadot has not been implemented`)))
  }
}

const withdrawFee$ = (asset: Asset, percent: number): FeeLD => {
  // percent needs to be mulitplied by 100  to transform into "points"
  // ^ needed by `getWithdrawMemo`
  const memo = getWithdrawMemo(asset, percent * 100)
  return withdrawFeeByChain$(asset.chain, memo)
}

export { reloadWithdrawFee, withdrawFee$ }
