import React, { useCallback, useRef, useState } from 'react'

import { useCbOnResize } from '../../../hooks/useCbOnResize'
import * as Styled from './PoolStatus.styles'

export type Props = {
  label: string
  extraLabel?: React.ReactNode
  displayValue: string
  fullValue?: string
  isLoading?: boolean
}

export const PoolStatus: React.FC<Props> = (props): JSX.Element => {
  const { label, extraLabel = <></>, displayValue, fullValue, isLoading } = props
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

  const TooltipContainer: React.FC<{ children: React.ReactNode }> = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      return !isLoading && (showTooltip || fullValue !== displayValue) ? (
        <Styled.Tooltip title={fullValue}>
          <span>{children}</span>
        </Styled.Tooltip>
      ) : (
        <>{children}</>
      )
    },
    [isLoading, showTooltip, fullValue, displayValue]
  )

  return (
    <Styled.PoolStatusWrapper ref={containerRef} {...props}>
      <div className="flex items-center">
        <Styled.Title textTransform="uppercase">{label}</Styled.Title>
        {extraLabel}
      </div>
      <Styled.Value loading={isLoading} ref={amountRef} className="amount">
        <TooltipContainer>{displayValue}</TooltipContainer>
      </Styled.Value>
    </Styled.PoolStatusWrapper>
  )
}
