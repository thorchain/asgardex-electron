import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, THORChain } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Deposit } from '../../components/deposit/Deposit'
import { ErrorView } from '../../components/shared/error'
import { RefreshButton } from '../../components/uielements/button'
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { DepositRouteParams } from '../../routes/pools/deposit'
import { AssetWithDecimalRD } from '../../services/chain/types'
import { DEFAULT_NETWORK } from '../../services/const'
import { PoolSharesLD, PoolSharesRD } from '../../services/midgard/types'
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
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { asset } = useParams<DepositRouteParams>()
  const {
    service: {
      setSelectedPoolAsset,
      selectedPoolAsset$,
      pools: { reloadSelectedPoolDetail },
      shares: { shares$, reloadShares }
    }
  } = useMidgardContext()

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

  const [assetRD] = useObservableState<AssetWithDecimalRD>(
    () =>
      selectedPoolAsset$.pipe(
        RxOp.switchMap((oAsset) =>
          FP.pipe(
            oAsset,
            O.fold(
              () => Rx.of(RD.initial),
              (asset) => assetWithDecimal$(asset, network)
            )
          )
        )
      ),
    RD.initial
  )

  const oSelectedAsset = useMemo(() => RD.toOption(assetRD), [assetRD])

  const address$ = useMemo(
    () =>
      FP.pipe(
        oSelectedAsset,
        O.fold(
          () => Rx.EMPTY,
          ({ asset }) => addressByChain$(asset.chain)
        )
      ),

    [addressByChain$, oSelectedAsset]
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
    () => FP.pipe(poolSharesRD, RD.toOption, (oPoolShares) => sequenceTOption(oPoolShares, oSelectedAsset), O.isNone),
    [poolSharesRD, oSelectedAsset]
  )

  const reloadChainAndRuneBalances = useCallback(() => {
    FP.pipe(
      oSelectedAsset,
      O.map(({ asset: { chain } }) => {
        reloadBalancesByChain(chain)()
        reloadBalancesByChain(THORChain)()
        return true
      })
    )
  }, [oSelectedAsset, reloadBalancesByChain])

  const reloadHandler = useCallback(() => {
    reloadChainAndRuneBalances()
    reloadShares()
    reloadSelectedPoolDetail()
  }, [reloadChainAndRuneBalances, reloadSelectedPoolDetail, reloadShares])

  // Important note:
  // DON'T use `INITIAL_KEYSTORE_STATE` as default value for `keystoreState`
  // Because `useObservableState` will set its state NOT before first rendering loop,
  // and `AddWallet` would be rendered for the first time,
  // before a check of `keystoreState` can be done
  const keystoreState = useObservableState(keystoreService.keystore$, undefined)

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
        assetRD,
        RD.fold(
          () => <></>,
          () => <Spin size="large" />,
          (error) => (
            <ErrorView
              title={intl.formatMessage({ id: 'common.error' })}
              subTitle={error?.message ?? error.toString()}
            />
          ),
          (asset) => (
            <Deposit
              asset={asset}
              shares={poolSharesRD}
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
