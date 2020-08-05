import React, { useCallback, useRef } from 'react'

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
  tipFormatter = (value) => `${value}%`,
  ...rest
}): JSX.Element => {
  const ref = useRef()
  const getTooltipPopupContainer = useCallback((container: HTMLElement) => ref.current || container, [ref])
  return (
    <>
      <SliderWrapper
        ref={ref}
        className={`slider-wrapper ${className}`}
        tooltipPlacement={tooltipPlacement}
        getTooltipPopupContainer={getTooltipPopupContainer}
        tipFormatter={tipFormatter}
        {...rest}
      />
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
