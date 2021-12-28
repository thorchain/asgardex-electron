import React, { useCallback } from 'react'

import { FolderAddOutlined, FolderOpenOutlined } from '@ant-design/icons/lib'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'
import { Button } from '../../uielements/button'
import * as Styled from './AddWallet.styles'

type Props = { isLocked?: boolean }

export const AddWallet: React.FC<Props> = ({ isLocked = false }) => {
  const intl = useIntl()
  const history = useHistory()
  const onButtonClick = useCallback(() => {
    history.push(walletRoutes.base.path(history.location.pathname))
  }, [history])

  const intlLabelId = isLocked ? 'wallet.unlock.instruction' : 'wallet.connect.instruction'
  const intlButtonId = isLocked ? 'wallet.action.unlock' : 'wallet.action.connect'

  return (
    <Styled.Container>
      {isLocked ? <Styled.UnlockIcon /> : <Styled.ConnectIcon />}
      <Styled.Label>{intl.formatMessage({ id: intlLabelId })}</Styled.Label>
      <Button onClick={onButtonClick} round="true">
        {isLocked ? <FolderOpenOutlined /> : <FolderAddOutlined />}
        {intl.formatMessage({ id: intlButtonId })}
      </Button>
    </Styled.Container>
  )
}
