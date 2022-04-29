import React, { useCallback } from 'react'

import { FolderAddOutlined, FolderOpenOutlined } from '@ant-design/icons/lib'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'
import { Button } from '../../uielements/button'
import * as Styled from './AddWallet.styles'

type Props = { isLocked?: boolean }

export const AddWallet: React.FC<Props> = ({ isLocked = false }) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const onButtonClick = useCallback(() => {
    navigate(walletRoutes.base.path(location.pathname))
  }, [location.pathname, navigate])

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
