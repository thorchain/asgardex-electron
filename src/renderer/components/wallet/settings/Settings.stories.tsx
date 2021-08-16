import React from 'react'

import { storiesOf } from '@storybook/react'

import { Settings } from './index'

storiesOf('Wallet/Settings', module).add('default', () => {
  return <Settings selectedNetwork={'testnet'} ClientSettingsView={() => <div>ClientSettingsView</div>} />
})
