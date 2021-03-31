import React, { useCallback, useRef, useState } from 'react'

import BigNumber from 'bignumber.js'

import { useCbOnResize } from '../../../hooks/useCbOnResize'
import * as Styled from './PoolStatus.style'

type Props = {
  label: string
  displayValue: string
  fullValue?: string
  trend?: BigNumber
  isLoading?: boolean
}

export const PoolStatus: React.FC<Props> = (props): JSX.Element => {
  const { label, displayValue, fullValue, isLoading } = props
  const [showTooltip, setShowTooltip] = useState(false)
  const amountRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const onResizeCb = useCallback(() => {
    if (!amountRef.current) {
      return
    }

    if (amountRef.current.offsetWidth < amountRef.current.scrollWidth) {
      setShowTooltip(true)
    } else {
      setShowTooltip(false)
    }
  }, [amountRef])

  useCbOnResize(onResizeCb)

  const TooltipContainer: React.FC = useCallback(
    (props) => {
      return !isLoading && (showTooltip || fullValue !== displayValue) ? (
        <Styled.Tooltip title={fullValue}>
          <span>{props.children}</span>
        </Styled.Tooltip>
      ) : (
        <>{props.children}</>
      )
    },
    [fullValue, showTooltip, displayValue, isLoading]
  )

  return (
    <Styled.PoolStatusWrapper ref={containerRef} {...props}>
      <TooltipContainer>
        <Styled.Title textTransform="uppercase" color="light">
          {label}
        </Styled.Title>
        <Styled.Value loading={isLoading} ref={amountRef} className="amount">
          {displayValue}
        </Styled.Value>
      </TooltipContainer>
    </Styled.PoolStatusWrapper>
  )
}
