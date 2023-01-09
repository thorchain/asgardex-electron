import { ComponentMeta } from '@storybook/react'

import baseMeta from './BaseButton.stories'
import flatMeta from './FlatButton.stories'
import { ReloadButton as Component, Props } from './ReloadButton'

export const ReloadButton = (props: Props) => <Component {...props} />

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/ReloadButton',
  argTypes: {
    color: flatMeta.argTypes?.color ?? {},
    size: baseMeta.argTypes?.size ?? {},
    onClick: {
      action: 'onClicked'
    }
  },
  args: {
    color: flatMeta.args?.color ?? 'primary',
    size: 'normal',
    label: 'Label',
    disabled: false
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen items-center justify-center bg-white">
        <Story />
      </div>
    )
  ]
}

export default meta
