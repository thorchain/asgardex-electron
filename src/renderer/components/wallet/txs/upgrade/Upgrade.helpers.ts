import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { IntlShape } from 'react-intl'

import { emptyString } from '../../../../helpers/stringHelper'
import { UpgradeRuneTxState } from '../../../../services/chain/types'

export const getUpgradeDescription = ({ state, intl }: { state: UpgradeRuneTxState; intl: IntlShape }): string => {
  const {
    status,
    steps: { total, current }
  } = state
  const stepLabels = [
    intl.formatMessage({ id: 'common.tx.healthCheck' }),
    intl.formatMessage({ id: 'common.tx.sending' }),
    intl.formatMessage({ id: 'common.tx.checkResult' })
  ]

  const stepLabel = `${intl.formatMessage({ id: 'common.step' }, { total, current })}: ${stepLabels[current - 1]}...`

  return FP.pipe(
    status,
    RD.fold(
      () => emptyString,
      () => stepLabel,
      () => emptyString,
      () => intl.formatMessage({ id: 'common.tx.success' })
    )
  )
}
