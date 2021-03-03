import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { IntlShape } from 'react-intl'

import { emptyString } from '../../../helpers/stringHelper'
import { SendTxState } from '../../../services/chain/types'

export const sendTxStatusMsg = ({
  sendTxState,
  asset,
  intl
}: {
  sendTxState: SendTxState
  asset: Asset
  intl: IntlShape
}) => {
  const stepDescriptions = [
    intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: asset.ticker }),
    intl.formatMessage({ id: 'common.tx.checkResult' })
  ]
  const { steps, status } = sendTxState

  return FP.pipe(
    status,
    RD.fold(
      () => emptyString,
      () =>
        `${stepDescriptions[steps.current - 1]} (${intl.formatMessage(
          { id: 'common.step' },
          { current: steps.current, total: steps.total }
        )})`,
      () => emptyString,
      () => emptyString
    )
  )
}
