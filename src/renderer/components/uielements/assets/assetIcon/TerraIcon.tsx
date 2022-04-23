import React from 'react'

import { terraIcon } from '../../../icons'
import * as Styled from './AssetIcon.styles'
import { Size } from './AssetIcon.types'

type ComponentProps = {
  size?: Size
}

type Props = ComponentProps & React.HTMLAttributes<HTMLDivElement>

export const TerraIcon: React.FC<Props> = ({ size = 'normal', className = '' }): JSX.Element => {
  return (
    <Styled.IconWrapper size={size} isSynth={false} className={className}>
      <Styled.Icon src={terraIcon} isSynth={false} size={size} />{' '}
    </Styled.IconWrapper>
  )
}
