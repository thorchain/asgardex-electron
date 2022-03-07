import * as RD from '@devexperts/remote-data-ts'
import { bn } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import { IntlShape } from 'react-intl'

import { greaterThan, greaterThanEqualTo, validateBN } from '../../../../helpers/form/validation'
import { emptyString } from '../../../../helpers/stringHelper'
import { InteractState } from '../../../../services/thorchain/types'

export const getInteractiveDescription = ({ state, intl }: { state: InteractState; intl: IntlShape }): string => {
  const { step, stepsTotal, txRD } = state
  const stepLabels = [
    intl.formatMessage({ id: 'common.tx.sending' }),
    intl.formatMessage({ id: 'common.tx.checkResult' })
  ]

  const stepLabel = `${intl.formatMessage({ id: 'common.step' }, { total: stepsTotal, current: step })}: ${
    stepLabels[step - 1]
  }...`

  return FP.pipe(
    txRD,
    RD.fold(
      () => emptyString,
      () => stepLabel,
      () => emptyString,
      () => intl.formatMessage({ id: 'common.tx.success' })
    )
  )
}

export const validateUnboundAmountInput = ({
  input,
  errors
}: {
  input: BigNumber
  errors: {
    msg1: string
    msg2: string
  }
}): Promise<void> => {
  // validate input
  return FP.pipe(
    input,
    // valid number
    validateBN(errors.msg1),
    // input > 0
    E.chain(greaterThan(bn(0))(errors.msg2)),
    // return Promise - needed by antd form
    E.fold(
      (left) => Promise.reject(left),
      (_) => Promise.resolve()
    )
  )
}

export const validateCustomAmountInput = ({
  input,
  errors
}: {
  input: BigNumber
  errors: {
    msg1: string
    msg2: string
  }
}): Promise<void> => {
  // validate input
  return FP.pipe(
    input,
    // valid number
    validateBN(errors.msg1),
    // input >= 0
    E.chain(greaterThanEqualTo(bn(0))(errors.msg2)),
    // return Promise - needed by antd form
    E.fold(
      (left) => Promise.reject(left),
      (_) => Promise.resolve()
    )
  )
}
