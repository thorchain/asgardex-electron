import React, { useCallback, useRef, useState } from 'react'

import { Row } from 'antd'
import BigNumber from 'bignumber.js'

import { useCbOnResize } from '../../../hooks/useCbOnResize'
import Label from '../label'
import Trend from '../trend'
import * as Styled from './PoolStatus.style'

type Props = {
  label: string
  trend?: BigNumber
}

const PoolStatus: React.FC<Props> = (props): JSX.Element => {
  const { children, label, trend } = props
  const [showTooltip, setShowTooltip] = useState(false)
  const amountRef = useRef()
  const containerRef = useRef()

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

  useCbOnResize(onResizeCb, [onResizeCb])

  const TooltipContainer: React.FC = useCallback(
    (props) =>
      showTooltip ? <Styled.Tooltip title={children}>{props.children}</Styled.Tooltip> : <>{props.children}</>,
    [showTooltip, children]
  )

  return (
    <Styled.PoolStatusWrapper ref={containerRef} {...props}>
      <TooltipContainer>
        <Row style={{ justifyContent: 'space-between', flexFlow: 'row' }}>
          <Styled.Value ref={amountRef} className="amount">
            {children}
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
