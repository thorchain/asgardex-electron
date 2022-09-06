import React, { useMemo, useState } from 'react'

import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { NewPhraseConfirm, NewPhraseGenerate } from '../../../components/wallet/phrase'
import { PhraseInfo } from '../../../components/wallet/phrase/Phrase.types'
import { useWalletContext } from '../../../contexts/WalletContext'
import { useKeystoreWallets } from '../../../hooks/useKeystoreWallets'
import { generateKeystoreId } from '../../../services/wallet/util'

export const PhraseView: React.FC = () => {
  const { keystoreService } = useWalletContext()

  const [phraseInfo, setPhraseInfo] = useState<O.Option<PhraseInfo>>(O.none)

  const walletId = useMemo(() => generateKeystoreId(), [])

  const { walletsUI } = useKeystoreWallets()

  const walletNames = useMemo(
    () =>
      FP.pipe(
        walletsUI,
        A.map(({ name }) => name)
      ),
    [walletsUI]
  )

  return FP.pipe(
    phraseInfo,
    O.fold(
      () => (
        <NewPhraseGenerate
          walletId={walletId}
          walletNames={walletNames}
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
