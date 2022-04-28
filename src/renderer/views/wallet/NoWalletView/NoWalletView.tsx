import React, { useCallback } from 'react'

import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Label } from '../../../components/uielements/label'
import * as walletRoutes from '../../../routes/wallet'
import * as Styled from './NoWalletView.styles'

export const NoWalletView = () => {
  const navigate = useNavigate()
  const intl = useIntl()

  const importClick = useCallback(() => {
    navigate(walletRoutes.imports.base.path())
  }, [navigate])

  const createClick = useCallback(() => {
    navigate(walletRoutes.create.phrase.path())
  }, [navigate])

  return (
    <Styled.ViewContainer>
      <Styled.ActionContainer>
        <Styled.ActionButton round="true" onClick={importClick}>
          {intl.formatMessage({ id: 'wallet.action.import' })}
        </Styled.ActionButton>
        <Label align="center" color="gray" size="big" textTransform="uppercase">
          {intl.formatMessage({ id: 'wallet.empty.phrase.import' })}
        </Label>
      </Styled.ActionContainer>

      <Styled.ActionContainer>
        <Styled.ActionButton onClick={createClick} typevalue={'outline'} round="true">
          {intl.formatMessage({ id: 'wallet.action.create' })}
        </Styled.ActionButton>
        <Label align="center" color="gray" size="big" textTransform="uppercase">
          {intl.formatMessage({ id: 'wallet.empty.phrase.create' })}
        </Label>
      </Styled.ActionContainer>
    </Styled.ViewContainer>
  )
}
