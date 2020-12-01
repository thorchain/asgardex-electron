import React from 'react'

import { storiesOf } from '@storybook/react'
import { Chain } from '@xchainjs/xchain-util'
import { some } from 'fp-ts/lib/Option'

import { Network } from '../../../../shared/api/types'
import { BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { LedgerAddressParams } from '../../../services/chain/types'
import { Settings } from './index'

storiesOf('Wallet/Settings', module).add('default', () => {
  return (
    <Settings
      selectedNetwork={'testnet'}
      changeNetwork={(n: Network) => console.log('change network ', n)}
      clientUrl={some(BNB_ADDRESS_TESTNET)}
      lockWallet={() => console.log('lock')}
      removeKeystore={() => console.log('removeKeystore')}
      retrieveLedgerAddress={({ chain, network }: LedgerAddressParams) =>
        console.log('retrieve ledger address: ', chain, network)
      }
      removeLedgerAddress={(chain: Chain) => console.log('remove ledger address: ', chain)}
      removeAllLedgerAddress={() => console.log('reset all ledger address')}
    />
  )
})
