import React, { useCallback, useRef } from 'react'

import { Row } from 'antd'
import BigNumber from 'bignumber.js'

// import { useCbOnResize } from '../../../hooks/useCbOnResize'
import Label from '../label'
import Trend from '../trend'
import * as Styled from './PoolStatus.style'

type Props = {
  label: string
  fullValue?: string
  trend?: BigNumber
}

const PoolStatus: React.FC<Props> = (props): JSX.Element => {
  const { children, label, trend, fullValue } = props
  // const [showTooltip, setShowTooltip] = useState(false)
  const amountRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // const onResizeCb = useCallback(() => {
  //   if (!amountRef.current) {
  //     return
  //   }
  //
  //   if (amountRef.current.offsetWidth < amountRef.current.scrollWidth) {
  //     setShowTooltip(true)
  //   } else {
  //     setShowTooltip(false)
  //   }
  // }, [amountRef])
  //
  // useCbOnResize(onResizeCb)

  const TooltipContainer: React.FC = useCallback(
    (props) => {
      fullValue && console.log(fullValue)
      return fullValue ? (
        // @ts-ignore
        <Styled.Tooltip title={fullValue}>
          <>{props.children}</>
        </Styled.Tooltip>
      ) : (
        <>{props.children}</>
      )
    },
    [fullValue]
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
