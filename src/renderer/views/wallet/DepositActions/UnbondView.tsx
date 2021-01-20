import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Unbond } from '../../../components/depositActions/forms/Unbond'
import { Button } from '../../../components/uielements/button'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './DepositActionsView.styles'

type Props = {
  goToTransaction: (txHash: string) => void
}

export const UnbondView: React.FC<Props> = ({ goToTransaction }) => {
  const [interactState, setInteractState] = useState<InteractState>(INITIAL_INTERACT_STATE)
  const { interact$ } = useThorchainContext()
  const intl = useIntl()

  const unbondTx = useCallback(
    ({ memo }: { memo: string }) =>
      /**
       * it does not matter which amount to send
       * @docs https://docs.thorchain.org/thornodes/leaving#unbonding
       */
      interact$({ amount: baseAmount(1), memo }).subscribe(setInteractState),
    [interact$, setInteractState]
  )

  const resetResults = useCallback(() => {
    setInteractState(INITIAL_INTERACT_STATE)
  }, [setInteractState])

  const stepLabels = useMemo(
    () => [
      intl.formatMessage({ id: 'deposit.add.state.sending' }),
      intl.formatMessage({ id: 'deposit.add.state.checkResults' })
    ],
    [intl]
  )
  const stepLabel = useMemo(
    () =>
      `${intl.formatMessage(
        { id: 'common.step' },
        { total: interactState.stepsTotal, current: interactState.step }
      )}: ${stepLabels[interactState.step - 1]}...`,
    [interactState.step, stepLabels, intl]
  )

  return FP.pipe(
    interactState.txRD,
    RD.fold(
      () => <Unbond onFinish={unbondTx} />,
      () => <Unbond isLoading={true} onFinish={FP.identity} loadingProgress={stepLabel} />,
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'deposit.unbond.state.error' })} subTitle={msg}>
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'deposit.unbond.state.success' })}>
          <Styled.ViewTxButton onClick={goToTransaction} txHash={O.some(txHash)} />
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
