import React from 'react'

import MnemonicConfirmScreen from '../../../components/wallet/NewMnemonicConfirm'

export const PhraseView: React.FC = () => {
  return (
    <MnemonicConfirmScreen
      mnemonic={'some test words are here should be at least'}
      onConfirm={(val: unknown) => console.log('Mnemonic confirm value', val)}
    />
  )
}
