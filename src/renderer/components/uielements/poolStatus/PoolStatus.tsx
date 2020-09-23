import React, { useCallback, useRef, useState } from 'react'

import { Row } from 'antd'
import BigNumber from 'bignumber.js'

import { useCbOnResize } from '../../../hooks/useCbOnResize'
import Label from '../label'
import Trend from '../trend'
import * as Styled from './PoolStatus.style'

type Props = {
  label: string
  displayValue: string
  fullValue?: string
  trend?: BigNumber
  isLoading?: boolean
}

const PoolStatus: React.FC<Props> = (props): JSX.Element => {
  const { label, trend, displayValue, fullValue, isLoading } = props
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
        <Row style={{ justifyContent: 'space-between', flexFlow: 'row' }}>
          <Styled.Value loading={isLoading} ref={amountRef} className="amount">
            {displayValue}
          </Styled.Value>
          {trend && <Trend amount={trend} />}
        </Row>
        <Label textTransform="uppercase" color="light">
          {label}
        </Label>
      </TooltipContainer>
    </Styled.PoolStatusWrapper>
  )
}

export default PoolStatus
