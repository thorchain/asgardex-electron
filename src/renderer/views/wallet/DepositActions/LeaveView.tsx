import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Leave } from '../../../components/depositActions/forms/Leave'
import { Button } from '../../../components/uielements/button'
import { useChainContext } from '../../../contexts/ChainContext'
import { INITIAL_ASYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { AsymDepositState } from '../../../services/chain/types'
import * as Styled from './DepositActionsView.styles'

type Props = {
  goToTransaction: (txHash: string) => void
}

export const LeaveView: React.FC<Props> = ({ goToTransaction }) => {
  const [depositState, setDepositState] = useState<AsymDepositState>(INITIAL_ASYM_DEPOSIT_STATE)
  const { asymDeposit$ } = useChainContext()
  const intl = useIntl()

  const leaveTx = useCallback(
    ({ memo }: { memo: string }) =>
      /**
       * Send minimal amount
       * @docs https://docs.thorchain.org/thornodes/leaving#leaving
       */
      asymDeposit$({ amount: baseAmount(1), memo, asset: AssetRuneNative, poolAddress: O.none }).subscribe(
        setDepositState
      ),
    [asymDeposit$, setDepositState]
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
      () => <Leave onFinish={leaveTx} />,
      () => <Leave isLoading={true} onFinish={FP.identity} loadingProgress={stepLabel} />,
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'deposit.add.state.error' })} subTitle={msg}>
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'deposit.add.state.success' })}>
          <Styled.ViewTxButton onClick={goToTransaction} txHash={O.some(txHash)} />
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
