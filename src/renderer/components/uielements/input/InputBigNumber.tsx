import React, { useMemo, useCallback, useState, useRef, useEffect, forwardRef } from 'react'

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
      ...otherProps /* any props of `InputNumberProps` */
    } = props

    // value as string (unformatted) - it supports empty string for an empty input
    const [enteredValue, setEnteredValue] = useState<O.Option<string>>(O.none)
    const [focus, setFocus] = useState(false)
    const broadcastValue = useRef<BigNumber>(bn(0))

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

    const onBlurHandler = useCallback(() => {
      setFocus(false)
      // Clean up value - it can't be done in onChangeHandler due race conditions!!
      setEnteredValue((v) =>
        FP.pipe(
          v,
          // convert empty string to '0'
          O.map((v) => (v === '' ? VALUE_ZERO : v)),
          // format value based on supported decimals
          O.map((v) => bn(v).toFixed(decimal)),
          // remove uneeded zeros
          O.map(trimZeros)
        )
      )
    }, [decimal])

    const onPressEnterHandler = useCallback(() => {
      onBlurHandler()
    }, [onBlurHandler])

    const onChangeHandler = useCallback(
      ({ target }: React.ChangeEvent<HTMLInputElement>) => {
        const { value: newValue } = target
        if (validInputValue(newValue)) {
          // some checks needed whether to broadcast changes or not
          FP.pipe(
            O.some(newValue),
            // ignore empty input
            O.filter((v) => v !== ''),
            O.alt(() => O.some('0')),
            O.map((v) => {
              // store entered value in state
              setEnteredValue(O.some(v))
              return v
            }),
            // format value
            O.map((v) => fixedBN(v, decimal)),
            // different value as before?
            O.filter((v) => !broadcastValue.current.isEqualTo(v)),
            O.map((v) => {
              // store broadcast value
              broadcastValue.current = v
              // trigger `onChange` handler
              onChange(v)
              return v
            })
          )
        }
      },
      [broadcastValue, decimal, onChange]
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
