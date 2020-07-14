import React, { useCallback, useEffect, useRef, useState } from 'react'

import { bn, isValidBN } from '@thorchain/asgardex-util'
import { SizeType } from 'antd/lib/config-provider/SizeContext'
import BigNumber from 'bignumber.js'

import { emptyString } from '../../../../helpers/stringHelper'
import { CoinInputAdvancedView } from './CoinInputAdvanced.style'

const formatNumber = (value: string, minimumFractionDigits: number) => {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits
  })
}

function formatStringToBigNumber(value: string): BigNumber {
  // (Rudi) This will have a localisation problem
  const cleanValue = value.replace(/,/g, '')
  return bn(cleanValue)
}

export function isBroadcastable(value: string) {
  return (
    typeof value === 'string' &&
    value !== undefined &&
    value !== null &&
    value !== '' &&
    isValidBN(formatStringToBigNumber(value)) &&
    !value.match(/\.$/)
  )
}

const DEFAULT_FIELD_VALUE = undefined

type BehaviorProps = {
  amount: BigNumber
  onChangeValue: (value: BigNumber) => void
  onFocus: (() => void) | undefined
  minimumFractionDigits?: number
}
// NOTE (Rudi): After getting this to work realised
// This can probably be refactored to be more simple by creating two
// custom hooks representing each mode focussed or not and then
// switching between them. No time right now however.
export function useCoinCardInputBehaviour({
  amount,
  onChangeValue,
  onFocus,
  minimumFractionDigits = 2
}: BehaviorProps) {
  // Note: Amount could be undefined|null, since we have not migrated everything to TS yet, so check it here
  // Note Amount could be a number instead of bignumber
  const valueAsString = !!amount && isValidBN(new BigNumber(amount)) ? amount.toString() : '0'

  const [focus, setFocus] = useState<boolean>(false)
  const [textFieldValue, setTextFieldValue] = useState<string | undefined>(DEFAULT_FIELD_VALUE)
  const broadcastRef = useRef<BigNumber>(bn(0))

  const getOutval = useCallback(() => {
    const txtValue = textFieldValue !== undefined ? textFieldValue : valueAsString // (Rudi) allows for empty string ''
    return focus ? txtValue : formatNumber(txtValue, minimumFractionDigits)
  }, [focus, minimumFractionDigits, textFieldValue, valueAsString])

  const handleFocus = useCallback(
    (event) => {
      setFocus(true)
      onFocus && onFocus()
      // (Rudi) need to store a ref in a var or
      // target getter will loose it
      const { target } = event
      setTimeout(() => {
        target.select()
      }, 0)
    },
    [setFocus, onFocus]
  )

  const handleChange = useCallback((event) => {
    setFocus(true)
    let val = event.target.value
    // Update '.'  to ' 0.'
    const ZERO_DECIMAL = '0.'
    val = val === '.' ? ZERO_DECIMAL : val
    const isValidNumber = isValidBN(bn(val))
    const validValue = isValidNumber || val === emptyString || val === ZERO_DECIMAL
    if (validValue) {
      setTextFieldValue(val)
    }
  }, [])

  useEffect(() => {
    const numberfiedValueStr = focus ? getOutval() : formatStringToBigNumber(getOutval()).toString()

    if (isBroadcastable(numberfiedValueStr)) {
      const valToSend = formatStringToBigNumber(numberfiedValueStr)

      // Update text value to be not empty
      if (valToSend.isEqualTo(0) && textFieldValue === '') {
        setTextFieldValue(numberfiedValueStr)
      }

      if (!focus && textFieldValue !== '') {
        setTextFieldValue(DEFAULT_FIELD_VALUE) // (Rudi) clear textfield value for next render
      }

      // (Rudi) only broadcast when we are broadcasting a new value
      // We can't compare BigNumbers directly, since they are immutable
      if (!broadcastRef.current.isEqualTo(valToSend)) {
        broadcastRef.current = valToSend
        onChangeValue(valToSend)
      }
    }
  }, [focus, getOutval, onChangeValue, setTextFieldValue, textFieldValue])

  const handleBlur = useCallback(
    (event) => {
      event.target.blur()
      setFocus(false)
    },
    [setFocus]
  )

  const handleKeyDown = useCallback(
    (event) => {
      handleBlur(event)
    },
    [handleBlur]
  )

  return {
    onBlur: handleBlur,
    onFocus: handleFocus,
    onChange: handleChange,
    onPressEnter: handleKeyDown,
    value: getOutval()
  }
}

type Props = {
  value: BigNumber
  onChangeValue: (value: BigNumber) => void
  onFocus?: () => void
  className?: string
  size?: SizeType
  minimumFractionDigits?: number
  disabled?: boolean
}

export const CoinInputAdvanced: React.FC<Props> = ({
  value,
  onChangeValue,
  onFocus,
  className = '',
  minimumFractionDigits = 2,
  size
}: Props): JSX.Element => {
  return (
    <CoinInputAdvancedView
      className={className}
      size={size}
      {...useCoinCardInputBehaviour({
        amount: value,
        onChangeValue,
        onFocus,
        minimumFractionDigits
      })}
    />
  )
}
