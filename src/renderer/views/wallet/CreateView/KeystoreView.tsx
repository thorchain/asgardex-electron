import React from 'react'

import { Route, Switch } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'

export const KeystoreView: React.FC = () => {
  return (
    <Switch>
      <Route path={walletRoutes.create.keystore.template} exact>
        <span>keystore</span>
      </Route>
    </Switch>
  )
}
