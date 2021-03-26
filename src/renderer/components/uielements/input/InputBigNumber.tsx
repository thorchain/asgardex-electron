import React, { useMemo, useCallback, useRef, useState, useEffect, forwardRef } from 'react'

import { delay, bn, fixedBN, trimZeros } from '@xchainjs/xchain-util'
import { Input } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BN } from '../../../const'
import * as Styled from './Input.style'
import { VALUE_ZERO, formatValue, validInputValue } from './Input.util'

type Props = Omit<Styled.InputProps, 'value' | 'onChange'> & {
  value?: BigNumber
  onChange?: (value: BigNumber) => void
  decimal?: number
}

export const InputBigNumber = forwardRef<Input, Props>(
  (props: Props, ref): JSX.Element => {
    const {
      decimal = 2,
      value = ZERO_BN,
      onChange = () => {},
      onFocus = FP.constVoid,
      onBlur = FP.constVoid,
      ...otherProps /* any props of `InputNumberProps` */
    } = props

    // value as string (unformatted) - it supports empty string for an empty input
    const [enteredValue, setEnteredValue] = useState<O.Option<string>>(O.none)
    const [focus, setFocus] = useState(false)
    const broadcastValue = useRef<O.Option<BigNumber>>(O.none)

    const inputValue = useMemo(
      () =>
        FP.pipe(
          enteredValue,
          O.getOrElse(() => value.toFixed(decimal)),
          (v) => (focus ? v : formatValue(v, decimal))
        ),
      [enteredValue, focus, decimal, value]
    )

    useEffect(() => {
      FP.pipe(
        // fix to decimal
        value.toFixed(decimal),
        // trim zeros
        trimZeros,
        O.some,
        // save value into state
        setEnteredValue
      )
    }, [decimal, value])

    const onFocusHandler = useCallback(
      async (event: React.FocusEvent<HTMLInputElement>) => {
        const { target } = event
        onFocus(event)
        setFocus(true)
        // short delay is needed before selecting to keep its reference
        // (it will be lost in other cases due React rendering)
        await delay(1)
        target.select()
      },
      [onFocus]
    )

    const _onBlurHandler = useCallback(() => {
      setFocus(false)
      // Clean up value - it can't be done in onChangeHandler due race conditions!!
      setEnteredValue((v) =>
        FP.pipe(
          v,
          // convert empty string to '0'
          O.map((v) => (v === '' ? VALUE_ZERO : v)),
          // remove uneeded zeros
          O.map(trimZeros)
        )
      )
    }, [])

    const onBlurHandler = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        _onBlurHandler()
        onBlur(event)
      },
      [_onBlurHandler, onBlur]
    )

    const onPressEnterHandler = useCallback(() => {
      _onBlurHandler()
    }, [_onBlurHandler])

    const onChangeHandler = useCallback(
      ({ target }: React.ChangeEvent<HTMLInputElement>) => {
        const { value: newValue } = target
        const { max } = otherProps
        if (validInputValue(newValue)) {
          // some checks needed whether to broadcast changes or not
          FP.pipe(
            O.some(newValue),
            // ignore empty input
            O.filter((value) => value !== ''),
            // Limit to `max` value if needed
            O.map((value) => {
              if (!max) return value

              const maxBN = bn(max)
              const valueBN = bn(value)
              // if `value` > `max`, use `max`
              return valueBN.isLessThanOrEqualTo(maxBN) ? value : max.toString()
            }),
            // Limit decimal places of entered value
            O.map((value) => {
              const valueBN = bn(value)
              const valueDecimal = bn(value).decimalPlaces()
              // For only zero decimals (e.g`0.000000`) trim value to a single ZERO if its decimal places > `decimal`
              const newValue = valueBN.isZero() && value.length > decimal + 2 /* 2 == offset for "0." */ ? '0' : value
              // convert it back to a string
              return valueDecimal > decimal ? valueBN.toFixed(decimal) : newValue
            }),

            O.alt(() => O.some('0')),
            O.map((value) => {
              // store entered value in state
              setEnteredValue(O.some(value))
              return value
            }),
            // format value
            O.map((value) => fixedBN(value, decimal)),
            // Dirty check
            O.filter((valueBN) =>
              FP.pipe(
                broadcastValue.current,
                O.map((current) => !current.isEqualTo(valueBN)),
                // always accept first (default) of `broadcastValue.current`,
                // which is `none` by default
                O.getOrElse<boolean>(() => true)
              )
            ),
            O.map((valueBN) => {
              // store broadcast value
              broadcastValue.current = O.some(valueBN)
              // Inform outside world about changes
              onChange(valueBN)
              return valueBN
            })
          )
        }
      },
      [decimal, onChange, otherProps]
    )

    return (
      <Styled.InputBigNumber
        ref={ref}
        value={inputValue}
        onChange={onChangeHandler}
        onFocus={onFocusHandler}
        onBlur={onBlurHandler}
        onPressEnter={onPressEnterHandler}
        {...otherProps}
      />
    )
  }
)
