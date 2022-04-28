import React from 'react'

import { Route, useNavigate, Navigate, useLocation, Routes } from 'react-router-dom'

import { NewPhraseConfirm, NewPhraseGenerate } from '../../../components/wallet/phrase'
import { PhraseInfo } from '../../../components/wallet/phrase/Phrase.types'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'

const NewPhraseConfirmView: React.FC = (): JSX.Element => {
  const location = useLocation()
  const { keystoreService } = useWalletContext()
  const phrase = (location.state as PhraseInfo)?.phrase ?? ''
  const password = (location.state as PhraseInfo)?.password ?? ''

  if (!phrase || !password) {
    return <Navigate to={walletRoutes.create.phrase.path()} replace />
  }

  return <NewPhraseConfirm mnemonic={phrase} onConfirm={() => keystoreService.addKeystore(phrase, password)} />
}

export default NewPhraseConfirmView

export const PhraseView: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route
        // Nested route - last part of `walletRoutes.create.phraseConfirm.template` needed only
        path="phrase-confirm"
        element={<NewPhraseConfirmView />}
      />
      <Route
        // Nested route - last part of `walletRoutes.create.phrase.template` needed only
        path="phrase"
        element={
          <NewPhraseGenerate
            onSubmit={({ phrase, password }) => {
              navigate(walletRoutes.create.phraseConfirm.path(), { state: { phrase, password } })
            }}
          />
        }
      />
    </Routes>
  )
}
