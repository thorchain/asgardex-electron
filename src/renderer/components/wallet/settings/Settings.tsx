import React from 'react'

import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import * as Styled from './Settings.style'

type Props = {
  selectedNetwork: Network
  ClientSettingsView: React.ComponentType<{}>
}

export const Settings: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const { ClientSettingsView } = props

  return (
    <Styled.Container>
      <Styled.Title>{intl.formatMessage({ id: 'setting.title' })}</Styled.Title>
      <Styled.CardContainer>
        <Styled.Card>
          <ClientSettingsView />
        </Styled.Card>
      </Styled.CardContainer>
    </Styled.Container>
  )
}
