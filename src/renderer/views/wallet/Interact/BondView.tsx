import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, BaseAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Bond } from '../../../components/interact/forms'
import { Button } from '../../../components/uielements/button'
import { ZERO_ASSET_AMOUNT } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { eqAsset } from '../../../helpers/fp/eq'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import * as Styled from './InteractView.styles'

type Props = {
  walletAddress: string
}

export const BondView: React.FC<Props> = ({ walletAddress }) => {
  const { balancesState$ } = useWalletContext()
  const [interactState, setInteractState] = useState<InteractState>(INITIAL_INTERACT_STATE)
  const { interactService$ } = useThorchainContext()
  const { txStatus$ } = useChainContext()
  const intl = useIntl()

  const possibleSubRef = useRef<null | Rx.Subscription>(null)

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

  const interact$ = useMemo(() => interactService$(txStatus$), [interactService$, txStatus$])

  const bondTx = useCallback(
    ({ amount, memo }: { amount: BaseAmount; memo: string }) => {
      if (possibleSubRef.current) {
        possibleSubRef.current.unsubscribe()
      }
      possibleSubRef.current = interact$({ amount, memo }).subscribe(setInteractState)
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
      () => <Bond max={runeBalance} onFinish={bondTx} />,
      () => <Bond isLoading={true} max={runeBalance} onFinish={FP.identity} loadingProgress={stepLabel} />,
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'deposit.bond.state.error' })} subTitle={msg}>
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
