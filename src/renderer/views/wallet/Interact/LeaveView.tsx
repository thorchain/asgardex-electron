import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { Leave } from '../../../components/interact/forms/Leave'
import { Button } from '../../../components/uielements/button'
import { useChainContext } from '../../../contexts/ChainContext'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './InteractView.styles'

type Props = {}

export const LeaveView: React.FC<Props> = () => {
  const [interactState, setInteractState] = useState<InteractState>(INITIAL_INTERACT_STATE)
  const { interactService$ } = useThorchainContext()
  const { txStatus$ } = useChainContext()
  const intl = useIntl()

  const interact$ = useMemo(() => interactService$(txStatus$), [interactService$, txStatus$])
  const leaveTx = useCallback(
    ({ memo }: { memo: string }) =>
      /**
       * Send minimal amount
       * @docs https://docs.thorchain.org/thornodes/leaving#leaving
       */
      interact$({ amount: baseAmount(1), memo }).subscribe(setInteractState),
    [interact$, setInteractState]
  )

  const resetResults = useCallback(() => {
    setInteractState(INITIAL_INTERACT_STATE)
  }, [setInteractState])

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
      () => <Leave onFinish={leaveTx} />,
      () => <Leave isLoading={true} onFinish={FP.identity} loadingProgress={stepLabel} />,
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'deposit.leave.state.error' })} subTitle={msg}>
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      () => (
        <Styled.SuccessView>
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
