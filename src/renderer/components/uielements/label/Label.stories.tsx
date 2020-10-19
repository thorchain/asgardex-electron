import React from 'react'

import { text, radios } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { Label } from './Label'
import { Color, Size } from './Label.types'

type SizeOptions = {
  [key in Size]: Size
}

type WeightOptions = {
  [key: string]: string
}

type ColorOptions = {
  [key in Color]: Color
}

storiesOf('Components/Label', module).add('properties', () => {
  const labelText = text('Label Text', 'This is Label Text!')

  const sizeOptions: SizeOptions = {
    tiny: 'tiny',
    small: 'small',
    normal: 'normal',
    big: 'big',
    large: 'large'
  }
  const colorOptions: ColorOptions = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    error: 'error',
    normal: 'normal',
    light: 'light',
    dark: 'dark',
    input: 'input',
    gray: 'gray',
    white: 'white'
  }
  const weightOptions: WeightOptions = {
    light: 'light',
    bold: 'bold',
    normal: 'normal'
  }

  const size = radios('size', sizeOptions, 'normal')
  const weight = radios('weight', weightOptions, 'normal')
  const color = radios('color', colorOptions, 'normal')

  return (
    <Label size={size} color={color} weight={weight}>
      {labelText}
    </Label>
  )
})
