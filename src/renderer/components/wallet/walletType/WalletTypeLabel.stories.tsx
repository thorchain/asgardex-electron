import { ComponentMeta, StoryFn } from '@storybook/react'

import { WalletTypeLabel as Component, Props } from './WalletTypeLabel'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/WalletTypeLabel',
  argTypes: {
    children: {
      name: 'wallet type',
      options: ['keystore', 'ledger']
    }
  },
  args: {
    children: 'keystore'
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: '#fff' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
