import React from 'react'

import { storiesOf } from '@storybook/react'

import Slider from './Slider'

const marks = {
  0: '0%',
  100: '100%'
}

storiesOf('Components/Slider', module).add('default', () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '300px'
      }}>
      <Slider defaultValue={30} />
      <Slider defaultValue={30} withLabel />
      <Slider defaultValue={30} marks={marks} />
    </div>
  )
})
