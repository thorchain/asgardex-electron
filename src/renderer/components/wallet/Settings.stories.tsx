import React from 'react'

import { storiesOf } from '@storybook/react'
import { some } from 'fp-ts/lib/Option'

import { WALLET_ADDRESS_TESTNET } from '../../../shared/mock/address'
import { Network } from '../../services/app/types'
import Settings from './Settings'

storiesOf('Wallet/Settings', module).add('default', () => {
  return (
    <Settings
      selectedNetwork={'testnet'}
      changeNetwork={(n: Network) => console.log('change network ', n)}
      clientUrl={some(WALLET_ADDRESS_TESTNET)}
      lockWallet={() => console.log('lock')}
      removeKeystore={() => console.log('removeKeystore')}
    />
  )
})
