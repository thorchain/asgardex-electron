import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { WalletType } from '../../../../shared/wallet/types'
import { Custom } from '../../../components/interact/forms/Custom'
import { Button } from '../../../components/uielements/button'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './InteractView.styles'

type Props = {
  walletType: WalletType
  walletIndex: number
}

export const CustomView: React.FC<Props> = ({ walletType, walletIndex }) => {
  const {
    state: interactState,
    reset: resetInteractState,
    subscribe: subscribeInteractState
  } = useSubscriptionState<InteractState>(INITIAL_INTERACT_STATE)

  const { interact$ } = useThorchainContext()
  const intl = useIntl()

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(O.some(THORChain))

  const customTx = useCallback(
    ({ amount, memo }: { amount: BaseAmount; memo: string }) => {
      subscribeInteractState(interact$({ walletType, walletIndex, amount, memo }))
    },
    [interact$, subscribeInteractState, walletIndex, walletType]
  )
  const stepLabels = useMemo(
    () => [intl.formatMessage({ id: 'common.tx.sending' }), intl.formatMessage({ id: 'common.tx.checkResult' })],
    [intl]
  )
  const stepLabel = useMemo(
    () =>
      `${intl.formatMessage(
        { id: 'common.step' },
        { total: interactState.stepsTotal, current: interactState.step }
      )}: ${stepLabels[interactState.step - 1]}...`,
    [interactState, stepLabels, intl]
  )

  return FP.pipe(
    interactState.txRD,
    RD.fold(
      () => <Custom onFinish={customTx} />,
      () => <Custom isLoading={true} onFinish={FP.identity} loadingProgress={stepLabel} />,
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'common.error' })} subTitle={msg}>
          <Button onClick={resetInteractState}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'common.tx.success' })}>
          <Styled.ViewTxButton
            txHash={O.some(txHash)}
            onClick={openExplorerTxUrl}
            getExplorerTxUrl={getExplorerTxUrl}
          />
          <Button onClick={resetInteractState}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
