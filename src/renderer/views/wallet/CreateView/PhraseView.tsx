import React from 'react'

import { Redirect, Route, RouteComponentProps, Switch, useHistory } from 'react-router'

import MnemonicConfirmScreen from '../../../components/wallet/NewMnemonicConfirm'
import MnemonicGenerate, { MnemonicInfo } from '../../../components/wallet/NewMnemonicGenerate'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'

export const PhraseView: React.FC = () => {
  const history = useHistory()
  const { keystoreService } = useWalletContext()

  return (
    <Switch>
      <Route path={walletRoutes.create.phrase.template} exact>
        <MnemonicGenerate
          onSubmit={({ phrase, password }) => {
            history.push(walletRoutes.create.phraseConfirm.path(), { phrase, password })
          }}
        />
      </Route>
      <Route
        path={walletRoutes.create.phraseConfirm.template}
        exact
        component={(props: RouteComponentProps<{}, {}, MnemonicInfo>) => {
          const phrase = props.history.location.state?.phrase
          const password = props.history.location.state?.password

          if (!phrase || !password) {
            return <Redirect to={walletRoutes.create.phrase.template} />
          }

          return (
            <MnemonicConfirmScreen mnemonic={phrase} onConfirm={() => keystoreService.addKeystore(phrase, password)} />
          )
        }}
      />
    </Switch>
  )
}
