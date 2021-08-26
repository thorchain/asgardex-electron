import React, { useCallback, useMemo, useRef } from 'react'

import { SliderSingleProps } from 'antd/lib/slider'
import { TooltipPlacement } from 'antd/lib/tooltip'

import { SliderWrapper, SliderLabel } from './Slider.styles'

type CustomProps = {
  tooltipPlacement?: TooltipPlacement
  withLabel?: boolean
  labelPosition?: 'top' | 'bottom'
  useMiddleLabel?: boolean
  error?: boolean
}

type Props = CustomProps & SliderSingleProps

export const Slider: React.FC<Props> = ({
  tooltipPlacement = 'bottom',
  withLabel = false,
  tipFormatter = (value) => `${value}%`,
  labelPosition,
  tooltipVisible,
  useMiddleLabel,
  error = false,
  ...rest
}): JSX.Element => {
  const ref = useRef()
  const getTooltipPopupContainer = useCallback((container: HTMLElement) => container, [])

  const percentLabels = useMemo(
    () => (
      <SliderLabel>
        <span>0%</span>
        {useMiddleLabel && <span>50%</span>}
        <span>100%</span>
      </SliderLabel>
    ),
    [useMiddleLabel]
  )

  return (
    <>
      {withLabel && labelPosition === 'top' && percentLabels}
      <SliderWrapper
        ref={ref}
        tooltipPlacement={tooltipPlacement}
        getTooltipPopupContainer={tooltipVisible ? getTooltipPopupContainer : undefined}
        tipFormatter={tipFormatter}
        error={error}
        {...rest}
      />
      {withLabel && labelPosition !== 'top' && percentLabels}
    </>
  )
}
