import React from 'react'

import { Meta, Story } from '@storybook/react'

import { AppUpdate } from './AppUpdate'

export const Default: Story<{ isOpen: boolean; goToUpdates: () => void; close: () => void }> = ({
  isOpen,
  close,
  goToUpdates
}) => {
  return <AppUpdate isOpen={isOpen} goToUpdates={goToUpdates} close={close} version={'test version'} />
}

const argTypes = {
  isOpen: {
    control: {
      type: 'boolean'
    }
  },
  goToUpdates: {
    action: 'goToUpdates'
  },
  close: {
    action: 'close'
  }
}

Default.args = { isOpen: true }

const meta: Meta = {
  title: 'AppUpdate',
  argTypes
}

export default meta
