import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'

import { delay, bn, fixedBN } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { trimZeros } from '../../../helpers/stringHelper'
import * as Styled from './Input.style'
import { VALUE_ZERO, formatValue, validInputValue } from './util'

type Props = Omit<Styled.InputProps, 'value' | 'onChange'> & {
  value?: BigNumber
  onChange?: (value: BigNumber) => void
  decimal?: number
}

export const InputBigNumber: React.FC<Props> = (props: Props): JSX.Element => {
  const { decimal = 2, value = bn(0), onChange = () => {}, ...otherProps /* any props of `InputNumberProps` */ } = props

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
    const valueToBroadcast = FP.pipe(
      enteredValue,
      // ignore empty input
      O.filter((v) => v !== ''),
      // format value
      O.map((v) => fixedBN(v, decimal)),
      // different value as before?
      O.filter((v) => !broadcastValue.current.isEqualTo(v))
    )

    if (O.isSome(valueToBroadcast)) {
      const v = valueToBroadcast.value
      broadcastValue.current = v
      onChange(v)
    }
  }, [enteredValue, onChange, focus, decimal])

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

  const onChangeHandler = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = target
    if (validInputValue(newValue)) {
      setEnteredValue(O.some(newValue))
    }
  }, [])

  return (
    <Styled.InputBigNumber
      value={inputValue}
      onChange={onChangeHandler}
      onFocus={onFocusHandler}
      onBlur={onBlurHandler}
      onPressEnter={onPressEnterHandler}
      {...otherProps}
    />
  )
}
