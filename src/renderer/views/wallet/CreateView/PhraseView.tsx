import React, { useState } from 'react'

import { useHistory } from 'react-router'

import MnemonicConfirmScreen from '../../../components/wallet/NewMnemonicConfirm'
import MnemonicGenerate from '../../../components/wallet/NewMnemonicGenerate'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'

export const PhraseView: React.FC = () => {
  const [mnemonicInfo, setMnemonicInfo] = useState<{ phrase: string; password: string } | undefined>()
  const history = useHistory()
  const { keystoreService } = useWalletContext()

  if (!mnemonicInfo) {
    return <MnemonicGenerate onSubmit={setMnemonicInfo} />
  }

  return (
    <MnemonicConfirmScreen
      mnemonic={mnemonicInfo.phrase}
      onConfirm={() => {
        keystoreService.addKeystore(mnemonicInfo.phrase, mnemonicInfo.password).then(() => {
          history.push(walletRoutes.assets.path())
        })
      }}
    />
  )
}
