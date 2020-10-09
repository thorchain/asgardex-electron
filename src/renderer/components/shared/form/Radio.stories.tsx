import React from 'react'

import { storiesOf } from '@storybook/react'

import { Radio, RadioLabel } from './Radio.style'

storiesOf('Components/shared/Radio', module)
  .add('default', () => {
    return (
      <Radio.Group defaultValue="1">
        <Radio value="1">
          <RadioLabel>One</RadioLabel>
        </Radio>
        <Radio value="2">
          <RadioLabel>Two</RadioLabel>
        </Radio>
      </Radio.Group>
    )
  })
  .add('disabled', () => {
    return (
      <Radio.Group defaultValue="1" disabled={true}>
        <Radio value="1">
          <RadioLabel disabled={true}>One</RadioLabel>
        </Radio>
        <Radio value="2">
          <RadioLabel disabled={true}>Two</RadioLabel>
        </Radio>
      </Radio.Group>
    )
  })
