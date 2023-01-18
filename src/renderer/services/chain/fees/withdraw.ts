import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { AssetRuneNative } from '../../../../shared/utils/asset'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { eqOAsset } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as THOR from '../../thorchain'
import { reloadInboundAddresses } from '../../thorchain'
import { SymWithdrawFees, SymWithdrawFeesHandler } from '../types'
import { poolOutboundFee$, poolInboundFee$ } from './common'
/**
 * Returns zero withdraw fees
 * by given asset to withdraw
 */
const getZeroWithdrawFees = (asset: Asset): SymWithdrawFees => ({
  rune: {
    inFee: ZERO_BASE_AMOUNT,
    outFee: ZERO_BASE_AMOUNT
  },
  asset: {
    asset,
    amount: ZERO_BASE_AMOUNT
  }
})

// State to reload sym deposit fees
const {
  get$: reloadWithdrawFees$,
  get: reloadWithdrawFeeState,
  set: _reloadSymDepositFees
} = observableState<O.Option<Asset>>(O.none)

// Triggers reloading of deposit fees
const reloadWithdrawFees = (asset: Asset) => {
  // (1) update reload state only, if prev. vs. current assets are different
  if (!eqOAsset.equals(O.some(asset), reloadWithdrawFeeState())) {
    _reloadSymDepositFees(O.some(asset))
  }

  if (isRuneNativeAsset(asset)) {
    // Reload fees for RUNE
    THOR.reloadFees()
  } else {
    // OR reload fees for asset, which are provided via `inbound_addresses` endpoint
    reloadInboundAddresses()
  }
}

const symWithdrawFee$: SymWithdrawFeesHandler = (initialAsset) =>
  FP.pipe(
    reloadWithdrawFees$,
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
          runeOutFee: poolOutboundFee$(AssetRuneNative),
          assetOutFee: poolOutboundFee$(asset)
        }),
        liveData.map(({ runeInFee, runeOutFee, assetOutFee }) => ({
          rune: { inFee: runeInFee.amount, outFee: runeOutFee.amount },
          asset: assetOutFee
        }))
      )
    })
  )

export { reloadWithdrawFees, symWithdrawFee$, getZeroWithdrawFees }
