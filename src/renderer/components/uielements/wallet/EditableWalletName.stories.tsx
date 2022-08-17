import { useState } from 'react'

import { ComponentMeta, StoryFn } from '@storybook/react'

import { EditableWalletName as Component, Props } from './EditableWalletName'

export const Default: StoryFn<Props> = (args) => {
  const { name, onChange, ...otherProps } = args
  const [walletName, setWalletName] = useState(name)

  const onChangeHandler = (name: string) => {
    setWalletName(name)
    onChange(name)
  }

  return <Component name={walletName} onChange={onChangeHandler} {...otherProps} />
}

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/EditableWalletName',
  decorators: [
    (Story) => (
      <div className="flex h-full w-full items-center justify-center">
        <Story />
      </div>
    )
  ],
  argTypes: {
    onChange: { action: 'onChange' }
  },
  args: {
    name: 'my wallet'
  }
}

export default meta
