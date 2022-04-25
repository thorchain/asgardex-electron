import React from 'react'

import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router'

import { NewPhraseConfirm, NewPhraseGenerate } from '../../../components/wallet/phrase'
import { PhraseInfo } from '../../../components/wallet/phrase/Phrase.types'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'

export const PhraseView: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { keystoreService } = useWalletContext()

  return (
    <Routes>
      <Route path={walletRoutes.create.phrase.template}>
        <NewPhraseGenerate
          onSubmit={({ phrase, password }) => {
            navigate(walletRoutes.create.phraseConfirm.path(), { state: { phrase, password } })
          }}
        />
      </Route>
      <Route
        path={walletRoutes.create.phraseConfirm.template}
        element={() => {
          const phrase = (location.state as PhraseInfo)?.phrase ?? ''
          const password = (location.state as PhraseInfo)?.password ?? ''

          if (!phrase || !password) {
            return <Navigate to={walletRoutes.create.phrase.template} replace />
          }

          return <NewPhraseConfirm mnemonic={phrase} onConfirm={() => keystoreService.addKeystore(phrase, password)} />
        }}
      />
    </Routes>
  )
}
