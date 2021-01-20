import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, BaseAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { Bond } from '../../../components/depositActions/forms'
import { Button } from '../../../components/uielements/button'
import { ZERO_ASSET_AMOUNT } from '../../../const'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { eqAsset } from '../../../helpers/fp/eq'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './DepositActionsView.styles'

type Props = {
  walletAddress: string
  goToTransaction: (txHash: string) => void
}

export const BondView: React.FC<Props> = ({ walletAddress, goToTransaction }) => {
  const { balancesState$ } = useWalletContext()
  const [interactState, setInteractState] = useState<InteractState>(INITIAL_INTERACT_STATE)
  const { interact$ } = useThorchainContext()
  const intl = useIntl()

  const [runeBalance] = useObservableState(
    () =>
      FP.pipe(
        balancesState$,
        RxOp.map(({ balances }) => balances),
        RxOp.map(
          FP.flow(
            O.chain(
              A.findFirst(
                ({ walletAddress: balanceWalletAddress, asset }) =>
                  balanceWalletAddress === walletAddress && eqAsset.equals(asset, AssetRuneNative)
              )
            ),
            O.map(({ amount }) => amount),
            O.map(baseToAsset),
            O.getOrElse(() => ZERO_ASSET_AMOUNT)
          )
        )
      ),
    ZERO_ASSET_AMOUNT
  )

  const bondTx = useCallback(
    ({ amount, memo }: { amount: BaseAmount; memo: string }) => interact$({ amount, memo }).subscribe(setInteractState),
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
      () => <Bond max={runeBalance} onFinish={bondTx} />,
      () => <Bond isLoading={true} max={runeBalance} onFinish={FP.identity} loadingProgress={stepLabel} />,
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'deposit.bond.state.error' })} subTitle={msg}>
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'deposit.bond.state.success' })}>
          <Styled.ViewTxButton onClick={goToTransaction} txHash={O.some(txHash)} />
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
