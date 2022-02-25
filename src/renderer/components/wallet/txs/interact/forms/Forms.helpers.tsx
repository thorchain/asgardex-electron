import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { IntlShape } from 'react-intl'

import { emptyString } from '../../../../../helpers/stringHelper'
import { InteractState } from '../../../../../services/thorchain/types'

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
