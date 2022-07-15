import { ComponentMeta } from '@storybook/react'

import { BackLink as Component } from './BackLink'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/BackLink',
  decorators: [
    (Story) => (
      <div style={{ padding: '15px' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
