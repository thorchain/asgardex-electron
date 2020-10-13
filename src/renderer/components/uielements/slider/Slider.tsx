import React, { useCallback, useRef } from 'react'

import { SliderSingleProps } from 'antd/lib/slider'
import { TooltipPlacement } from 'antd/lib/tooltip'

import { SliderWrapper, SliderLabel } from './Slider.style'

type CustomProps = {
  tooltipPlacement?: TooltipPlacement
  withLabel?: boolean
}

type Props = CustomProps & SliderSingleProps

const Slider: React.FC<Props> = ({
  tooltipPlacement = 'bottom',
  withLabel = false,
  tipFormatter = (value) => `${value}%`,
  tooltipVisible,
  ...rest
}): JSX.Element => {
  const ref = useRef()
  const getTooltipPopupContainer = useCallback((container: HTMLElement) => ref.current || container, [ref])

  return (
    <>
      <SliderWrapper
        ref={ref}
        tooltipPlacement={tooltipPlacement}
        getTooltipPopupContainer={tooltipVisible ? getTooltipPopupContainer : undefined}
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
