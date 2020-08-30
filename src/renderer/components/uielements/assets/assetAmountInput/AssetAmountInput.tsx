import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'

import { delay, bn, fixedBN } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { trimZeros } from '../../../../helpers/stringHelper'
import * as Styled from './AssetAmountInput.style'
import { VALUE_ZERO, formatValue, validInputValue } from './util'

type Props = {
  value?: BigNumber
  onChange?: (value: BigNumber) => void
  decimal?: number
}

const AssetAmountInput: React.FC<Props> = (props: Props): JSX.Element => {
  const { decimal = 2, value = bn(0), onChange = () => {} } = props

  const valueAsString = value.toString()

  // value as string (unformatted)
  const [enteredValue, setEnteredValue] = useState<O.Option<string>>(O.none)
  const [focus, setFocus] = useState(false)
  const broadcastValue = useRef<BigNumber>(bn(0))

  const inputValue = useMemo(() => {
    const altValue = FP.pipe(
      enteredValue,
      O.getOrElse(() => valueAsString)
    )
    return focus ? altValue : formatValue(altValue, decimal)
  }, [valueAsString, decimal, focus, enteredValue])

  useEffect(() => {
    const v = FP.pipe(
      enteredValue,
      O.getOrElse(() => '')
    )
    const newAmount = fixedBN(v, decimal)
    if (v !== '' && !broadcastValue.current.isEqualTo(newAmount)) {
      broadcastValue.current = newAmount
      onChange(newAmount)
    }
  }, [enteredValue, onChange, focus, decimal])

  const onFocusHandler = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event
      setFocus(true)
      // short delay is needed before selecting to keep its reference
      // (it will be lost in other cases dure React rendering)
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
        // remove uneeded zeros
        O.map(trimZeros),
        // format value based on supported decimals
        O.map((v) => {
          const n = fixedBN(v, decimal).toString()
          console.log('n:', n)
          return n
        })
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
    <Styled.Input
      value={inputValue}
      onChange={onChangeHandler}
      onFocus={onFocusHandler}
      onBlur={onBlurHandler}
      onPressEnter={onPressEnterHandler}
    />
  )
}

export default AssetAmountInput
