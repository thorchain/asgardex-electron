import { AssetAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'

import { ZERO_ASSET_AMOUNT } from '../../../const'
import { lessThanOrEqualTo, greaterThan, validateBN } from '../../../helpers/form/validation'

export type TxAmountValidatorProps = {
  input: BigNumber
  maxAmount: AssetAmount
  minAmount?: AssetAmount
  errors: {
    msg1: string
    msg2: string
    msg3: string
  }
}

export const validateTxAmountInput = ({
  input,
  maxAmount,
  errors,
  minAmount = ZERO_ASSET_AMOUNT
}: TxAmountValidatorProps): Promise<void> => {
  const max = maxAmount.amount()
  // validate input
  return FP.pipe(
    input,
    // valid number
    validateBN(errors.msg1),
    // input > 0
    E.chain(greaterThan(minAmount.amount())(errors.msg2)),
    // input <= maxAmount
    E.chain(lessThanOrEqualTo(max)(errors.msg3)),
    // return Promise - needed by antd form
    E.fold(
      (left) => Promise.reject(left),
      (_) => Promise.resolve()
    )
  )
}
