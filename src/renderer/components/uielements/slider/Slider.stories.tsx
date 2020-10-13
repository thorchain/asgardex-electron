import React, { useState } from 'react'

import { storiesOf } from '@storybook/react'

import Slider from './Slider'

const marks = {
  0: '0%',
  100: '100%'
}

const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '300px'
}

storiesOf('Components/Slider', module).add('default', () => {
  const [currentValue, setCurrentValue] = useState(50)
  return (
    <div style={style}>
      <p>currentValue {currentValue}</p>
      <Slider defaultValue={currentValue} onChange={setCurrentValue} />
      <Slider value={currentValue} withLabel />
      <Slider value={currentValue} marks={marks} />
    </div>
  )
})
