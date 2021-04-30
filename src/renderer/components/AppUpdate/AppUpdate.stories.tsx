import React from 'react'

import { Meta, Story } from '@storybook/react'

import { AppUpdate } from './AppUpdate'

export const Default: Story<{ type: 'success' | 'fail'; goToUpdates: () => void; close: () => void }> = ({
  type,
  close,
  goToUpdates
}) => {
  if (type === 'success') {
    return <AppUpdate isOpen={true} type={type} goToUpdates={goToUpdates} close={close} version={'test version'} />
  }

  return <AppUpdate isOpen={true} type={type} close={close} message={'error message'} />
}

const argTypes = {
  type: {
    control: {
      type: 'select',
      options: ['success', 'fail'] as const
    }
  },
  goToUpdates: {
    action: 'goToUpdates'
  },
  close: {
    action: 'close'
  }
}

Default.args = { type: argTypes.type.control.options[0] }

const meta: Meta = {
  title: 'AppUpdate',
  argTypes
}

export default meta
