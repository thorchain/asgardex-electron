import React from 'react'

import { Collapse } from 'antd'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { KeystoreState } from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import * as CStyled from './Common.styles'
import * as Styled from './WalletSettings.styles'

type Props = {
  keystore: KeystoreState
  unlockHandler: FP.Lazy<void>
  collapsed: boolean
  toggleCollapse: FP.Lazy<void>
}

export const UnlockWalletSettings: React.FC<Props> = (props): JSX.Element => {
  const { unlockHandler, keystore, collapsed, toggleCollapse } = props
  const intl = useIntl()

  return (
    <Styled.Container>
      <CStyled.Collapse
        expandIcon={({ isActive }) => <CStyled.ExpandIcon rotate={isActive ? 90 : 0} />}
        activeKey={collapsed ? '0' : '1'}
        expandIconPosition="right"
        onChange={toggleCollapse}
        ghost>
        <Collapse.Panel
          header={<CStyled.Title>{intl.formatMessage({ id: 'setting.wallet.title' })}</CStyled.Title>}
          key={'1'}>
          <Styled.UnlockWalletButtonContainer>
            <Styled.UnlockWalletButton onClick={unlockHandler}>
              {!hasImportedKeystore(keystore)
                ? intl.formatMessage({ id: 'wallet.imports.label' })
                : isLocked(keystore) && intl.formatMessage({ id: 'wallet.unlock.label' })}
            </Styled.UnlockWalletButton>
          </Styled.UnlockWalletButtonContainer>
        </Collapse.Panel>
      </CStyled.Collapse>
    </Styled.Container>
  )
}
