import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Tx } from '@thorchain/asgardex-binance'
import * as O from 'fp-ts/lib/Option'

import TransactionsTable from './TransactionsTable'

storiesOf('Wallet/TransactionsTable', module).add('default', () => {
  const address = 'tbnb13egw96d95lldrhwu56dttrpn2fth6cs0axzaad'
  const oAddress = O.some(address)

  const tx: Tx = {
    blockHeight: 91158744,
    code: 0,
    confirmBlocks: 0,
    data: null,
    fromAddr: 'tbnb138u9djee6fwphhd2a3628q2h0j5w97yx48zqex',
    memo: '',
    orderId: null,
    proposalId: null,
    sequence: 49797,
    source: 0,
    timeStamp: '2020-07-03T11:58:01.553Z',
    toAddr: 'tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa',
    txAge: 1202432,
    txAsset: 'BNB',
    txFee: '0.00037500',
    txHash: '82DA59ED714D83B10D41DD8F45DEC2E29679112F12F8EED3E3618EBBA94D48F2',
    txType: 'TRANSFER',
    value: '200.00000000'
  }

  const txsRD = RD.success([tx])

  return (
    <TransactionsTable
      txsRD={txsRD}
      address={oAddress}
      clickTxLinkHandler={(txHash: string) => console.log('txHash ', txHash)}
    />
  )
})
