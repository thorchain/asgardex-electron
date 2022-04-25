import React from 'react'

import { Route, Routes } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'

export const KeystoreView: React.FC = () => {
  return (
    <Routes>
      <Route path={walletRoutes.create.keystore.template}>
        <span>keystore</span>
      </Route>
    </Routes>
  )
}
