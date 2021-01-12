import React from 'react'

import * as Styled from './StepBar.style'

export type Props = {
  size?: number
  className?: string
}

export const StepBar: React.FC<Props> = ({ size = 150, className }): JSX.Element => {
  return (
    <Styled.Container className={className}>
      <Styled.Dot />
      <Styled.Line size={size} />
      <Styled.Dot />
    </Styled.Container>
  )
}
