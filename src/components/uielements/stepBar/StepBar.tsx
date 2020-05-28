import React from 'react'

import { StepBarWrapper } from './StepBar.style'

type Props = {
  size?: number
}

const StepBar: React.FC<Props> = ({ size = 150, ...rest }): JSX.Element => {
  return (
    <StepBarWrapper size={size} {...rest}>
      <div className="step-start-dot" />
      <div className="step-bar-line" />
      <div className="step-end-dot" />
    </StepBarWrapper>
  )
}

export default StepBar
