import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, BaseAmount, baseToAsset, THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { WalletType } from '../../../../shared/wallet/types'
import { Bond } from '../../../components/interact/forms'
import { Button } from '../../../components/uielements/button'
import { ZERO_ASSET_AMOUNT } from '../../../const'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { eqAsset } from '../../../helpers/fp/eq'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { INITIAL_INTERACT_STATE } from '../../../services/thorchain/const'
import { InteractState } from '../../../services/thorchain/types'
import { DEFAULT_BALANCES_FILTER } from '../../../services/wallet/const'
import * as Styled from './InteractView.styles'

type Props = {
  walletType: WalletType
  walletIndex: number
  walletAddress: string
  goToTransaction: (txHash: string) => void
}

export const BondView: React.FC<Props> = ({ walletType, walletIndex, walletAddress, goToTransaction }) => {
  const { balancesState$ } = useWalletContext()

  const {
    state: interactState,
    reset: resetInteractState,
    subscribe: subscribeInteractState
  } = useSubscriptionState<InteractState>(INITIAL_INTERACT_STATE)

  const { interact$ } = useThorchainContext()
  const intl = useIntl()

  const { validateAddress } = useValidateAddress(THORChain)

  const [runeBalance] = useObservableState(
    () =>
      FP.pipe(
        balancesState$(DEFAULT_BALANCES_FILTER),
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
    ({ amount, memo }: { amount: BaseAmount; memo: string }) => {
      subscribeInteractState(interact$({ walletType, walletIndex, amount, memo }))
    },
    [interact$, subscribeInteractState, walletIndex, walletType]
  )

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
      () => <Bond addressValidation={validateAddress} max={runeBalance} onFinish={bondTx} />,
      () => (
        <Bond
          addressValidation={validateAddress}
          isLoading={true}
          max={runeBalance}
          onFinish={FP.identity}
          loadingProgress={stepLabel}
        />
      ),
      ({ msg }) => (
        <Styled.ErrorView title={intl.formatMessage({ id: 'deposit.bond.state.error' })} subTitle={msg}>
          <Button onClick={resetInteractState}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.ErrorView>
      ),
      (txHash) => (
        <Styled.SuccessView title={intl.formatMessage({ id: 'common.tx.success' })}>
          <Styled.ViewTxButton txHash={O.some(txHash)} onClick={goToTransaction} />
          <Button onClick={resetInteractState}>{intl.formatMessage({ id: 'common.back' })}</Button>
        </Styled.SuccessView>
      )
    )
  )
}
