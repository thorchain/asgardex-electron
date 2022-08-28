import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Row } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { RefreshButton } from '../../components/uielements/button'
import { AssetsNav } from '../../components/wallet/assets'
import { AssetsTableCollapsable } from '../../components/wallet/assets/AssetsTableCollapsable'
import { TotalValue } from '../../components/wallet/assets/TotalValue'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { useTotalWalletBalance } from '../../hooks/useWalletBalance'
import * as walletRoutes from '../../routes/wallet'
import { INITIAL_BALANCES_STATE, DEFAULT_BALANCES_FILTER } from '../../services/wallet/const'
import { ChainBalances, SelectedWalletAsset } from '../../services/wallet/types'

export const AssetsView: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  const intl = useIntl()

  const { chainBalances$, balancesState$, setSelectedAsset, reloadBalances } = useWalletContext()

  const { network } = useNetwork()

  const [chainBalances] = useObservableState(
    () =>
      FP.pipe(
        chainBalances$,
        RxOp.map<ChainBalances, ChainBalances>((chainBalances) =>
          FP.pipe(
            chainBalances,
            // we show all balances
            A.filter(({ balancesType }) => balancesType === 'all'),
            // accept balances > 0 only
            A.map((chainBalance) => ({
              ...chainBalance,
              balances: FP.pipe(
                chainBalance.balances,
                RD.map((balances) => balances.filter((balance) => balance.amount.gt(0)))
              )
            }))
          )
        )
      ),
    []
  )

  const [{ loading: loadingBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )
  const {
    service: {
      pools: { poolsState$, selectedPricePool$, reloadAllPools }
    }
  } = useMidgardContext()

  const { total: totalWalletBalances } = useTotalWalletBalance()

  const poolsRD = useObservableState(poolsState$, RD.pending)

  const selectedPricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const selectAssetHandler = useCallback(
    (selectedAsset: SelectedWalletAsset) => {
      setSelectedAsset(O.some(selectedAsset))
      navigate(walletRoutes.assetDetail.path())
    },
    [navigate, setSelectedAsset]
  )

  const upgradeAssetHandler = useCallback(
    (selectedAsset: SelectedWalletAsset) => {
      setSelectedAsset(O.some(selectedAsset))
      navigate(walletRoutes.upgradeRune.path())
    },
    [navigate, setSelectedAsset]
  )

  const poolDetails = RD.toNullable(poolsRD)?.poolDetails ?? []

  const { mimirHaltRD } = useMimirHalt()

  const disableRefresh = useMemo(() => RD.isPending(poolsRD) || loadingBalances, [loadingBalances, poolsRD])

  const refreshHandler = useCallback(() => {
    reloadAllPools()
    reloadBalances()
  }, [reloadAllPools, reloadBalances])

  return (
    <>
      <Row justify="end" style={{ marginBottom: '20px' }}>
        <RefreshButton clickHandler={refreshHandler} disabled={disableRefresh} />
      </Row>
      <AssetsNav />
      <TotalValue
        total={totalWalletBalances}
        pricePool={selectedPricePool}
        title={intl.formatMessage({ id: 'wallet.balance.total.poolAssets' })}
        info={intl.formatMessage({ id: 'wallet.balance.total.poolAssets.info' })}
      />
      <AssetsTableCollapsable
        chainBalances={chainBalances}
        pricePool={selectedPricePool}
        poolDetails={poolDetails}
        selectAssetHandler={selectAssetHandler}
        upgradeAssetHandler={upgradeAssetHandler}
        mimirHalt={mimirHaltRD}
        network={network}
      />
    </>
  )
}
