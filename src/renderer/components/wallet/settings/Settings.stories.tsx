import React from 'react'

import { storiesOf } from '@storybook/react'
import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

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
      addLedgerAddress={(chain: Chain) => console.log(`removeLedgerAddress ${chain}`)}
      removeLedgerAddress={(chain: Chain) => console.log(`addLedgerAddress ${chain}`)}
      runeNativeAddress={'runeNativeAddress'}
      clickAddressLinkHandler={(chain: Chain, address: Address) =>
        console.log('click address link handler', chain, address)
      }
      walletAccounts={O.none}
      phrase={O.none}
      ClientSettingsView={() => <div>ClientSettingsView</div>}
    />
  )
})
