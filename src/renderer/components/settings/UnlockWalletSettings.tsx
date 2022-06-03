import React, { useCallback } from 'react'

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
}

export const UnlockWalletSettings: React.FC<Props> = (props): JSX.Element => {
  const { unlockHandler, keystore } = props
  const intl = useIntl()

  const onChangeCollapseHandler = useCallback((key: string | string[]) => {
    console.log('key:', key)
  }, [])

  return (
    <Styled.Container>
      <CStyled.Collapse
        expandIcon={({ isActive }) => <CStyled.ExpandIcon rotate={isActive ? 90 : 0} />}
        defaultActiveKey={['1']}
        // activeKey={'1'}
        expandIconPosition="right"
        onChange={onChangeCollapseHandler}
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
