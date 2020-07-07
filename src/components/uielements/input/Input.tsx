import React from 'react'

import { InputProps } from 'antd/lib/input'

import { InputWrapper } from './Input.style'
import { Color, InputType, Size } from './types'

interface Props extends InputProps {
  sizevalue?: Size
  color?: Color
  typevalue?: InputType
}

const Input: React.FC<Props> = ({
  color = 'primary',
  sizevalue = 'normal',
  typevalue = 'normal',
  ...rest
}): JSX.Element => {
  return <InputWrapper color={color} sizevalue={sizevalue} typevalue={typevalue} {...rest} />
}

export default Input
