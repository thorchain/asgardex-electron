import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { getChainAsset } from '../../../helpers/chainHelper'
import { eqOAsset } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { service as midgardService } from '../../midgard/service'
import * as THOR from '../../thorchain'
import { SymDepositFees, SymDepositFeesHandler } from '../types'
import { poolFee$ } from './common'

const {
  pools: { reloadGasRates }
} = midgardService

/**
 * Returns zero sym deposit fees
 * by given `in` / `out` assets of a swap
 */
export const getZeroSymDepositFees = (asset: Asset): SymDepositFees => ({
  rune: { inFee: ZERO_BASE_AMOUNT, outFee: ZERO_BASE_AMOUNT, refundFee: ZERO_BASE_AMOUNT },
  asset: {
    asset: getChainAsset(asset.chain),
    inFee: ZERO_BASE_AMOUNT,
    outFee: ZERO_BASE_AMOUNT,
    refundFee: ZERO_BASE_AMOUNT
  }
})

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
  // (3) Reload fees for asset
  reloadGasRates()
}

const symDepositFees$: SymDepositFeesHandler = (initialAsset) => {
  return FP.pipe(
    reloadSymDepositFees$,
    RxOp.debounceTime(300),
    RxOp.switchMap((oReloadParams) => {
      // Since `oReloadParams` is `none` by default,
      // `initialAsset` will be used as first value
      const asset = FP.pipe(
        oReloadParams,
        O.getOrElse(() => initialAsset)
      )

      return FP.pipe(
        liveData.sequenceS({
          runeInFee: poolFee$(AssetRuneNative),
          assetInFee: poolFee$(asset)
        }),
        liveData.map(({ runeInFee, assetInFee }) => ({
          rune: { inFee: runeInFee.amount, outFee: runeInFee.amount.times(3), refundFee: runeInFee.amount.times(3) },
          asset: {
            asset: getChainAsset(asset.chain),
            inFee: assetInFee.amount,
            outFee: assetInFee.amount.times(3),
            refundFee: assetInFee.amount.times(3)
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
