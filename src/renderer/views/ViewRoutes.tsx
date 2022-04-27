import React, { useCallback } from 'react'

import { Row } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'

import { RefreshButton } from '../components/uielements/button'
import { AssetsNav } from '../components/wallet/assets'
import { useMidgardContext } from '../contexts/MidgardContext'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { useWalletContext } from '../contexts/WalletContext'
import { triggerStream } from '../helpers/stateHelper'
import * as appRoutes from '../routes/app'
import * as playgroundRoutes from '../routes/playground'
import * as poolsRoutes from '../routes/pools'
import * as walletRoutes from '../routes/wallet'
import { AppSettingsView } from './app/AppSettingsView'
import { DepositView } from './deposit/DepositView'
import { NoContentView } from './NoContentView'
import { PlaygroundView } from './playground/PlaygroundView'
import { PoolDetailsView } from './pool/PoolDetailsView'
import { PoolsOverview } from './pools/PoolsOverview'
import { SwapView } from './swap/SwapView'
import { AssetDetailsView } from './wallet/AssetDetailsView'
import { AssetsView } from './wallet/AssetsView'
import { BondsView } from './wallet/BondsView'
import { CreateView } from './wallet/CreateView'
import { ImportsView } from './wallet/importsView'
import { InteractView } from './wallet/Interact'
import { NoWalletView } from './wallet/NoWalletView'
import { PoolShareView } from './wallet/PoolShareView'
import { SendView } from './wallet/send'
import { UnlockView } from './wallet/UnlockView'
import { UpgradeView } from './wallet/upgrade'
import { WalletAuth } from './wallet/WalletAuth'
import { WalletSettingsView } from './wallet/WalletSettingsView'
import * as WStyled from './wallet/WalletView.styles'

export const ViewRoutes: React.FC<{}> = (): JSX.Element => {
  const { reloadBalances } = useWalletContext()

  const {
    service: {
      shares: { reloadAllSharesByAddresses },
      pools: { reloadAllPools }
    }
  } = useMidgardContext()

  const { reloadNodesInfo } = useThorchainContext()

  const reloadHistory = triggerStream()

  const renderReloadButton = useCallback(
    (onClickHandler, disabled = false) => (
      <Row justify="end" style={{ marginBottom: '20px' }}>
        <RefreshButton clickHandler={onClickHandler} disabled={disabled} />
      </Row>
    ),
    []
  )

  return (
    <Routes>
      {/* pool routes */}
      <Route path={appRoutes.base.template} element={<PoolsOverview />} />
      <Route path={poolsRoutes.base.template} element={<PoolsOverview />} />
      <Route path={poolsRoutes.detail.template} element={<PoolDetailsView />} />
      <Route path={poolsRoutes.swap.template} element={<SwapView />} />
      <Route path={poolsRoutes.deposit.template} element={<DepositView />} />
      {/* wallet routes */}
      <Route path={walletRoutes.noWallet.template} element={<NoWalletView />} />
      <Route path={walletRoutes.create.base.template} element={<CreateView />} />
      <Route path={walletRoutes.locked.template} element={<UnlockView />} />
      <Route path={walletRoutes.imports.base.template} element={<ImportsView />} />
      <Route path={walletRoutes.base.template} element={<Navigate to={walletRoutes.assets.path()} replace />} />
      <Route
        path={walletRoutes.assets.template}
        element={
          <WalletAuth>
            <>
              {renderReloadButton(() => {
                reloadAllPools()
                reloadBalances()
              })}
              <AssetsNav />
              <AssetsView />
            </>
          </WalletAuth>
        }
      />
      <Route
        path={walletRoutes.poolShares.template}
        element={
          <WalletAuth>
            <>
              {renderReloadButton(() => {
                reloadAllSharesByAddresses()
                reloadAllPools()
              })}
              <AssetsNav />
              <PoolShareView />
            </>
          </WalletAuth>
        }
      />
      <Route path={walletRoutes.interact.template} element={<InteractView />} />

      <Route
        path={walletRoutes.bonds.template}
        element={
          <WalletAuth>
            <>
              {renderReloadButton(reloadNodesInfo)}
              <AssetsNav />
              <BondsView />
            </>
          </WalletAuth>
        }
      />
      <Route
        path={walletRoutes.send.template}
        element={
          <WalletAuth>
            <SendView />
          </WalletAuth>
        }
      />

      <Route
        path={walletRoutes.upgradeRune.template}
        element={
          <WalletAuth>
            <UpgradeView />
          </WalletAuth>
        }
      />
      <Route
        path={walletRoutes.assetDetail.template}
        element={
          <WalletAuth>
            <AssetDetailsView />
          </WalletAuth>
        }
      />
      <Route
        path={walletRoutes.walletSettings.template}
        element={
          <WalletAuth>
            <WStyled.WalletSettingsWrapper>
              <AssetsNav />
              <WalletSettingsView />
            </WStyled.WalletSettingsWrapper>
          </WalletAuth>
        }
      />
      <Route
        path={walletRoutes.history.template}
        element={
          <WalletAuth>
            <>
              {renderReloadButton(reloadHistory.trigger)}
              <AssetsNav />
              <WStyled.WalletHistoryView reloadHistory={reloadHistory} />
            </>
          </WalletAuth>
        }
      />

      {/* <Route path={walletRoutes.base.template} element={<WalletView />} /> */}
      <Route path={appRoutes.settings.template} element={<AppSettingsView />} />
      {/* playground */}
      <Route path={playgroundRoutes.base.template} element={<PlaygroundView />} />
      {/* 404 */}
      <Route path="*" element={<NoContentView />} />
    </Routes>
  )
}
