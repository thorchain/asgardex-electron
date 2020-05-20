import React from 'react'
import { storiesOf } from '@storybook/react'
import { text, radios } from '@storybook/addon-knobs'
import { keyBy } from 'lodash'

import Label from './label'
import { Color, Size } from './types'

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

  const sizeOptions: SizeOptions = keyBy(['tiny', 'small', 'normal', 'big', 'large'])
  const colorOptions: ColorOptions = keyBy([
    'primary',
    'success',
    'warning',
    'error',
    'normal',
    'light',
    'dark',
    'white'
  ])
  const weightOptions: WeightOptions = keyBy(['light', 'bold', 'normal'])

  const size = radios('size', sizeOptions, 'normal')
  const weight = radios('weight', weightOptions, 'normal')
  const color = radios('color', colorOptions, 'normal')

  return (
    <Label size={size} color={color} weight={weight}>
      {labelText}
    </Label>
  )
})
