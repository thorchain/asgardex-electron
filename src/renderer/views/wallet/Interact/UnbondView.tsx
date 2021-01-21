import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { Unbond } from '../../../components/interact/forms/Unbond'
import { Button } from '../../../components/uielements/button'
import { useChainContext } from '../../../contexts/ChainContext'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './InteractView.styles'

type Props = {}

export const UnbondView: React.FC<Props> = () => {
  const [interactState, setInteractState] = useState<InteractState>(INITIAL_INTERACT_STATE)
  const { interactService$ } = useThorchainContext()
  const { txStatus$ } = useChainContext()
  const intl = useIntl()

  const possibleSubRef = useRef<null | Rx.Subscription>(null)

  const interact$ = useMemo(() => interactService$(txStatus$), [interactService$, txStatus$])

  const unbondTx = useCallback(
    ({ memo }: { memo: string }) => {
      if (possibleSubRef.current) {
        possibleSubRef.current.unsubscribe()
      }
      /**
       * it does not matter which amount to send
       * @docs https://docs.thorchain.org/thornodes/leaving#unbonding
       */
      possibleSubRef.current = interact$({ amount: baseAmount(1), memo }).subscribe(setInteractState)
    },
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

  useEffect(() => {
    // Unsubscribe from possible subscription when unmount
    return () => {
      if (possibleSubRef.current) {
        possibleSubRef.current.unsubscribe()
      }
    }
  }, [])

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
      () => (
        <Styled.SuccessView>
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
