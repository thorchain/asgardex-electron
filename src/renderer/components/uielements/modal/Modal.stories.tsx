import { ComponentMeta } from '@storybook/react'

import { Modal as Component } from './Modal'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Modal',
  argTypes: {
    children: {
      control: {
        type: 'select',
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
        }
      },
      defaultValue: 'one'
    },
    title: {
      control: {
        type: 'string'
      },
      defaultValue: 'Modal Title'
    }
  }
}

export default meta
