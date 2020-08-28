import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'

import { AssetAmount, delay, assetAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { trimZeros } from '../../../../helpers/stringHelper'
import * as Styled from './AssetAmountInput.style'
import { VALUE_ZERO, formatValue, validValue } from './util'

type Props = {
  amount?: AssetAmount
  onChange?: (value: AssetAmount) => void
  decimal?: number
}

const AssetAmountInput: React.FC<Props> = (props: Props): JSX.Element => {
  const { decimal = 8, amount = assetAmount(0, decimal), onChange = () => {} } = props

  const amountAsString = amount.amount().toString()

  // value as string (unformatted)
  const [value, setValue] = useState<O.Option<string>>(O.none)
  const [focus, setFocus] = useState(false)
  const broadcastValue = useRef<string>(VALUE_ZERO)

  const inputValue = useMemo(() => {
    const altValue = FP.pipe(
      value,
      O.getOrElse(() => amountAsString)
    )
    return focus ? altValue : formatValue(altValue)
  }, [amountAsString, focus, value])

  useEffect(() => {
    const v = FP.pipe(
      value,
      O.getOrElse(() => '')
    )
    if (v !== '' && broadcastValue.current !== v) {
      const newAmount = assetAmount(v, decimal)
      broadcastValue.current = v
      onChange(newAmount)
    }
  }, [value, onChange, focus, decimal])

  const onFocusHandler = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event
      setFocus(true)
      // delay is needed before selecting
      await delay(50)
      target.select()
    },
    [setFocus]
  )

  const onBlurHandler = useCallback(() => {
    setFocus(false)
    // Clean up value - it can't be done in onChangeHandler due race conditions!!
    setValue((v) =>
      FP.pipe(
        v,
        // remove uneeded zeros
        O.map(trimZeros),
        // remove uneeded decimal
        O.map((v) => assetAmount(v, decimal).amount().toString()),
        // convert empty string to '0'
        O.map((v) => (v === '' ? VALUE_ZERO : v))
      )
    )
  }, [decimal])

  const onPressEnterHandler = useCallback(() => {
    onBlurHandler()
  }, [onBlurHandler])

  const onChangeHandler = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = target
    if (validValue(newValue)) {
      setValue(O.some(newValue))
    }
  }, [])

  return (
    <>
      <Styled.Input
        value={inputValue}
        onChange={onChangeHandler}
        onFocus={onFocusHandler}
        onBlur={onBlurHandler}
        onPressEnter={onPressEnterHandler}
      />

      <div>{JSON.stringify(value)}</div>
    </>
  )
}

export default AssetAmountInput
