import React from 'react'

import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import * as appRoutes from '../routes/app'
import * as playgroundRoutes from '../routes/playground'
import * as poolsRoutes from '../routes/pools'
import * as saversRoutes from '../routes/pools/savers'
import * as walletRoutes from '../routes/wallet'
import { AppSettingsView } from './app/AppSettingsView'
import { DepositView } from './deposit/DepositView'
import { NoContentView } from './NoContentView'
import { PlaygroundView } from './playground/PlaygroundView'
import { PoolDetailsView } from './pool/PoolDetailsView'
import { PoolsOverview } from './pools/PoolsOverview'
import { SaversView } from './savers/SaversView'
import { SwapView } from './swap/SwapView'
import { AssetDetailsView } from './wallet/AssetDetailsView'
import { AssetsView } from './wallet/AssetsView'
import { BondsView } from './wallet/BondsView'
import { CreateView } from './wallet/CreateView'
import { WalletHistoryView } from './wallet/history'
import { ImportsView } from './wallet/importsView'
import { InteractView } from './wallet/Interact'
import { NoWalletView } from './wallet/NoWalletView'
import { PoolShareView } from './wallet/PoolShareView'
import { SendView } from './wallet/send'
import { UnlockView } from './wallet/UnlockView'
import { UpgradeView } from './wallet/upgrade'
import { WalletAuth } from './wallet/WalletAuth'
import { WalletSettingsAuth } from './wallet/WalletSettingsAuth'

export const ViewRoutes: React.FC<{}> = (): JSX.Element => {
  const location = useLocation()
  return (
    <Routes>
      {/* home */}
      <Route path={appRoutes.base.template} element={<Navigate to={poolsRoutes.base.path()} />} />
      {/* pool routes */}
      <Route path={poolsRoutes.base.template} element={<PoolsOverview />} />
      <Route path={poolsRoutes.active.template} element={<PoolsOverview />} />
      <Route path={poolsRoutes.pending.template} element={<PoolsOverview />} />
      <Route path={poolsRoutes.savers.template} element={<PoolsOverview />} />

      <Route path={poolsRoutes.detail.template} element={<PoolDetailsView />} />
      <Route path={poolsRoutes.swap.template} element={<SwapView />} />
      <Route path={poolsRoutes.swapToCustom.template} element={<SwapView />} />
      <Route path={saversRoutes.earn.template} element={<SaversView />} />
      <Route path={saversRoutes.withdraw.template} element={<SaversView />} />
      <Route
        path={poolsRoutes.deposit.template}
        element={
          <WalletAuth>
            <DepositView />
          </WalletAuth>
        }
      />
      {/* wallet routes */}
      <Route path={walletRoutes.noWallet.template} element={<NoWalletView />} />
      <Route path={`${walletRoutes.create.base.template}/*`} element={<CreateView />} />
      <Route path={walletRoutes.locked.template} element={<UnlockView />} />
      <Route path={`${walletRoutes.imports.base.template}/*`} element={<ImportsView />} />
      <Route
        path={walletRoutes.base.template}
        element={<Navigate to={{ pathname: walletRoutes.assets.path(), search: location.search }} />}
      />
      <Route
        path={walletRoutes.assets.template}
        element={
          <WalletAuth>
            <AssetsView />
          </WalletAuth>
        }
      />
      <Route
        path={walletRoutes.poolShares.template}
        element={
          <WalletAuth>
            <PoolShareView />
          </WalletAuth>
        }
      />
      <Route
        path={walletRoutes.interact.template}
        element={
          <WalletAuth>
            <InteractView />
          </WalletAuth>
        }
      />

      <Route
        path={walletRoutes.bonds.template}
        element={
          <WalletAuth>
            <BondsView />
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
        path={walletRoutes.history.template}
        element={
          <WalletAuth>
            <WalletHistoryView />
          </WalletAuth>
        }
      />

      <Route
        path={appRoutes.settings.template}
        element={
          <>
            <AppSettingsView />
            <WalletSettingsAuth />
          </>
        }
      />
      {/* playground - DEV only */}
      <Route path={playgroundRoutes.base.template} element={<PlaygroundView />} />
      {/* 404 */}
      <Route path="*" element={<NoContentView />} />
    </Routes>
  )
}
