import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, assetToString, THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorView } from '../../../components/shared/error'
import { LoadingView } from '../../../components/shared/loading'
import { BackLink } from '../../../components/uielements/backLink'
import { Interact } from '../../../components/wallet/txs/interact'
import { getInteractTypeFromNullableString } from '../../../components/wallet/txs/interact/Interact.helpers'
import { InteractType } from '../../../components/wallet/txs/interact/Interact.types'
import { InteractForm } from '../../../components/wallet/txs/interact/InteractForm'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import {
  getWalletAddressFromNullableString,
  getWalletBalanceByAddress,
  getWalletIndexFromNullableString,
  getWalletTypeFromNullableString
} from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import * as walletRoutes from '../../../routes/wallet'
import { FeeRD } from '../../../services/chain/types'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import * as Styled from './InteractView.styles'

export const InteractView: React.FC = () => {
  const {
    interactType: routeInteractType,
    walletAddress: routeWalletAddress,
    walletType: routeWalletType,
    walletIndex: routeWalletIndex
  } = useParams<walletRoutes.InteractParams>()

  const intl = useIntl()

  const oInteractType = getInteractTypeFromNullableString(routeInteractType)
  const oWalletIndex = getWalletIndexFromNullableString(routeWalletIndex)
  const oWalletType = getWalletTypeFromNullableString(routeWalletType)
  const oWalletAddress = getWalletAddressFromNullableString(routeWalletAddress)

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
        sequenceTOption(oBalances, oWalletAddress),
        O.chain(([balances, walletAddress]) => getWalletBalanceByAddress(balances, walletAddress))
      ),
    [oBalances, oWalletAddress]
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
      FP.pipe(
        sequenceTOption(oWalletAddress, oWalletType, oWalletIndex),
        O.map(([walletAddress, walletType, walletIndex]) =>
          navigate(
            walletRoutes.interact.path({
              interactType: type,
              walletAddress,
              walletType,
              walletIndex: walletIndex.toString()
            })
          )
        )
      )
    },
    [navigate, oWalletAddress, oWalletType, oWalletIndex]
  )

  const renderRouteError = useMemo(
    () => (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.params' },
            {
              params: `routeInteractType: ${routeInteractType}, walletAddress: ${routeWalletAddress}, walletType: ${routeWalletType}, walletIndex: ${routeWalletIndex}, `
            }
          )}
        />
      </>
    ),
    [intl, routeWalletAddress, routeWalletIndex, routeWalletType, routeInteractType]
  )

  return FP.pipe(
    sequenceTOption(oInteractType, oWalletAddress, oWalletType, oWalletIndex),
    O.fold(
      () => renderRouteError,
      ([interactType, walletAddress, walletType, walletIndex]) => (
        <>
          <Row justify="space-between">
            <Col>
              <BackLink
                path={walletRoutes.assetDetail.path({
                  asset: assetToString(AssetRuneNative),
                  walletAddress,
                  walletType,
                  walletIndex: walletIndex.toString()
                })}
              />
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
