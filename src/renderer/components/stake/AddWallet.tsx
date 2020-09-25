import React, { useCallback } from 'react'

import { FolderAddOutlined } from '@ant-design/icons/lib'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import * as walletRoutes from '../../routes/wallet'
import Button from '../uielements/button'
import * as Styled from './AddWallet.styles'

export const AddWallet: React.FC = () => {
  const intl = useIntl()
  const history = useHistory()
  const onButtonClick = useCallback(() => {
    history.push(walletRoutes.base.path())
  }, [history])
  return (
    <Styled.Container>
      <Styled.Icon />
      <Styled.Label>{intl.formatMessage({ id: 'stake.wallet.connect' })}</Styled.Label>
      <Button onClick={onButtonClick} round="true">
        <FolderAddOutlined />
        {intl.formatMessage({ id: 'stake.wallet.add' })}
      </Button>
    </Styled.Container>
  )
}
