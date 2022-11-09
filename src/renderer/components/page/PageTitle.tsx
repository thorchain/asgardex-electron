import React from 'react'

import { BackLinkButton } from '../uielements/button'
import * as Styled from './PageTitle.styles'

export const PageTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Styled.Container>
      <Styled.Title>
        <Styled.BackLinkContainer>
          <BackLinkButton />
        </Styled.BackLinkContainer>
        {children}
      </Styled.Title>
    </Styled.Container>
  )
}
