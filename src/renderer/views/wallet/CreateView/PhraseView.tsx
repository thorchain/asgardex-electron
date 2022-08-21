import React, { useMemo, useState } from 'react'

import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { NewPhraseConfirm, NewPhraseGenerate } from '../../../components/wallet/phrase'
import { PhraseInfo } from '../../../components/wallet/phrase/Phrase.types'
import { useWalletContext } from '../../../contexts/WalletContext'
import { generateKeystoreId } from '../../../services/wallet/util'

export const PhraseView: React.FC = () => {
  const { keystoreService } = useWalletContext()

  const [phraseInfo, setPhraseInfo] = useState<O.Option<PhraseInfo>>(O.none)

  const walletId = useMemo(() => generateKeystoreId(), [])

  return FP.pipe(
    phraseInfo,
    O.fold(
      () => (
        <NewPhraseGenerate
          walletId={walletId}
          onSubmit={(phraseInfo) => {
            setPhraseInfo(O.some(phraseInfo))
          }}
        />
      ),
      ({ phrase, password, name }) => (
        <NewPhraseConfirm
          mnemonic={phrase}
          onConfirm={() => keystoreService.addKeystoreWallet({ phrase, password, id: walletId, name })}
        />
      )
    )
  )
}
