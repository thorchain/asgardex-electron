import React from 'react'

import { Route, Routes } from 'react-router-dom'

import * as poolsRoutes from '../../routes/pools'
import { DepositView } from '../deposit/DepositView'
import { PoolDetailsView } from '../pool/PoolDetailsView'
import { SwapView } from '../swap/SwapView'
import { PoolsOverview } from './PoolsOverview'

export const PoolsView = (): JSX.Element => (
  <Routes>
    <Route path={poolsRoutes.base.template} element={<PoolsOverview />} />
    <Route path={poolsRoutes.detail.template} element={<PoolDetailsView />} />
    <Route path={poolsRoutes.swap.template} element={<SwapView />} />
    <Route path={poolsRoutes.deposit.template} element={<DepositView />} />
  </Routes>
)
