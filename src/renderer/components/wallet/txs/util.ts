import { bn, AssetAmount, isValidBN, formatAssetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { IntlShape } from 'react-intl'

import { isBnbAsset } from '../../../helpers/assetHelper'
import { AssetWithBalance } from '../../../services/binance/types'

export type SendAmountValidatorProps = {
  input: string
  fee: O.Option<AssetAmount>
  assetWB: AssetWithBalance
  bnbAmount: AssetAmount
  intl?: IntlShape
}

export const sendAmountValidator = async ({
  input,
  fee,
  assetWB,
  bnbAmount,
  intl
}: SendAmountValidatorProps): Promise<void> => {
  const value = bn(input)

  // input is number
  if (!isValidBN(value)) {
    return Promise.reject(intl?.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }) ?? 'Invalid input')
  }

  // input > 0
  if (value.isLessThanOrEqualTo(0)) {
    return Promise.reject(
      intl?.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }) ?? 'input >= 0'
    )
  }

  // bnb balance > fee (non BNB assets only)
  if (!isBnbAsset(assetWB.asset) && O.isSome(fee) && bnbAmount.amount().isLessThan(fee.value.amount())) {
    return Promise.reject(
      intl?.formatMessage(
        { id: 'wallet.errors.fee.notCovered' },
        { fee: formatAssetAmount(bnbAmount, 6), balance: formatAssetAmount(bnbAmount, 8) }
      ) ?? 'fee > bnb balance'
    )
  }

  // input > balance - fee (BNB only)
  if (
    isBnbAsset(assetWB.asset) &&
    O.isSome(fee) &&
    value.isGreaterThan(assetWB.balance.amount().minus(fee.value.amount()))
  ) {
    return Promise.reject(
      intl?.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalanceAndFee' }) ?? 'BNB: input > balance - fee'
    )
  }

  // input > balance
  if (value.isGreaterThan(assetWB.balance.amount())) {
    return Promise.reject(
      intl?.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' }) ?? 'input > balance'
    )
  }

  return Promise.resolve()
}
