import React from 'react'

import { storiesOf } from '@storybook/react'
import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { Settings } from './index'

storiesOf('Wallet/Settings', module).add('default', () => {
  return (
    <Settings
      validatePassword$={mockValidatePassword$}
      selectedNetwork={'testnet'}
      lockWallet={() => console.log('lock')}
      removeKeystore={() => console.log('removeKeystore')}
      exportKeystore={() => console.log('exportKeystore')}
      runeNativeAddress={'runeNativeAddress'}
      clickAddressLinkHandler={(chain: Chain, address: Address) =>
        console.log('click address link handler', chain, address)
      }
      ClientSettingsView={() => <div>ClientSettingsView</div>}
    />
  )
})
