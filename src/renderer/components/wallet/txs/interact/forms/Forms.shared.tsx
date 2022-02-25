import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { IntlShape } from 'react-intl'

import { Network } from '../../../../../../shared/api/types'
import { GetExplorerTxUrl, OpenExplorerTxUrl } from '../../../../../services/clients'
import { InteractState } from '../../../../../services/thorchain/types'
import { TxModal } from '../../../../modal/tx'
import { SendAsset } from '../../../../modal/tx/extra/SendAsset'
import { ViewTxButton } from '../../../../uielements/button'
import * as TxH from '../../TxForm.helpers'
import * as H from './Forms.helpers'

export const renderTxModal = ({
  asset,
  amountToSend,
  network,
  interactState,
  resetInteractState,
  sendTxStartTime,
  openExplorerTxUrl,
  getExplorerTxUrl,
  intl
}: {
  asset: Asset
  amountToSend: BaseAmount
  network: Network
  interactState: InteractState
  resetInteractState: FP.Lazy<void>
  sendTxStartTime: number
  openExplorerTxUrl: OpenExplorerTxUrl
  getExplorerTxUrl: GetExplorerTxUrl
  intl: IntlShape
}) => {
  const { txRD } = interactState

  // don't render TxModal in initial state
  if (RD.isInitial(txRD)) return <></>

  const oTxHash = RD.toOption(txRD)

  const txRDasBoolean = FP.pipe(
    txRD,
    RD.map((txHash) => !!txHash)
  )

  return (
    <TxModal
      title={intl.formatMessage({ id: 'common.tx.sending' })}
      onClose={resetInteractState}
      onFinish={resetInteractState}
      startTime={sendTxStartTime}
      txRD={txRDasBoolean}
      extraResult={
        <ViewTxButton
          txHash={oTxHash}
          onClick={openExplorerTxUrl}
          txUrl={FP.pipe(oTxHash, O.chain(getExplorerTxUrl))}
        />
      }
      timerValue={TxH.getSendTxTimerValue(txRD)}
      extra={
        <SendAsset
          asset={{ asset, amount: amountToSend }}
          title={H.getInteractiveDescription({ state: interactState, intl })}
          network={network}
        />
      }
    />
  )
}
