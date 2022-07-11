import React from 'react'

import { BackLink } from '../uielements/backLink'
import * as Styled from './PageTitle.styles'

export const PageTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Styled.Container>
      <Styled.Title>
        <Styled.BackLinkContainer>
          <BackLink />
        </Styled.BackLinkContainer>
        {children}
      </Styled.Title>
    </Styled.Container>
  )
}
