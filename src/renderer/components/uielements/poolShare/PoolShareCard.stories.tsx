import { ComponentMeta, StoryFn } from '@storybook/react'

import { PoolShareCard as Component, Props } from './PoolShareCard'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const oneChild = <p>Some contents...</p>

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/PoolShareCard',
  argTypes: {
    children: {
      options: ['one', 'two', 'three'],
      mapping: {
        one: oneChild,
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
  },
  args: {
    title: 'title',
    children: oneChild
  }
}

export default meta
