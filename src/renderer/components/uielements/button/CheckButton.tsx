import React, { useState, useCallback, useEffect } from 'react'

import * as FP from 'fp-ts/function'

import * as Styled from './CheckButton.styles'

export type Props = {
  clickHandler?: FP.Lazy<void>
  disabled?: boolean
  checked: boolean
  className?: string
}

export const CheckButton: React.FC<Props> = (props): JSX.Element => {
  const { clickHandler = FP.constVoid, disabled, checked, className, children } = props

  const [isChecked, setChecked] = useState(checked)

  useEffect(() => {
    setChecked(checked)
  }, [checked])

  const onClickHandler = useCallback(() => {
    setChecked(() => !isChecked)
    clickHandler && clickHandler()
  }, [isChecked, clickHandler])

  return (
    <Styled.Button onClick={onClickHandler} disabled={disabled} checked={isChecked} className={className}>
      <Styled.ContentWrapper>
        <Styled.CheckCircleOutlined checked={isChecked} />
        {children}
      </Styled.ContentWrapper>
    </Styled.Button>
  )
}
