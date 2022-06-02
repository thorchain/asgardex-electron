import React from 'react'

import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { KeystoreState } from '../../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../../services/wallet/util'
import * as Styled from './WalletSettings.styles'

type Props = {
  keystore: KeystoreState
  unlockHandler: FP.Lazy<void>
}

export const UnlockWalletSettings: React.FC<Props> = (props): JSX.Element => {
  const { unlockHandler, keystore } = props
  const intl = useIntl()

  return (
    <Styled.Container>
      <Styled.TitleWrapper>
        <Styled.Title>{intl.formatMessage({ id: 'setting.wallet.title' })}</Styled.Title>
      </Styled.TitleWrapper>
      <Styled.UnlockWalletButtonContainer>
        <Styled.UnlockWalletButton onClick={unlockHandler}>
          {!hasImportedKeystore(keystore)
            ? intl.formatMessage({ id: 'wallet.imports.label' })
            : isLocked(keystore) && intl.formatMessage({ id: 'wallet.unlock.label' })}
        </Styled.UnlockWalletButton>
      </Styled.UnlockWalletButtonContainer>
    </Styled.Container>
  )
}
