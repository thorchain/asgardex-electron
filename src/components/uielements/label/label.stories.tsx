import React from 'react'
import { storiesOf } from '@storybook/react'
import { text, radios } from '@storybook/addon-knobs'
import { keyBy } from 'lodash'

import Label from './label'
import { SizeOptions, ColorOptions, WeightOptions } from './types'

storiesOf('Components/Label', module)
  .add('default', () => {
    return <Label>This is default Label</Label>
  })
  .add('small', () => {
    return (
      <div>
        <Label size="small" color="normal">
          This is the LABEL!
        </Label>
        <Label size="small" color="normal" weight="light">
          This is the LABEL!
        </Label>
        <Label size="small" color="normal" weight="bold">
          This is the LABEL!
        </Label>
        <Label size="small" color="primary">
          This is the LABEL!
        </Label>
        <Label size="small" color="success">
          This is the LABEL!
        </Label>
        <Label size="small" color="warning">
          This is the LABEL!
        </Label>
        <Label size="small" color="error">
          This is the LABEL!
        </Label>
        <Label size="small" color="normal">
          This is the LABEL!
        </Label>
        <Label size="small" color="dark">
          This is the LABEL!
        </Label>
        <Label size="small" color="light">
          This is the LABEL!
        </Label>
      </div>
    )
  })
  .add('normal', () => {
    return (
      <div>
        <Label size="normal" color="normal">
          This is the LABEL!
        </Label>
        <Label size="normal" color="normal" weight="light">
          This is the LABEL!
        </Label>
        <Label size="normal" color="normal" weight="bold">
          This is the LABEL!
        </Label>
        <Label size="normal" color="primary">
          This is the LABEL!
        </Label>
        <Label size="normal" color="success">
          This is the LABEL!
        </Label>
        <Label size="normal" color="warning">
          This is the LABEL!
        </Label>
        <Label size="normal" color="error">
          This is the LABEL!
        </Label>
        <Label size="normal" color="normal">
          This is the LABEL!
        </Label>
        <Label size="normal" color="dark">
          This is the LABEL!
        </Label>
        <Label size="normal" color="light">
          This is the LABEL!
        </Label>
      </div>
    )
  })
  .add('big', () => {
    return (
      <div>
        <Label size="big" color="normal">
          This is the LABEL!
        </Label>
        <Label size="big" color="normal" weight="light">
          This is the LABEL!
        </Label>
        <Label size="big" color="normal" weight="bold">
          This is the LABEL!
        </Label>
        <Label size="big" color="primary">
          This is the LABEL!
        </Label>
        <Label size="big" color="success">
          This is the LABEL!
        </Label>
        <Label size="big" color="warning">
          This is the LABEL!
        </Label>
        <Label size="big" color="error">
          This is the LABEL!
        </Label>
        <Label size="big" color="normal">
          This is the LABEL!
        </Label>
        <Label size="big" color="dark">
          This is the LABEL!
        </Label>
        <Label size="big" color="light">
          This is the LABEL!
        </Label>
      </div>
    )
  })
  .add('large', () => {
    return (
      <div>
        <Label size="large" color="normal">
          This is the LABEL!
        </Label>
        <Label size="large" color="normal" weight="light">
          This is the LABEL!
        </Label>
        <Label size="large" color="normal" weight="bold">
          This is the LABEL!
        </Label>
        <Label size="large" color="primary">
          This is the LABEL!
        </Label>
        <Label size="large" color="success">
          This is the LABEL!
        </Label>
        <Label size="large" color="warning">
          This is the LABEL!
        </Label>
        <Label size="large" color="error">
          This is the LABEL!
        </Label>
        <Label size="large" color="normal">
          This is the LABEL!
        </Label>
        <Label size="large" color="dark">
          This is the LABEL!
        </Label>
        <Label size="large" color="light">
          This is the LABEL!
        </Label>
      </div>
    )
  })
  .add('properties', () => {
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
