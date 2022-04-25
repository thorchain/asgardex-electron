import React from 'react'

import { Route, Routes } from 'react-router-dom'

import * as poolsRoutes from '../../routes/pools'
import { DepositView } from '../deposit/DepositView'
import { PoolDetailsView } from '../pool/PoolDetailsView'
import { SwapView } from '../swap/SwapView'
import { PoolsOverview } from './PoolsOverview'

export const PoolsView: React.FC = (): JSX.Element => {
  return (
    <Routes>
      <Route path={poolsRoutes.base.template}>
        <PoolsOverview />
      </Route>
      <Route path={poolsRoutes.swap.template}>
        <SwapView />
      </Route>
      <Route path={poolsRoutes.deposit.template}>
        <DepositView />
      </Route>
      <Route path={poolsRoutes.detail.template}>
        <PoolDetailsView />
      </Route>
    </Routes>
  )
}
