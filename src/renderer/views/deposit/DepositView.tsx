import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, Chain, THORChain } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Deposit } from '../../components/deposit/Deposit'
import { ErrorView } from '../../components/shared/error'
import { RefreshButton } from '../../components/uielements/button'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { useSymDepositAddresses } from '../../hooks/useSymDepositAddresses'
import { DepositRouteParams } from '../../routes/pools/deposit'
import { AssetWithDecimalLD, AssetWithDecimalRD } from '../../services/chain/types'
import { PoolDetailRD, PoolSharesLD, PoolSharesRD } from '../../services/midgard/types'
import { SymDepositView } from './add/SymDepositView'
import * as Styled from './DepositView.styles'
import { ShareView } from './share/ShareView'
import { WithdrawDepositView } from './withdraw/WithdrawDepositView'

type Props = {}

export const DepositView: React.FC<Props> = () => {
  const intl = useIntl()

  const { network } = useNetwork()

  const { reloadLiquidityProviders } = useThorchainContext()

  const { asset } = useParams<DepositRouteParams>()
  const {
    service: {
      setSelectedPoolAsset,
      selectedPoolAsset$,
      pools: { reloadSelectedPoolDetail, selectedPoolDetail$, haltedChains$ },
      shares: { shares$, reloadShares }
    }
  } = useMidgardContext()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])
  const { mimirHalt } = useMimirHalt()
  const { keystoreService, reloadBalancesByChain } = useWalletContext()

  const { assetWithDecimal$ } = useChainContext()

  const oRouteAsset = useMemo(() => O.fromNullable(assetFromString(asset.toUpperCase())), [asset])

  // Set selected pool asset whenever an asset in route has been changed
  // Needed to get all data for this pool (pool details etc.)
  useEffect(() => {
    setSelectedPoolAsset(oRouteAsset)
    // Reset selectedPoolAsset on view's unmount to avoid effects with depending streams
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [oRouteAsset, setSelectedPoolAsset])

  const assetWithDecimalLD: AssetWithDecimalLD = useMemo(
    () =>
      FP.pipe(
        selectedPoolAsset$,
        RxOp.switchMap((oSelectedPoolAsset) =>
          FP.pipe(
            oSelectedPoolAsset,
            O.fold(
              () => Rx.of(RD.initial),
              (asset) => assetWithDecimal$(asset, network)
            )
          )
        )
      ),
    [network, selectedPoolAsset$, assetWithDecimal$]
  )

  const assetWithDecimalRD = useObservableState<AssetWithDecimalRD>(assetWithDecimalLD, RD.initial)

  const oSelectedAssetWithDecimal = useMemo(() => RD.toOption(assetWithDecimalRD), [assetWithDecimalRD])

  const {
    addresses: { rune: oRuneWalletAddress, asset: oAssetWalletAddress }
  } = useSymDepositAddresses(oRouteAsset)
  /**
   * We have to get a new shares$ stream for every new address
   * @description /src/renderer/services/midgard/shares.ts
   */
  const poolShares$: PoolSharesLD = useMemo(
    () =>
      FP.pipe(
        // re-load shares whenever selected asset or rune address has been changed
        sequenceTOption(oAssetWalletAddress, oRuneWalletAddress),
        O.fold(
          () => Rx.EMPTY,
          ([{ address }, _]) => shares$(address)
        )
      ),
    [oAssetWalletAddress, oRuneWalletAddress, shares$]
  )

  const poolSharesRD = useObservableState<PoolSharesRD>(poolShares$, RD.initial)

  const refreshButtonDisabled = useMemo(
    () =>
      FP.pipe(
        poolSharesRD,
        RD.toOption,
        (oPoolShares) => sequenceTOption(oPoolShares, oSelectedAssetWithDecimal),
        O.isNone
      ),
    [poolSharesRD, oSelectedAssetWithDecimal]
  )

  const reloadChainAndRuneBalances = useCallback(() => {
    FP.pipe(
      oSelectedAssetWithDecimal,
      O.map(({ asset: { chain } }) => {
        reloadBalancesByChain(chain)()
        reloadBalancesByChain(THORChain)()
        return true
      })
    )
  }, [oSelectedAssetWithDecimal, reloadBalancesByChain])

  const reloadHandler = useCallback(() => {
    reloadChainAndRuneBalances()
    reloadShares()
    reloadSelectedPoolDetail()
    reloadLiquidityProviders()
  }, [reloadChainAndRuneBalances, reloadLiquidityProviders, reloadSelectedPoolDetail, reloadShares])

  // Important note:
  // DON'T use `INITIAL_KEYSTORE_STATE` as default value for `keystoreState`
  // Because `useObservableState` will set its state NOT before first rendering loop,
  // and `AddWallet` would be rendered for the first time,
  // before a check of `keystoreState` can be done
  const keystoreState = useObservableState(keystoreService.keystore$, undefined)

  const poolDetailRD = useObservableState<PoolDetailRD>(selectedPoolDetail$, RD.initial)

  const renderTopContent = useMemo(
    () => (
      <Styled.TopControlsContainer>
        <Styled.BackLink />
        <RefreshButton disabled={refreshButtonDisabled} clickHandler={reloadHandler} />
      </Styled.TopControlsContainer>
    ),
    [refreshButtonDisabled, reloadHandler]
  )

  const renderLoadingContent = useMemo(
    () => (
      <Styled.Container>
        <Spin size="large" />
      </Styled.Container>
    ),
    []
  )

  // Special case: `keystoreState` is `undefined` in first render loop
  // (see comment at its definition using `useObservableState`)
  if (keystoreState === undefined) {
    return (
      <>
        {renderTopContent}
        {renderLoadingContent}
      </>
    )
  }

  return (
    <>
      {renderTopContent}
      {FP.pipe(
        sequenceTOption(oRuneWalletAddress, oAssetWalletAddress),
        O.fold(
          () => <ErrorView title={intl.formatMessage({ id: 'common.error' })} subTitle={'Could not get addresses'} />,
          ([runeWalletAddress, assetWalletAddress]) =>
            FP.pipe(
              assetWithDecimalRD,
              RD.fold(
                () => <></>,
                () => renderLoadingContent,
                (error) => (
                  <ErrorView
                    title={intl.formatMessage({ id: 'common.error' })}
                    subTitle={error?.message ?? error.toString()}
                  />
                ),
                (asset) => (
                  <Deposit
                    haltedChains={haltedChains}
                    mimirHalt={mimirHalt}
                    poolDetail={poolDetailRD}
                    asset={asset}
                    shares={poolSharesRD}
                    runeWalletAddress={runeWalletAddress}
                    assetWalletAddress={assetWalletAddress}
                    keystoreState={keystoreState}
                    ShareContent={ShareView}
                    SymDepositContent={SymDepositView}
                    WidthdrawContent={WithdrawDepositView}
                  />
                )
              )
            )
        )
      )}
    </>
  )
}
