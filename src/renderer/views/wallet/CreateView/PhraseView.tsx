import React from 'react'

import { Redirect, Route, RouteComponentProps, Switch, useHistory } from 'react-router-dom'

import { NewPhraseConfirm, NewPhraseGenerate } from '../../../components/wallet/phrase'
import { PhraseInfo } from '../../../components/wallet/phrase/Phrase.types'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'

export const PhraseView: React.FC = () => {
  const history = useHistory()
  const { keystoreService } = useWalletContext()

  return (
    <Switch>
      <Route path={walletRoutes.create.phrase.template} exact>
        <NewPhraseGenerate
          onSubmit={({ phrase, password }) => {
            history.push({
              pathname: walletRoutes.create.phraseConfirm.path(),
              state: { phrase, password }
            })
          }}
        />
      </Route>
      <Route
        path={walletRoutes.create.phraseConfirm.template}
        exact
        component={(props: RouteComponentProps<{}, {}, PhraseInfo>) => {
          const phrase = props.history.location.state?.phrase
          const password = props.history.location.state?.password

          if (!phrase || !password) {
            return <Redirect to={walletRoutes.create.phrase.template} />
          }

          return <NewPhraseConfirm mnemonic={phrase} onConfirm={() => keystoreService.addKeystore(phrase, password)} />
        }}
      />
    </Switch>
  )
}
