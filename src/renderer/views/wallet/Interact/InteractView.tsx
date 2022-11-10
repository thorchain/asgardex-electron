import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { ErrorView } from '../../../components/shared/error'
import { LoadingView } from '../../../components/shared/loading'
import { BackLinkButton } from '../../../components/uielements/button'
import { Interact } from '../../../components/wallet/txs/interact'
import { getInteractTypeFromNullableString } from '../../../components/wallet/txs/interact/Interact.helpers'
import { InteractType } from '../../../components/wallet/txs/interact/Interact.types'
import { InteractForm } from '../../../components/wallet/txs/interact/InteractForm'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { eqOSelectedWalletAsset } from '../../../helpers/fp/eq'
import { sequenceTOption, sequenceTRD } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { getWalletBalanceByAddress } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import * as walletRoutes from '../../../routes/wallet'
import { FeeRD } from '../../../services/chain/types'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { SelectedWalletAssetRD } from '../../../services/wallet/types'
import * as Styled from './InteractView.styles'

export const InteractView: React.FC = () => {
  const { interactType: routeInteractType } = useParams<walletRoutes.InteractParams>()

  const { selectedAsset$ } = useWalletContext()

  const [selectedAssetRD] = useObservableState<SelectedWalletAssetRD>(
    () =>
      FP.pipe(
        selectedAsset$,
        RxOp.distinctUntilChanged(eqOSelectedWalletAsset.equals),
        RxOp.map((v) => v),
        RxOp.map((oSelectedAsset) => RD.fromOption(oSelectedAsset, () => Error('No selected asset'))),
        RxOp.startWith(RD.pending)
      ),
    RD.initial
  )

  const interactTypeRD = FP.pipe(routeInteractType, getInteractTypeFromNullableString, (oInteractType) =>
    RD.fromOption(oInteractType, () => Error(`Invalid route param for interactive type: ${routeInteractType}`))
  )

  const navigate = useNavigate()

  const { network } = useNetwork()
  const {
    balancesState$,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

  const [{ balances: oBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(O.some(THORChain))

  const { validateAddress } = useValidateAddress(THORChain)

  const oWalletBalance = useMemo(
    () =>
      FP.pipe(
        selectedAssetRD,
        RD.toOption,
        (oSelectedAsset) => sequenceTOption(oBalances, oSelectedAsset),
        O.chain(([balances, { walletAddress }]) => getWalletBalanceByAddress(balances, walletAddress))
      ),
    [oBalances, selectedAssetRD]
  )

  const { interact$ } = useThorchainContext()

  const { fees$, reloadFees } = useThorchainContext()

  const [feeRD] = useObservableState<FeeRD>(
    () =>
      FP.pipe(
        fees$(),
        liveData.map((fees) => fees.fast)
      ),
    RD.initial
  )

  const interactTypeChanged = useCallback(
    (type: InteractType) => {
      navigate(
        walletRoutes.interact.path({
          interactType: type
        })
      )
    },
    [navigate]
  )

  return FP.pipe(
    sequenceTRD(interactTypeRD, selectedAssetRD),
    RD.fold(
      () => <LoadingView size="large" />,
      () => <LoadingView size="large" />,
      (error) => (
        <div>
          <BackLinkButton />
          <ErrorView title="Missing data for InteractiveView" subTitle={error?.message ?? error.toString()} />
        </div>
      ),
      ([interactType, { walletType, walletIndex, hdMode }]) => (
        <>
          <Row justify="space-between">
            <Col>
              <BackLinkButton />
            </Col>
          </Row>
          <Styled.Container>
            {FP.pipe(
              oWalletBalance,
              O.fold(
                () => <LoadingView size="large" />,
                (walletBalance) => (
                  <Interact
                    interactType={interactType}
                    interactTypeChanged={interactTypeChanged}
                    network={network}
                    walletType={walletType}>
                    <InteractForm
                      interactType={interactType}
                      walletIndex={walletIndex}
                      walletType={walletType}
                      hdMode={hdMode}
                      balance={walletBalance}
                      interact$={interact$}
                      openExplorerTxUrl={openExplorerTxUrl}
                      getExplorerTxUrl={getExplorerTxUrl}
                      addressValidation={validateAddress}
                      fee={feeRD}
                      reloadFeesHandler={reloadFees}
                      validatePassword$={validatePassword$}
                      network={network}
                    />
                  </Interact>
                )
              )
            )}
          </Styled.Container>
        </>
      )
    )
  )
}
