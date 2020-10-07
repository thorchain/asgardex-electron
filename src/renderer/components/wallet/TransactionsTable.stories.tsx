import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { AssetTx } from '../../services/wallet/types'
import TransactionsTable from './TransactionsTable'

storiesOf('Wallet/TransactionsTable', module).add('default', () => {
  const tx: AssetTx = {
    asset: O.some(AssetBNB),
    from: [{ from: 'tbnb138u9djee6fwphhd2a3628q2h0j5w97yx48zqex' }],
    // always a single amount to a single address only
    to: [{ to: 'tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa', amount: assetToBase(assetAmount('200', 8)) }],
    date: new Date('2020-07-03T11:58:01.553Z'),
    type: 'transfer',
    hash: '82DA59ED714D83B10D41DD8F45DEC2E29679112F12F8EED3E3618EBBA94D48F2'
  }

  const txsRD = RD.success({
    total: 1,
    txs: [tx]
  })

  return (
    <TransactionsTable
      txsPageRD={txsRD}
      clickTxLinkHandler={(txHash: string) => console.log('txHash ', txHash)}
      changePaginationHandler={(page: number) => console.log('page:', page)}
    />
  )
})
