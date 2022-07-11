import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { IntlShape } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { SendTxState } from '../../../../services/chain/types'
import { GetExplorerTxUrl, OpenExplorerTxUrl } from '../../../../services/clients'
import { TxModal } from '../../../modal/tx'
import { SendAsset } from '../../../modal/tx/extra/SendAsset'
import { ViewTxButton } from '../../../uielements/button'
import * as H from '../TxForm.helpers'

export const renderTxModal = ({
  asset,
  amountToSend,
  network,
  sendTxState,
  resetSendTxState,
  sendTxStartTime,
  openExplorerTxUrl,
  getExplorerTxUrl,
  intl
}: {
  asset: Asset
  amountToSend: BaseAmount
  network: Network
  sendTxState: SendTxState
  resetSendTxState: FP.Lazy<void>
  sendTxStartTime: number
  openExplorerTxUrl: OpenExplorerTxUrl
  getExplorerTxUrl: GetExplorerTxUrl
  intl: IntlShape
}) => {
  const { status } = sendTxState

  // don't render TxModal in initial state
  if (RD.isInitial(status)) return <></>

  const oTxHash = RD.toOption(status)
  const txRD = FP.pipe(
    status,
    RD.map((txHash) => !!txHash)
  )

  return (
    <TxModal
      title={intl.formatMessage({ id: 'common.tx.sending' })}
      onClose={resetSendTxState}
      onFinish={resetSendTxState}
      startTime={sendTxStartTime}
      txRD={txRD}
      extraResult={
        <ViewTxButton
          txHash={oTxHash}
          onClick={openExplorerTxUrl}
          txUrl={FP.pipe(oTxHash, O.chain(getExplorerTxUrl))}
        />
      }
      timerValue={H.getSendTxTimerValue(status)}
      extra={
        <SendAsset
          asset={{ asset, amount: amountToSend }}
          description={H.getSendTxDescription({ status, asset, intl })}
          network={network}
        />
      }
    />
  )
}
