import { Asset, BaseAmount, baseAmount, bn } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { isChainAsset, max1e8BaseAmount } from '../../../helpers/assetHelper'
import { priceFeeAmountForAsset } from '../../../services/chain/fees/utils'
import { WithdrawFees } from '../../../services/chain/types'
import { PoolsDataMap } from '../../../services/midgard/types'
import { AssetWithAmount } from '../../../types/asgardex'

export const getWithdrawAmounts = (
  runeShare: BaseAmount,
  assetShare: BaseAmount,
  percentAmount: number
): { rune: BaseAmount; asset: BaseAmount } => {
  const percentBn = bn(percentAmount / 100)
  const rune = baseAmount(percentBn.multipliedBy(runeShare.amount()))
  const asset = baseAmount(percentBn.multipliedBy(assetShare.amount()), assetShare.decimal)

  return {
    rune,
    asset
  }
}

// TODO (@Veado) Add test
export const getAsymWithdrawAmount = ({
  share,
  percent,
  fee: oFee
}: {
  share: BaseAmount
  percent: number
  fee: O.Option<BaseAmount>
}): BaseAmount =>
  FP.pipe(
    oFee,
    O.getOrElse(() => ZERO_BASE_AMOUNT),
    (fee) =>
      bn(percent / 100)
        .multipliedBy(share.amount())
        .minus(fee.amount()),
    (amountBN) => (amountBN.isLessThan(0) ? ZERO_BN : amountBN),
    baseAmount
  )

export const sumWithdrawFees = ({ inFee, outFee }: WithdrawFees): BaseAmount => inFee.plus(outFee)

/**
 * Returns min. amount for asset to withdraw to cover outbound fees
 */
export const minAssetAmountToWithdrawMax1e8 = ({
  fees,
  asset,
  assetDecimal,
  poolsData
}: {
  fees: AssetWithAmount
  /* asset to withdraw */
  asset: Asset
  assetDecimal: number
  poolsData: PoolsDataMap
}): BaseAmount => {
  const { asset: feeAsset, amount: outFee } = fees

  const outFeeInAsset = isChainAsset(asset)
    ? outFee
    : priceFeeAmountForAsset({
        feeAmount: outFee,
        feeAsset,
        asset,
        assetDecimal,
        poolsData
      })

  return FP.pipe(
    // Over-estimate fee by 50%
    1.5,
    outFeeInAsset.times,
    // transform decimal to be `max1e8`
    max1e8BaseAmount
  )
}

/**
 * Returns min. amount for RUNE to withdraw to cover outbound fees
 */
export const minRuneAmountToWithdraw = (fees: Pick<WithdrawFees, 'outFee'>): BaseAmount => {
  const { outFee } = fees
  // Over-estimate balance by 50%
  return outFee.times(1.5)
}
