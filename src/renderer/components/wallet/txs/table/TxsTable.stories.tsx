import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { Tx, TxType } from '@xchainjs/xchain-client'
import { assetAmount, AssetBNB, assetToBase, BNBChain } from '@xchainjs/xchain-util'

import { TxsTable } from './TxsTable'

const tx: Tx = {
  asset: AssetBNB,
  from: [{ from: 'tbnb138u9djee6fwphhd2a3628q2h0j5w97yx48zqex', amount: assetToBase(assetAmount('200', 8)) }],
  // always a single amount to a single address only
  to: [{ to: 'tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa', amount: assetToBase(assetAmount('200', 8)) }],
  date: new Date('2020-07-03T11:58:01.553Z'),
  type: TxType.Transfer,
  hash: '82DA59ED714D83B10D41DD8F45DEC2E29679112F12F8EED3E3618EBBA94D48F2'
}

const txsRD = RD.success({
  total: 1,
  txs: [tx]
})

export const Default: Story = () => (
  <TxsTable
    walletAddress="bnb-address"
    txsPageRD={txsRD}
    clickTxLinkHandler={(txHash: string) => console.log('txHash ', txHash)}
    changePaginationHandler={(page: number) => console.log('page:', page)}
    network="testnet"
    chain={BNBChain}
    reloadHandler={() => console.log('reload ')}
  />
)
Default.storyName = 'default'

const meta: Meta = {
  component: TxsTable,
  title: 'Wallet/TxsTable'
}

export default meta
