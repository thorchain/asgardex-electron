import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, assetToString, THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'
import { useHistory } from 'react-router-dom'

import { LoadingView } from '../../../components/shared/loading'
import { BackLink } from '../../../components/uielements/backLink'
import { Interact } from '../../../components/wallet/txs/interact'
import { InteractType } from '../../../components/wallet/txs/interact/Interact.types'
import { InteractForm } from '../../../components/wallet/txs/interact/InteractForm'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { liveData } from '../../../helpers/rx/liveData'
import { getWalletBalanceByAddress } from '../../../helpers/walletHelper'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import * as walletRoutes from '../../../routes/wallet'
import { FeeRD } from '../../../services/chain/types'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import * as Styled from './InteractView.styles'

export const InteractView: React.FC = () => {
  const {
    interactType,
    walletAddress,
    walletType,
    walletIndex: walletIndexRoute
  } = useParams<walletRoutes.InteractParams>()

  const history = useHistory()

  const walletIndex = parseInt(walletIndexRoute)

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
        oBalances,
        O.chain((balances) => getWalletBalanceByAddress(balances, walletAddress))
      ),
    [oBalances, walletAddress]
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
      history.push(
        walletRoutes.interact.path({
          interactType: type,
          walletAddress,
          walletType,
          walletIndex: walletIndex.toString()
        })
      )
    },
    [history, walletAddress, walletIndex, walletType]
  )

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink
            path={walletRoutes.assetDetail.path({
              asset: assetToString(AssetRuneNative),
              walletAddress,
              walletType,
              walletIndex: walletIndexRoute
            })}
          />
        </Col>
      </Row>
      <Styled.ContentContainer>
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
      </Styled.ContentContainer>
    </>
  )
}
