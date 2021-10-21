import React, { useState, useCallback } from 'react'

import * as FP from 'fp-ts/function'

import * as Styled from './CheckButton.styles'

export type Props = {
  clickHandler?: FP.Lazy<void>
  disabled?: boolean
  isChecked?: boolean
}

export const CheckButton: React.FC<Props> = (props): JSX.Element => {
  const { clickHandler = FP.constVoid, disabled, isChecked, children } = props

  const [checked, setChecked] = useState(!!isChecked)

  const onClickHandler = useCallback(() => {
    setChecked(() => !checked)
    clickHandler && clickHandler()
  }, [checked, clickHandler])

  return (
    <Styled.Button onClick={onClickHandler} disabled={disabled} checked={checked}>
      <Styled.ContentWrapper>
        <Styled.CheckCircleOutlined checked={checked} />
        {children}
      </Styled.ContentWrapper>
    </Styled.Button>
  )
}
