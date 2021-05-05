import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import { some } from 'fp-ts/lib/Option'

import { BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { LedgerAddressParams } from '../../../services/chain/types'
import { Settings } from './index'

storiesOf('Wallet/Settings', module).add('default', () => {
  return (
    <Settings
      validatePassword$={mockValidatePassword$}
      selectedNetwork={'testnet'}
      clientUrl={some(BNB_ADDRESS_TESTNET)}
      lockWallet={() => console.log('lock')}
      removeKeystore={() => console.log('removeKeystore')}
      exportKeystore={() => console.log('exportKeystore')}
      runeNativeAddress={'runeNativeAddress'}
      retrieveLedgerAddress={({ chain, network }: LedgerAddressParams) =>
        console.log('retrieve ledger address: ', chain, network)
      }
      removeLedgerAddress={(chain: Chain) => console.log('remove ledger address: ', chain)}
      clickAddressLinkHandler={(chain: Chain, address: Address) =>
        console.log('click address link handler', chain, address)
      }
      appUpdateState={RD.initial}
      checkForUpdates={() => console.log('click checkForUpdates handler')}
      goToReleasePage={() => console.log('click goToReleasePage handler')}
    />
  )
})
