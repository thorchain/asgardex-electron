import React from 'react'

import { SliderSingleProps } from 'antd/lib/slider'
import { TooltipPlacement } from 'antd/lib/tooltip'

import { SliderWrapper, SliderLabel } from './Slider.style'

interface Props extends SliderSingleProps {
  className?: string
  tooltipPlacement?: TooltipPlacement
  withLabel?: boolean
}

const Slider: React.FC<Props> = ({
  className = '',
  tooltipPlacement = 'bottom',
  withLabel = false,
  ...rest
}): JSX.Element => {
  return (
    <>
      <SliderWrapper className={`slider-wrapper ${className}`} tooltipPlacement={tooltipPlacement} {...rest} />
      {withLabel && (
        <SliderLabel>
          <span>0%</span>
          <span>100%</span>
        </SliderLabel>
      )}
    </>
  )
}

export default Slider
