import React, { useCallback, useState, useEffect } from 'react'

import theme from '@thorchain/asgardex-theme'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import useInterval, { INACTIVE_INTERVAL } from '../../../hooks/useInterval'
import { RefundIcon } from '../../icons/timerIcons'
import * as Styled from './TxTimer.style'

import 'react-circular-progressbar/dist/styles.css'

export type Props = {
  className?: string
  interval?: number
  maxSec?: number
  maxValue: number
  maxDuration?: number
  refunded?: boolean
  startTime?: number
  status: boolean
  value: number
  onChange?: () => void
  onEnd?: () => void
}

export const TxTimer: React.FC<Props> = (props): JSX.Element => {
  const {
    status = false,
    value,
    maxValue,
    maxSec = 0,
    startTime = Date.now(),
    onChange = () => {},
    interval = 1000,
    maxDuration,
    refunded = false,
    onEnd = () => {},
    className = ''
  } = props

  const [active, setActive] = useState(false)
  const [totalDuration, setTotalDuration] = useState<number>(0)

  // Check if counter has reached the end
  const isEnd = useCallback(() => {
    // Check of `maxSec` wins over `maxValue`
    if (maxSec > 0 && totalDuration >= maxSec) {
      return true
    }
    return value >= maxValue
  }, [maxSec, maxValue, totalDuration, value])

  // Callback for counting
  const countHandler = useCallback(() => {
    onChange()
  }, [onChange])

  // Interval to inform outside world about counting
  const countInterval = status && !isEnd() ? interval : INACTIVE_INTERVAL

  useInterval(countHandler, countInterval)

  // Callback for counting time differences
  const countSecHandler = useCallback(() => {
    const diff = (Date.now() - startTime) / 1000
    setTotalDuration(diff)
  }, [startTime])

  // Interval to count seconds
  const countSecInterval = startTime && status && !isEnd() ? 100 : INACTIVE_INTERVAL
  useInterval(countSecHandler, countSecInterval)

  // Reset everything at end
  const handleEndTimer = useCallback(() => {
    onEnd()
    setTotalDuration(0)
    setActive(false)
  }, [onEnd])

  // Delay the end of counting - for UX purposes only
  useEffect(() => {
    if (isEnd() && status) {
      const id = setTimeout(handleEndTimer, maxDuration)
      return () => clearTimeout(id)
    }
  }, [handleEndTimer, isEnd, status, maxDuration])

  // Internal `active` state depends on `status`
  useEffect(() => {
    setActive(status)
  }, [status])

  const hide = isEnd() && !active
  const CircularProgressbarStyle = `${hide ? 'hide' : ''} timerchart-circular-progressbar`

  const totalDurationString =
    totalDuration < 10 ? Number(totalDuration).toFixed(1) : Math.round(totalDuration).toString()

  return (
    <>
      <div>active: {active.toString()}</div>
      <div>totalDuration: {totalDuration}</div>
      <div>isEnd: {isEnd().toString()}</div>
      <Styled.TxTimerWrapper className={`txTimer-wrapper ${className}`}>
        <div className="timerchart-icon">
          {!active && <Styled.IconWrapper>{!refunded ? <Styled.SuccessIcon /> : <RefundIcon />}</Styled.IconWrapper>}
        </div>
        {active && (
          <CircularProgressbar
            className={CircularProgressbarStyle}
            value={value}
            text={`${totalDurationString}s`}
            strokeWidth={7}
            counterClockwise
            styles={buildStyles({
              textColor: theme.dark.palette.primary[0] || '#23DCC8',
              textSize: '14px',
              pathColor: theme.dark.palette.primary[0] || '#23DCC8',
              trailColor: 'rgba(242, 243, 243, 0.5)',
              pathTransition: 'stroke-dashoffset 0.5s linear 0s'
            })}
          />
        )}
      </Styled.TxTimerWrapper>
    </>
  )
}
