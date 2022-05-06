import React from 'react'

import { ViewWrapper } from './View.styles'

export const View: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => (
  <ViewWrapper>{children}</ViewWrapper>
)
