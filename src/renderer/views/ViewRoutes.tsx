import React from 'react'

import { Route, Routes } from 'react-router-dom'

import * as appRoutes from '../routes/app'
import * as playgroundRoutes from '../routes/playground'
import * as poolsRoutes from '../routes/pools'
import * as walletRoutes from '../routes/wallet'
import { AppSettingsView } from './app/AppSettingsView'
import { NoContentView } from './NoContentView'
import { PlaygroundView } from './playground/PlaygroundView'
import { PoolsOverview } from './pools/PoolsOverview'
import { PoolsView } from './pools/PoolsView'
import { WalletView } from './wallet/WalletView'

export const ViewRoutes: React.FC<{}> = (): JSX.Element => {
  return (
    <Routes>
      <Route path={appRoutes.base.template} element={<PoolsOverview />} />
      <Route path={poolsRoutes.base.template} element={<PoolsView />} />
      <Route path={walletRoutes.base.template} element={<WalletView />} />
      <Route path={appRoutes.settings.template} element={<AppSettingsView />} />
      <Route path={playgroundRoutes.base.template} element={<PlaygroundView />} />
      <Route path="*" element={<NoContentView />} />
    </Routes>
  )
}
