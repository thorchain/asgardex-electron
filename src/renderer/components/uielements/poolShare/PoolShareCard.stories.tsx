import { ComponentMeta } from '@storybook/react'

import { PoolShareCard as Component } from './PoolShareCard'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/PoolShareCard',
  argTypes: {
    title: {
      control: {
        type: 'text'
      },
      defaultValue: 'title'
    },
    children: {
      options: ['one', 'two', 'three'],
      mapping: {
        one: <p>Some contents...</p>,
        two: (
          <>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </>
        ),
        three: (
          <>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </>
        )
      },
      defaultValue: 'one'
    }
  }
}

export default meta
