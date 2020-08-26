import { bn, AssetAmount, isValidBN, formatAssetAmount } from '@thorchain/asgardex-util'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { IntlShape } from 'react-intl'

import { isBnbAsset, BNB_SYMBOL } from '../../../helpers/assetHelper'
import { validateBN, lessThanOrEqualTo, greaterThan } from '../../../helpers/form/validation'
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

  // input < 0
  if (value.isLessThanOrEqualTo(0)) {
    return Promise.reject(
      intl?.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }) ?? 'input <= 0'
    )
  }

  // bnb balance > fee (non BNB assets only)
  if (!isBnbAsset(assetWB.asset) && O.isSome(fee) && bnbAmount.amount().isLessThan(fee.value.amount())) {
    return Promise.reject(
      intl?.formatMessage(
        { id: 'wallet.errors.fee.notCovered' },
        { fee: formatAssetAmount(bnbAmount, 6), balance: `${formatAssetAmount(bnbAmount, 8)} ${BNB_SYMBOL}` }
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

export type FreezeAmountValidatorProps = {
  input: string
  maxAmount: AssetAmount
  intl?: IntlShape
}

export const validateFreezeInput = async ({ input, maxAmount, intl }: FreezeAmountValidatorProps): Promise<void> => {
  const errorMsg1 = intl?.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }) ?? 'Invalid input'
  const errorMsg2 =
    intl?.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }) ?? 'input <= 0'
  const errorMsg3 = intl?.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' }) ?? 'input > maxAmount'

  const min = bn(0)
  const max = maxAmount.amount()

  // validate input
  return FP.pipe(
    input,
    // valid BigNumber
    validateBN(errorMsg1),
    // input > 0
    E.chain(greaterThan(min)(errorMsg2)),
    // input <= maxAmount
    E.chain(lessThanOrEqualTo(max)(errorMsg3)),
    // return Promise - needed by antd form
    E.fold(
      (left) => Promise.reject(left),
      (_) => Promise.resolve()
    )
  )
}
