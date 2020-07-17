import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import TransactionsTable from './TransactionsTable'

storiesOf('Wallet/TransactionsTable', module).add('default', () => {
  const address = 'tbnb13egw96d95lldrhwu56dttrpn2fth6cs0axzaad'
  const txsRD = RD.success([])
  const oAddress = O.some(address)
  return (
    <TransactionsTable
      txsRD={txsRD}
      address={oAddress}
      asset={O.some(ASSETS_TESTNET.RUNE)}
      clickTxLinkHandler={(txHash: string) => console.log('txHash ', txHash)}
    />
  )
})
