import { useMemo, useState } from 'react'

import { Story } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import {
  BTCChain,
  assetAmount,
  AssetBNB,
  AssetBTC,
  AssetRuneNative,
  assetToBase,
  BCHChain,
  BNBChain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { getMockRDValueFactory, RDStatus, rdStatusOptions } from '../../../shared/mock/rdByStatus'
import { WalletAddress, WalletAddresses } from '../../../shared/wallet/types'
import { PoolActions } from '../../services/midgard/types'
import { ErrorId } from '../../services/wallet/types'
import { PoolActionsHistory } from './PoolActionsHistory'
import { Filter } from './types'
import { WalletPoolActionsHistoryHeader } from './WalletPoolActionsHistoryHeader'

const actions: PoolActions = [
  {
    date: new Date(Date.now()),
    /**
     * Inbound transactions related to the action
     */
    in: [
      {
        address: 'string',
        values: [
          { asset: AssetRuneNative, amount: assetToBase(assetAmount(1155.241231)) },
          { asset: AssetBNB, amount: assetToBase(assetAmount(15522.2312)) }
        ],
        memo: 'string',
        /**
         * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
         */
        txID: 'in id'
      }
    ],
    out: [
      {
        address: 'string',
        values: [
          { asset: AssetBTC, amount: assetToBase(assetAmount(101.2412)) },
          { asset: AssetBNB, amount: assetToBase(assetAmount(120.232)) }
        ],
        memo: 'string',
        /**
         * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
         */
        txID: 'out id'
      }
    ],
    type: 'DEPOSIT',
    slip: 0.3,
    fees: [{ asset: AssetRuneNative, amount: assetToBase(assetAmount(1.234)) }]
  },
  {
    date: new Date(Date.now() + 1),
    /**
     * Inbound transactions related to the action
     */
    in: [
      {
        address: 'string',
        values: [{ asset: AssetRuneNative, amount: assetToBase(assetAmount(12.3)) }],
        memo: 'string',
        /**
         * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
         */
        txID: 'in id'
      }
    ],
    out: [
      {
        address: 'string',
        values: [{ asset: AssetBNB, amount: assetToBase(assetAmount(12.23)) }],
        memo: 'string',
        /**
         * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
         */
        txID: 'out id'
      }
    ],
    type: 'SWAP'
  },
  {
    date: new Date(Date.now() + 2),
    /**
     * Inbound transactions related to the action
     */
    in: [],
    out: [
      {
        address: 'string',
        values: [{ asset: AssetRuneNative, amount: assetToBase(assetAmount(1)) }],
        memo: 'string',
        /**
         * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
         */
        txID: 'out id'
      }
    ],
    type: 'SWAP'
  },
  {
    date: new Date(Date.now() + 1000),
    /**
     * Inbound transactions related to the action
     */
    in: [],
    out: [
      {
        address: 'string',
        values: [
          { asset: AssetRuneNative, amount: assetToBase(assetAmount(12.3)) },
          { asset: AssetBNB, amount: assetToBase(assetAmount(2.34)) }
        ],
        memo: 'string',
        /**
         * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
         */
        txID: 'out id'
      }
    ],
    type: 'SWAP'
  }
]

const argTypes = {
  dataStatus: {
    control: {
      type: 'select',
      options: rdStatusOptions
    }
  }
}

const getResults = getMockRDValueFactory(
  () => ({
    total: 100,
    actions
  }),
  () => ({ errorId: ErrorId.GET_ACTIONS, msg: 'some error here' })
)

const addresses: WalletAddresses = [
  {
    address: 'tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa',
    type: 'ledger',
    chain: BNBChain
  },
  {
    address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
    type: 'ledger',
    chain: THORChain
  },
  {
    address: '0x33292c1d02c432d323fb62c57fb327da45e1bdde',
    type: 'keystore',
    chain: ETHChain
  },
  {
    address: 'tb1qtephp596jhpwrawlp67junuk347zl2cwc56xml',
    type: 'keystore',
    chain: BTCChain
  },
  {
    address: 'qr20g55jd7x3dalp4qxjfgfvda0nwr8cfccrgxd0dw',
    type: 'keystore',
    chain: BCHChain
  },
  {
    address: 'tltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk',
    type: 'keystore',
    chain: LTCChain
  }
]

export const History: Story<{ dataStatus: RDStatus }> = ({ dataStatus }) => {
  const res = useMemo(() => getResults(dataStatus), [dataStatus])
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<Filter>('ALL')
  const HeaderContent = (
    <WalletPoolActionsHistoryHeader
      addresses={addresses}
      selectedAddress={O.none}
      network="testnet"
      availableFilters={['ALL', 'SWITCH', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']}
      currentFilter={filter}
      setFilter={setFilter}
      onWalletAddressChanged={(address: WalletAddress) => {
        console.log('selected address', address)
      }}
      openViewblockUrl={() => {
        console.log('open viewblock')
        return Promise.resolve(true)
      }}
    />
  )

  return (
    <PoolActionsHistory
      headerContent={HeaderContent}
      openExplorerTxUrl={(txHash: TxHash) => {
        console.log(`Open explorer - tx hash ${txHash}`)
        return Promise.resolve(true)
      }}
      actionsPageRD={res}
      changePaginationHandler={setCurrentPage}
      currentPage={currentPage}
    />
  )
}

History.args = {
  dataStatus: argTypes.dataStatus.control.options[0]
}

export default {
  component: PoolActionsHistory,
  title: 'Components/PoolActionsHistory',
  argTypes
}
