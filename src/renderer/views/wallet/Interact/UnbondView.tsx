import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { baseAmount, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { WalletType } from '../../../../shared/wallet/types'
import { Unbond } from '../../../components/interact/forms/Unbond'
import { Button } from '../../../components/uielements/button'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './InteractView.styles'

type Props = {
  walletType: WalletType
  openExplorerTxUrl: (txHash: TxHash) => void
}

export const UnbondView: React.FC<Props> = ({ walletType, openExplorerTxUrl: goToTransaction }) => {
  const {
    state: interactState,
    reset: resetInteractState,
    subscribe: subscribeInteractState
  } = useSubscriptionState<InteractState>(INITIAL_INTERACT_STATE)

  const { interact$ } = useThorchainContext()
  const intl = useIntl()

  const { validateAddress } = useValidateAddress(THORChain)

  const unbondTx = useCallback(
    ({ memo }: { memo: string }) => {
      subscribeInteractState(
        /**
         * it does not matter which amount to send
         * @docs https://docs.thorchain.org/thornodes/leaving#unbonding
         */
        interact$({ walletType, amount: baseAmount(1), memo })
      )
    },
    [interact$, subscribeInteractState, walletType]
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
      () => <Unbond addressValidation={validateAddress} onFinish={unbondTx} />,
      () => (
        <Unbond
          addressValidation={validateAddress}
          isLoading={true}
          onFinish={FP.identity}
          loadingProgress={stepLabel}
        />
      ),
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'deposit.unbond.state.error' })} subTitle={msg}>
          <Button onClick={resetInteractState}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'common.success' })}>
          <Styled.ViewTxButton txHash={O.some(txHash)} onClick={goToTransaction} />
          <Button onClick={resetInteractState}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
