import React from 'react'

import { InputProps } from 'antd/lib/input'

import { InputWrapper, InputPasswordWrapper } from './Input.style'
import { Color, InputType, InputSecurity, Size } from './types'

interface Props extends InputProps {
  sizevalue?: Size
  color?: Color
  typevalue?: InputType
  security?: InputSecurity
}

const Input: React.FC<Props> = ({
  color = 'primary',
  sizevalue = 'normal',
  typevalue = 'normal',
  security = 'normal',
  ...rest
}): JSX.Element => {
  return security === 'password' ? (
    <InputPasswordWrapper color={color} sizevalue={sizevalue} typevalue={typevalue} {...rest} />
  ) : (
    <InputWrapper color={color} sizevalue={sizevalue} typevalue={typevalue} {...rest} />
  )
}

export default Input
