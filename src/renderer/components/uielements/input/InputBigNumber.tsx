import React, { useCallback, useState, useEffect, forwardRef } from 'react'

import { delay, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BN } from '../../../const'
import { eqBigNumber } from '../../../helpers/fp/eq'
import { FixmeType } from '../../../types/asgardex'
import { Input, InputProps } from './Input'
import { formatValue, unformatValue, validInputValue, VALUE_ZERO, EMPTY_INPUT, truncateByDecimals } from './Input.util'

type Props = Omit<InputProps, 'value' | 'onChange'> & {
  value?: BigNumber
  onChange?: (value: BigNumber) => void
  decimal?: number
  onPressEnter?: (value: BigNumber) => void
}

export const InputBigNumber = forwardRef<HTMLInputElement, Props>((props: Props, ref: FixmeType): JSX.Element => {
  const {
    decimal = 2,
    value = ZERO_BN,
    onChange = () => {},
    onFocus = FP.constVoid,
    onBlur = FP.constVoid,
    max,
    ...otherProps /* any props of `InputNumberProps` */
  } = props

  // value as string (formatted) - it supports empty string for an empty input
  const [broadcastValue, setBroadcastValue] = useState<O.Option<string>>(O.some(VALUE_ZERO))

  const setValues = useCallback(
    (targetValue: string) => {
      if (targetValue === EMPTY_INPUT) {
        onChange(ZERO_BN)
        setBroadcastValue(O.none)
      } else {
        // check for the '.' at the end of a `targetValue`
        const formatted = formatValue(unformatValue(targetValue), decimal).replaceAll(',', '')
        const bnValue = bnOrZero(formatted)
        if (!eqBigNumber.equals(bnValue, value)) {
          setBroadcastValue(O.some(formatted))
          onChange(bnValue)
        }

        if (
          targetValue !==
          FP.pipe(
            broadcastValue,
            O.getOrElse(() => EMPTY_INPUT)
          )
        ) {
          setBroadcastValue(O.some(targetValue))
        }
      }
    },
    [onChange, value, decimal, broadcastValue]
  )

  useEffect(() => {
    FP.pipe(
      value,
      O.some,
      // filter out all duplicated real values
      O.filter((val) => {
        return FP.pipe(
          broadcastValue,
          O.map((prevValue) => !eqBigNumber.equals(val, bnOrZero(unformatValue(prevValue)))),
          O.getOrElse((): boolean => false)
        )
      }),
      // fix to decimal + always round down for currencies
      O.map((val) => val.toFixed(decimal, BigNumber.ROUND_DOWN)),
      O.map((s) => formatValue(s, decimal)),
      O.map(setValues)
    )
  }, [decimal, value, setValues, broadcastValue])

  const onFocusHandler = useCallback(
    async (event: React.FocusEvent<HTMLInputElement>) => {
      const { target } = event
      onFocus(event)
      FP.pipe(broadcastValue, O.map(unformatValue), O.map(setValues))
      // setFocus(true)
      // short delay is needed before selecting to keep its reference
      // (it will be lost in other cases due React rendering)
      await delay(1)
      target.select()
    },
    [onFocus, broadcastValue, setValues]
  )

  const _onBlurHandler = useCallback(() => {
    FP.pipe(
      broadcastValue,
      // in case user entered an empty string there will be an O.none
      // restore it to the empty string
      O.alt(() => O.some(EMPTY_INPUT)),
      O.map((v) => (v === EMPTY_INPUT ? VALUE_ZERO : v)),
      // Pass ONLY meaningful value without formatting
      O.map((v) => formatValue(unformatValue(v), decimal)),
      O.map(setValues)
    )
  }, [setValues, broadcastValue, decimal])

  const onBlurHandler = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      _onBlurHandler()
      onBlur(event)
    },
    [_onBlurHandler, onBlur]
  )

  const onKeyDownHandler = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter') {
        _onBlurHandler()
      }
    },
    [_onBlurHandler]
  )

  const onChangeHandler = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      const { value: newValue } = target

      if (validInputValue(unformatValue(newValue))) {
        // some checks needed whether to broadcast changes or not
        FP.pipe(
          O.some(newValue),
          // format '.' to '.0'
          O.map((value) => (value === '.' ? '0.' : value)),
          // Limit to `max` value if needed
          O.map((value) => {
            if (!max) return value

            const maxBN = bnOrZero(max)
            const valueBN = bnOrZero(value)
            // if `value` > `max`, use `max`
            return valueBN.isLessThanOrEqualTo(maxBN) ? value : max.toString()
          }),
          // Limit decimal places of entered value
          O.map(truncateByDecimals(decimal)),
          O.map(setValues)
        )
      }
    },
    [decimal, max, setValues]
  )

  return (
    <Input
      ref={ref}
      value={FP.pipe(
        broadcastValue,
        O.getOrElse(() => EMPTY_INPUT)
      )}
      onChange={onChangeHandler}
      onFocus={onFocusHandler}
      onBlur={onBlurHandler}
      onKeyDown={onKeyDownHandler}
      max={max}
      {...otherProps}
    />
  )
})
