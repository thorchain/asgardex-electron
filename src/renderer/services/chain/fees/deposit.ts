import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { eqOAsset } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as THOR from '../../thorchain'
import { reloadInboundAddresses } from '../../thorchain'
import { SymDepositFeesHandler } from '../types'
import { poolOutboundFee$, poolInboundFee$ } from './common'

// State to reload sym deposit fees
const {
  get$: reloadSymDepositFees$,
  get: reloadSymDepositFeesState,
  set: _reloadSymDepositFees
} = observableState<O.Option<Asset>>(O.none)

// Triggers reloading of deposit fees
const reloadSymDepositFees = (asset: Asset) => {
  // (1) update reload state only, if prev. vs. current assets are different
  if (!eqOAsset.equals(O.some(asset), reloadSymDepositFeesState())) {
    _reloadSymDepositFees(O.some(asset))
  }
  // (2) Reload fees for RUNE
  THOR.reloadFees()
  // (3) Reload fees for asset, which are provided via `inbound_addresses` endpoint
  reloadInboundAddresses()
}

const symDepositFees$: SymDepositFeesHandler = (initialAsset) => {
  return FP.pipe(
    reloadSymDepositFees$,
    RxOp.debounceTime(300),
    RxOp.switchMap((oAsset) => {
      // Since `oAsset` is `none` by default,
      // `initialAsset` will be used as first value
      const asset = FP.pipe(
        oAsset,
        O.getOrElse(() => initialAsset)
      )

      return FP.pipe(
        liveData.sequenceS({
          runeInFee: poolInboundFee$(AssetRuneNative),
          assetInFee: poolInboundFee$(asset),
          runeOutFee: poolOutboundFee$(AssetRuneNative),
          assetOutFee: poolOutboundFee$(asset)
        }),
        liveData.map(({ runeInFee, assetInFee, runeOutFee, assetOutFee }) => ({
          rune: { inFee: runeInFee.amount, outFee: runeOutFee.amount, refundFee: runeOutFee.amount },
          asset: {
            asset: assetInFee.asset,
            inFee: assetInFee.amount,
            outFee: assetOutFee.amount,
            refundFee: assetOutFee.amount
          }
        }))
      )
    })
  )
}
// State to reload sym deposit fees
const { get$: _reloadAsymDepositFee$, set: reloadAsymDepositFee } = observableState<O.Option<Asset>>(O.none)
const asymDepositFee$ = Rx.of(RD.failure(Error('asym deposit fees have not implemented yet')))

export { symDepositFees$, asymDepositFee$, reloadSymDepositFees, reloadAsymDepositFee }
