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
import { useChainContext } from '../../../contexts/ChainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { eqAsset } from '../../../helpers/fp/eq'
import { INITIAL_ASYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { AsymDepositState } from '../../../services/chain/types'
import * as Styled from './DepositActionsView.styles'

type Props = {
  walletAddress: string
}

export const BondView: React.FC<Props> = ({ walletAddress }) => {
  const { balancesState$ } = useWalletContext()
  const [depositState, setDepositState] = useState<AsymDepositState>(INITIAL_ASYM_DEPOSIT_STATE)
  const { asymDeposit$, getExplorerUrlByAsset$ } = useChainContext()
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
    ({ amount, memo }: { amount: BaseAmount; memo: string }) =>
      asymDeposit$({ amount, memo, asset: AssetRuneNative, poolAddress: O.none }).subscribe(setDepositState),
    [asymDeposit$, setDepositState]
  )

  const [explorerUrl] = useObservableState(() => getExplorerUrlByAsset$(AssetRuneNative), O.none)

  const goToTransaction = useCallback(
    (txHash: string) => {
      FP.pipe(
        explorerUrl,
        O.map((getExplorerUrl) => window.apiUrl.openExternal(getExplorerUrl(txHash)))
      )
    },
    [explorerUrl]
  )

  const resetResults = useCallback(() => {
    setDepositState(INITIAL_ASYM_DEPOSIT_STATE)
  }, [])

  /**
   * INITIAL_ASYM_DEPOSIT_STATE starts wit step 1 but we don't need any label for initial state
   */
  const stepLabels = [undefined, 'Health check...', 'Send deposit transaction...', 'Check deposit result...']
  const stepLabel = useMemo(() => stepLabels[depositState.step - 1], [depositState.step, stepLabels])

  return FP.pipe(
    depositState.txRD,
    RD.fold(
      () => <Bond max={runeBalance} onFinish={bondTx} loadingProgress={stepLabel} />,
      () => <Bond isLoading={true} max={runeBalance} onFinish={FP.identity} loadingProgress={stepLabel} />,
      ({ msg }) => (
        <Styled.ErrorView title={msg}>
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'common.success' })}>
          <Styled.ViewTxButton onClick={goToTransaction} txHash={O.some(txHash)} />
          <Button onClick={resetResults}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
