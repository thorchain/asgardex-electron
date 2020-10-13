import React, { useCallback, useRef } from 'react'

import { SliderSingleProps } from 'antd/lib/slider'
import { TooltipPlacement } from 'antd/lib/tooltip'
import { useObservableCallback, useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { SliderWrapper, SliderLabel } from './Slider.style'

type CustomProps = {
  tooltipPlacement?: TooltipPlacement
  withLabel?: boolean
  /**
   * debounce time
   * to trigger `onChange` with any delay (default 100ms)
   * while moving slider very fast
   **/
  debounceTime?: number
}

type Props = CustomProps & SliderSingleProps

const Slider: React.FC<Props> = ({
  tooltipPlacement = 'bottom',
  withLabel = false,
  tipFormatter = (value) => `${value}%`,
  tooltipVisible,
  onChange = (_: number) => {},
  debounceTime = 0,
  ...rest
}): JSX.Element => {
  const ref = useRef()
  const getTooltipPopupContainer = useCallback((container: HTMLElement) => ref.current || container, [ref])

  // For performance reason we can add a (small) delay to trigger `onChange` callback
  const [onChangeValue, value$] = useObservableCallback<number, number>((percent$) =>
    percent$.pipe(
      RxOp.debounceTime(debounceTime),
      RxOp.map((value) => {
        onChange(value)
        return value
      })
    )
  )

  // empty state, just needed to subscribe to value$
  useObservableState(value$, 0)

  return (
    <>
      <SliderWrapper
        ref={ref}
        tooltipPlacement={tooltipPlacement}
        getTooltipPopupContainer={tooltipVisible ? getTooltipPopupContainer : undefined}
        tipFormatter={tipFormatter}
        onChange={onChangeValue}
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
