import React from 'react'

import { withKnobs, boolean, number } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { TxTimer } from './index'

storiesOf('Components/TxTimer', module)
  .addDecorator(withKnobs)
  .add('dynamicValues', () => {
    return (
      <TxTimer
        status={boolean('status', false)}
        value={number('value', 0)}
        maxValue={number('max value', 100)}
        startTime={Date.now()}
      />
    )
  })
