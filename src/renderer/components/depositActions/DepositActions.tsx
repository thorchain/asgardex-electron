import React from 'react'

import { useIntl } from 'react-intl'

import * as Styled from './DepositActions.styles'

type Props = {}

export const DepositActions: React.FC<Props> = () => {
  const intl = useIntl()
  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.HeaderContent>
          <Styled.AssetIcon />
          <div>
            <Styled.HeaderTitle>{intl.formatMessage({ id: 'deposit.interact.title' })}</Styled.HeaderTitle>
            <Styled.HeaderSubtitle>{intl.formatMessage({ id: 'deposit.interact.subtitle' })}</Styled.HeaderSubtitle>
          </div>
        </Styled.HeaderContent>
      </Styled.Header>
    </Styled.Container>
  )
}
