import React from 'react'

import * as Styled from '../../uielements/common/Common.styles'

type Props = {
  className?: string
  children?: React.ReactNode
}

export const WalletTypeLabel: React.FC<Props> = ({ className = '', children }): JSX.Element => (
  <Styled.WalletTypeLabel className={className}>{children}</Styled.WalletTypeLabel>
)
