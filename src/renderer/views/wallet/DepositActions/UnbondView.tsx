import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Unbond } from '../../../components/depositActions/forms/Unbond'
import { Button } from '../../../components/uielements/button'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { INITIAL_ASYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { AsymDepositState } from '../../../services/chain/types'
import * as Styled from './DepositActionsView.styles'

type Props = {
  goToTransaction: (txHash: string) => void
}

export const UnbondView: React.FC<Props> = ({ goToTransaction }) => {
  const [depositState, setDepositState] = useState<AsymDepositState>(INITIAL_ASYM_DEPOSIT_STATE)
  const { interact$ } = useThorchainContext()
  const intl = useIntl()

  const unbondTx = useCallback(
    ({ memo }: { memo: string }) =>
      /**
       * it does not matter which amount to send
       * @docs https://docs.thorchain.org/thornodes/leaving#unbonding
       */
      interact$({ amount: baseAmount(1), memo }).subscribe(setDepositState),
    [interact$, setDepositState]
  )

  const resetResults = useCallback(() => {
    setDepositState(INITIAL_ASYM_DEPOSIT_STATE)
  }, [setDepositState])

  const stepLabels = useMemo(
    () => [
      intl.formatMessage({ id: 'deposit.add.state.healthCheck' }),
      intl.formatMessage({ id: 'deposit.add.state.sending' }),
      intl.formatMessage({ id: 'deposit.add.state.checkResults' })
    ],
    [intl]
  )
  const stepLabel = useMemo(() => `${stepLabels[depositState.step - 1]}...`, [depositState.step, stepLabels])

  return FP.pipe(
    depositState.txRD,
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
