import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Leave } from '../../../components/depositActions/forms/Leave'
import { Button } from '../../../components/uielements/button'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './DepositActionsView.styles'

type Props = {
  goToTransaction: (txHash: string) => void
}

export const LeaveView: React.FC<Props> = ({ goToTransaction }) => {
  const [depositState, setDepositState] = useState<InteractState>(INITIAL_INTERACT_STATE)
  const { interact$ } = useThorchainContext()
  const intl = useIntl()

  const leaveTx = useCallback(
    ({ memo }: { memo: string }) =>
      /**
       * Send minimal amount
       * @docs https://docs.thorchain.org/thornodes/leaving#leaving
       */
      interact$({ amount: baseAmount(1), memo }).subscribe(setDepositState),
    [interact$, setDepositState]
  )

  const resetResults = useCallback(() => {
    setDepositState(INITIAL_INTERACT_STATE)
  }, [setDepositState])

  const stepLabels = useMemo(
    () => [
      intl.formatMessage({ id: 'deposit.add.state.sending' }),
      intl.formatMessage({ id: 'deposit.add.state.checkResults' })
    ],
    [intl]
  )
  const stepLabel = useMemo(() => `${stepLabels[depositState.step - 1]}...`, [depositState.step, stepLabels])

  return FP.pipe(
    depositState.txRD,
    RD.fold(
      () => <Leave onFinish={leaveTx} />,
      () => <Leave isLoading={true} onFinish={FP.identity} loadingProgress={stepLabel} />,
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'deposit.leave.state.error' })} subTitle={msg}>
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'deposit.leave.state.success' })}>
          <Styled.ViewTxButton onClick={goToTransaction} txHash={O.some(txHash)} />
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
