import React, { useState } from 'react'

import { ComponentMeta } from '@storybook/react'

import { Slider as Component } from './index'

const marks = {
  0: '0%',
  100: '100%'
}

const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '300px'
}

const Template = () => {
  const [currentValue, setCurrentValue] = useState(50)
  return (
    <div style={style}>
      <p>currentValue {currentValue}</p>
      <Component defaultValue={currentValue} onChange={setCurrentValue} />
      <Component value={currentValue} withLabel />
      <Component value={currentValue} marks={marks} />
    </div>
  )
}
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Slider'
}

export default meta
