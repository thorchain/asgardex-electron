import React, { useMemo, useCallback, useState, useRef, useEffect, forwardRef } from 'react'

import { delay, bn, fixedBN, trimZeros } from '@thorchain/asgardex-util'
import { Input } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BN } from '../../../const'
import * as Styled from './Input.style'
import { VALUE_ZERO, formatValue, validInputValue } from './util'

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
          O.getOrElse(() => value.toString()),
          (v) => (focus ? v : formatValue(v, decimal))
        ),
      [enteredValue, focus, decimal, value]
    )

    useEffect(() => {
      setEnteredValue(O.some(value.toString()))
    }, [value])

    const onFocusHandler = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { target } = event
        setFocus(true)
        // short delay is needed before selecting to keep its reference
        // (it will be lost in other cases due React rendering)
        await delay(1)
        target.select()
      },
      [setFocus]
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
          O.map((v) => fixedBN(v, decimal).toString()),
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
          const valueToBroadcast = FP.pipe(
            O.some(newValue),
            // ignore empty input
            O.filter((v) => v !== ''),
            O.alt(() => O.some('0')),
            // format value
            O.map((v) => fixedBN(v, decimal)),
            // different value as before?
            O.filter((v) => !broadcastValue.current.isEqualTo(v))
          )

          setEnteredValue(O.some(newValue))

          if (O.isSome(valueToBroadcast)) {
            const v = valueToBroadcast.value
            broadcastValue.current = v

            onChange(bn(v))
          }
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
