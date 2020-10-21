import React, { useCallback, useMemo, useRef } from 'react'

import { SliderSingleProps } from 'antd/lib/slider'
import { TooltipPlacement } from 'antd/lib/tooltip'

import { SliderWrapper, SliderLabel } from './Slider.style'

type CustomProps = {
  tooltipPlacement?: TooltipPlacement
  withLabel?: boolean
  labelPosition?: 'top' | 'bottom'
  useMiddleLabel?: boolean
}

type Props = CustomProps & SliderSingleProps

export const Slider: React.FC<Props> = ({
  tooltipPlacement = 'bottom',
  withLabel = false,
  tipFormatter = (value) => `${value}%`,
  labelPosition,
  tooltipVisible,
  useMiddleLabel,
  ...rest
}): JSX.Element => {
  const ref = useRef()
  const getTooltipPopupContainer = useCallback((container: HTMLElement) => ref.current || container, [ref])

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
        {...rest}
      />
      {withLabel && labelPosition !== 'top' && percentLabels}
    </>
  )
}
