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
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { DepositRouteParams } from '../../routes/pools/deposit'
import { AssetWithDecimalLD, AssetWithDecimalRD } from '../../services/chain/types'
import { PoolDetailRD, PoolSharesLD, PoolSharesRD } from '../../services/midgard/types'
import { LiquidityProviderRD, LiquidityProviderLD } from '../../services/thorchain/types'
import { AsymDepositView } from './add/AsymDepositView'
import { SymDepositView } from './add/SymDepositView'
import * as Styled from './DepositView.styles'
import { ShareView } from './share/ShareView'
import { AsymWithdrawView } from './withdraw/AsymWithdrawView'
import { WithdrawDepositView } from './withdraw/WithdrawDepositView'

type Props = {}

export const DepositView: React.FC<Props> = () => {
  const intl = useIntl()

  const { network$ } = useAppContext()

  const { getLiquidityProvider, reloadLiquidityProviders } = useThorchainContext()

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

  const { keystoreService, reloadBalancesByChain } = useWalletContext()

  const { addressByChain$, assetWithDecimal$ } = useChainContext()

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
        Rx.combineLatest([network$, selectedPoolAsset$]),
        RxOp.switchMap(([network, oSelectedPoolAsset]) =>
          FP.pipe(
            oSelectedPoolAsset,
            O.fold(
              () => Rx.of(RD.initial),
              (asset) => assetWithDecimal$(asset, network)
            )
          )
        )
      ),
    [network$, selectedPoolAsset$, assetWithDecimal$]
  )

  const assetWithDecimalRD = useObservableState<AssetWithDecimalRD>(assetWithDecimalLD, RD.initial)

  const oSelectedAssetWithDecimal = useMemo(() => RD.toOption(assetWithDecimalRD), [assetWithDecimalRD])

  const address$ = useMemo(
    () =>
      FP.pipe(
        selectedPoolAsset$,
        RxOp.switchMap(
          O.fold(
            () => Rx.of(O.none),
            (asset) => addressByChain$(asset.chain)
          )
        )
      ),

    [addressByChain$, selectedPoolAsset$]
  )
  const oAssetWalletAddress = useObservableState(address$, O.none)

  /**
   * We have to get a new shares$ stream for every new address
   * @description /src/renderer/services/midgard/shares.ts
   */
  const poolShares$: PoolSharesLD = useMemo(
    () =>
      FP.pipe(
        oAssetWalletAddress,
        O.fold(() => Rx.EMPTY, shares$)
      ),
    [oAssetWalletAddress, shares$]
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

  const [liquidityProvider] = useObservableState<LiquidityProviderRD>(() => {
    return Rx.combineLatest([
      network$,
      // We should look for THORChain's wallet at the response of liqudity_providers endpoint
      address$,
      addressByChain$(THORChain),
      selectedPoolAsset$
    ]).pipe(
      RxOp.switchMap(([network, oAssetAddress, oRuneAddress, oSelectedPoolAsset]) => {
        return FP.pipe(
          sequenceTOption(oRuneAddress, oAssetAddress, oSelectedPoolAsset),
          O.fold(
            (): LiquidityProviderLD => Rx.of(RD.initial),
            ([runeAddress, assetAddress, asset]) => getLiquidityProvider({ asset, network, runeAddress, assetAddress })
          )
        )
      })
    )
  }, RD.initial)

  // Special case: `keystoreState` is `undefined` in first render loop
  // (see comment at its definition using `useObservableState`)
  if (keystoreState === undefined) {
    return <></>
  }

  return (
    <>
      <Styled.TopControlsContainer>
        <Styled.BackLink />
        <RefreshButton disabled={refreshButtonDisabled} clickHandler={reloadHandler} />
      </Styled.TopControlsContainer>
      {FP.pipe(
        assetWithDecimalRD,
        RD.fold(
          () => <></>,
          () => (
            <Styled.Container>
              <Spin size="large" />
            </Styled.Container>
          ),
          (error) => (
            <ErrorView
              title={intl.formatMessage({ id: 'common.error' })}
              subTitle={error?.message ?? error.toString()}
            />
          ),
          (asset) => (
            <Deposit
              haltedChains={haltedChains}
              poolDetail={poolDetailRD}
              asset={asset}
              shares={poolSharesRD}
              liquidityProvider={liquidityProvider}
              keystoreState={keystoreState}
              ShareContent={ShareView}
              SymDepositContent={SymDepositView}
              AsymDepositContent={AsymDepositView}
              WidthdrawContent={WithdrawDepositView}
              AsymWidthdrawContent={AsymWithdrawView}
            />
          )
        )
      )}
    </>
  )
}
