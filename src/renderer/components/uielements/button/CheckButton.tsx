import React, { useState, useCallback, useEffect } from 'react'

import * as FP from 'fp-ts/function'

import * as Styled from './CheckButton.styles'

export type Props = {
  clickHandler?: (checked: boolean) => void
  disabled?: boolean
  checked: boolean
  children: React.ReactNode
  className?: string
}

export const CheckButton: React.FC<Props> = (props): JSX.Element => {
  const { clickHandler = FP.constVoid, disabled, checked: checkedProp, className, children } = props

  const [checked, setChecked] = useState(checkedProp)

  // update internal state of `isChecked` whenever `checked` prop has been changed,
  // internal state won't be updated in other case
  useEffect(() => {
    setChecked(checkedProp)
  }, [checkedProp])

  const onClickHandler = useCallback(() => {
    const newValue = !checked
    setChecked(() => newValue)
    clickHandler(newValue)
  }, [checked, clickHandler])

  return (
    <Styled.Button onClick={onClickHandler} disabled={disabled} checked={checked} className={className}>
      <Styled.ContentWrapper>
        <Styled.CheckCircleOutlined checked={checked} />
        {children}
      </Styled.ContentWrapper>
    </Styled.Button>
  )
}
