import { BaseAmount, baseAmount, bn } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'

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
