import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { Leave } from '../../../components/interact/forms/Leave'
import { Button } from '../../../components/uielements/button'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './InteractView.styles'

type Props = {
  goToTransaction: (txHash: string) => void
}

export const LeaveView: React.FC<Props> = ({ goToTransaction }) => {
  const [interactState, setInteractState] = useState<InteractState>(INITIAL_INTERACT_STATE)
  const { interact$ } = useThorchainContext()
  const intl = useIntl()

  const oSubRef = useRef<O.Option<Rx.Subscription>>(O.none)

  const unsubscribeSub = useCallback(() => {
    FP.pipe(
      oSubRef.current,
      O.map((sub) => sub.unsubscribe())
    )
  }, [])

  const leaveTx = useCallback(
    ({ memo }: { memo: string }) => {
      unsubscribeSub()
      /**
       * Send minimal amount
       * @docs https://docs.thorchain.org/thornodes/leaving#leaving
       */
      oSubRef.current = O.some(interact$({ amount: baseAmount(1), memo }).subscribe(setInteractState))
    },
    [interact$, setInteractState, unsubscribeSub]
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

  useEffect(() => {
    // Unsubscribe from possible subscription when unmount
    return () => {
      unsubscribeSub()
    }
  }, [unsubscribeSub])

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
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'common.success' })}>
          <Styled.ViewTxButton txHash={O.some(txHash)} onClick={goToTransaction} />
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
