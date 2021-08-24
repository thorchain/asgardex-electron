import React, { useCallback, useState, useEffect } from 'react'

import theme from '@thorchain/asgardex-theme'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import useInterval, { INACTIVE_INTERVAL } from '../../../hooks/useInterval'
import { RefundIcon } from '../../icons/timerIcons'
import * as Styled from './TxTimer.styles'

import 'react-circular-progressbar/dist/styles.css'

export type Props = {
  className?: string
  interval?: number
  maxSec?: number
  maxValue?: number
  maxDuration?: number
  refunded?: boolean
  /** Start time to count seconds (optional) Without a startTime no counter will start internally  */
  startTime?: number
  status: boolean
  /** value for progress bar (optional)  */
  value?: number
  onChange?: (_: number) => void
  onEnd?: () => void
}

export const TxTimer: React.FC<Props> = (props): JSX.Element => {
  const {
    status = false,
    value = NaN,
    maxValue = 100,
    maxSec = 0,
    startTime = NaN,
    onChange = () => {},
    interval = 1000,
    maxDuration = 100,
    refunded = false,
    onEnd = () => {},
    className = ''
  } = props

  const [active, setActive] = useState(true)
  const [totalDuration, setTotalDuration] = useState<number>(0)
  // internal value if value has not been set
  const [internalValue, setInternalValue] = useState<number>(0)

  // Check if duration has reached the end
  const isEnd = useCallback(() => {
    // Check of `maxSec` wins over `maxValue`
    if (maxSec > 0 && totalDuration >= maxSec) {
      return true
    }
    // check value or internalValue
    return (value || internalValue) >= maxValue
  }, [internalValue, maxSec, maxValue, totalDuration, value])

  // Callback for counting
  const countHandler = useCallback(() => {
    // update `internalValue` if value is not set
    if (!value) {
      setInternalValue((current) => {
        if (current < 80) {
          return current + 15
        }
        // stop at 95%, 100% has to be set from outside via `value` or `active`
        if (current < 95) {
          return current + 1
        }

        return current
      })
    }
    onChange(value || internalValue)
  }, [internalValue, onChange, value])

  // Interval to inform outside world about counting
  const countInterval = startTime && active && !isEnd() ? interval : INACTIVE_INTERVAL

  useInterval(countHandler, countInterval)

  // Callback for counting time differences
  const countSecHandler = useCallback(() => {
    const diff = (Date.now() - startTime) / 1000
    setTotalDuration(diff)
  }, [startTime])

  // Interval to count seconds
  const countSecInterval = startTime && active && !isEnd() ? 100 : INACTIVE_INTERVAL
  useInterval(countSecHandler, countSecInterval)

  // Reset everything at the end
  const handleEndTimer = useCallback(() => {
    onEnd()
    setTotalDuration(0)
    setActive(false)
  }, [onEnd])

  // Delay the end of counting - for UX purposes only
  useEffect(() => {
    if (isEnd() && active) {
      const id = setTimeout(handleEndTimer, maxDuration)
      return () => clearTimeout(id)
    }
  }, [handleEndTimer, isEnd, active, maxDuration])

  // Internal `active` state depends on `status`
  useEffect(() => {
    setActive(status)
  }, [status])

  // reset `totalDuration`
  useEffect(() => {
    if (isEnd() || !active) {
      setTotalDuration(0)
    }
  }, [active, isEnd])

  const hide = isEnd() && !active
  const CircularProgressbarStyle = `${hide ? 'hide' : ''} timerchart-circular-progressbar`

  const totalDurationString =
    totalDuration < 10 ? Number(totalDuration).toFixed(1) : Math.round(totalDuration).toString()

  const progressBarValue = value || internalValue

  return (
    <>
      <Styled.TxTimerWrapper className={`txTimer-wrapper ${className}`}>
        <div className="timerchart-icon">
          {!active && <Styled.IconWrapper>{!refunded ? <Styled.SuccessIcon /> : <RefundIcon />}</Styled.IconWrapper>}
        </div>
        {active && (
          <CircularProgressbar
            className={CircularProgressbarStyle}
            value={progressBarValue}
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
