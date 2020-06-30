import React from 'react'

import { TextAreaProps } from 'antd/lib/input'

import { InputTextAreaWrapper } from './Input.style'
import { Color, InputType, Size } from './types'

interface Props extends TextAreaProps {
  sizevalue?: Size
  color?: Color
  typevalue?: InputType
}

const InputTextArea: React.FC<Props> = ({
  color = 'primary',
  sizevalue = 'normal',
  typevalue = 'normal',
  ...rest
}): JSX.Element => {
  return <InputTextAreaWrapper color={color} sizevalue={sizevalue} typevalue={typevalue} {...rest} />
}

export default InputTextArea
