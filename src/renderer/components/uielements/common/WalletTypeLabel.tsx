import React from 'react'

import * as Styled from './Common.styles'

type Props = {
  className?: string
}

export const WalletTypeLabel: React.FC<Props> = ({ className = '', children }): JSX.Element => (
  <Styled.WalletTypeLabel className={className}>{children}</Styled.WalletTypeLabel>
)
