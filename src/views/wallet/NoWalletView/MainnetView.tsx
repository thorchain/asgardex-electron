import React, { useCallback } from 'react'

import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import Label from '../../../components/uielements/label'
import * as walletRoutes from '../../../routes/wallet'
import * as Styled from './Mainnet.styles'

export const MainnetView = () => {
  const history = useHistory()
  const intl = useIntl()

  const importClick = useCallback(() => {
    history.push(walletRoutes.imports.path())
  }, [history])

  const createClick = useCallback(() => {
    history.push(walletRoutes.create.path())
  }, [history])

  return (
    <Styled.ViewContainer>
      <Styled.ActionContainer>
        <Styled.ActionButton round="true" onClick={importClick}>
          {intl.formatMessage({ id: 'wallet.empty.action.import' })}
        </Styled.ActionButton>
        <Label align="center" color="gray" size="big" textTransform="uppercase">
          {intl.formatMessage({ id: 'wallet.empty.phrase.import' })}
        </Label>
      </Styled.ActionContainer>

      <Styled.ActionContainer>
        <Styled.ActionButton onClick={createClick} typevalue={'outline'} round="true">
          {intl.formatMessage({ id: 'wallet.empty.action.create' })}
        </Styled.ActionButton>
        <Label align="center" color="gray" size="big" textTransform="uppercase">
          {intl.formatMessage({ id: 'wallet.empty.phrase.create' })}
        </Label>
      </Styled.ActionContainer>
    </Styled.ViewContainer>
  )
}
