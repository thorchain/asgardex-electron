import React from 'react'

// TODO (@veado) Replace knobs
// import { text, radios } from '@storybook/addon-knobs'
// import { RadiosTypeOptionsProp } from '@storybook/addon-knobs/dist/components/types'
import { storiesOf } from '@storybook/react'

import { Label } from './Label'
import { Color, Size, Weight } from './Label.types'

storiesOf('Components/Label', module).add('properties', () => {
  // const labelText = text('Label Text', 'This is Label Text!')

  // const sizeOptions: RadiosTypeOptionsProp<Size> = {
  //   tiny: 'tiny',
  //   small: 'small',
  //   normal: 'normal',
  //   big: 'big',
  //   large: 'large'
  // }
  // const colorOptions: RadiosTypeOptionsProp<Color> = {
  //   primary: 'primary',
  //   success: 'success',
  //   warning: 'warning',
  //   error: 'error',
  //   normal: 'normal',
  //   light: 'light',
  //   dark: 'dark',
  //   input: 'input',
  //   gray: 'gray',
  //   white: 'white'
  // }
  // const weightOptions: RadiosTypeOptionsProp<Weight> = {
  //   light: 'light',
  //   bold: 'bold',
  //   normal: 'normal'
  // }

  // const size = radios('size', sizeOptions, 'normal')
  // const weight = radios('weight', weightOptions, 'normal')
  // const color = radios('color', colorOptions, 'normal')

  const size: Size = 'normal'
  const weight: Weight = 'normal'
  const color: Color = 'normal'
  const labelText = 'Label Text'

  return (
    <Label size={size} color={color} weight={weight}>
      {labelText}
    </Label>
  )
})
