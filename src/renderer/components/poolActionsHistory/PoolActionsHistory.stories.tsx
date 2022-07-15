import { useMemo, useState } from 'react'

import { ComponentMeta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import { assetAmount, AssetBNB, AssetBTC, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { getMockRDValueFactory, RDStatus, rdStatusOptions } from '../../../shared/mock/rdByStatus'
import { MOCK_WALLET_ADDRESSES } from '../../../shared/mock/wallet'
import { WalletAddress } from '../../../shared/wallet/types'
import { Actions } from '../../services/midgard/types'
import { ErrorId } from '../../services/wallet/types'
import { PoolActionsHistory } from './PoolActionsHistory'
import { Filter } from './types'
import { WalletPoolActionsHistoryHeader } from './WalletPoolActionsHistoryHeader'

const actions: Actions = [
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

const Template = ({ dataStatus }: { dataStatus: RDStatus }) => {
  const res = useMemo(() => getResults(dataStatus), [dataStatus])
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<Filter>('ALL')
  const HeaderContent = (
    <WalletPoolActionsHistoryHeader
      addresses={MOCK_WALLET_ADDRESSES}
      selectedAddress={O.none}
      network="testnet"
      availableFilters={['ALL', 'SWITCH', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']}
      currentFilter={filter}
      setFilter={setFilter}
      onWalletAddressChanged={(address: WalletAddress) => {
        console.log('selected address', address)
      }}
      onClickAddressIcon={() => {
        console.log('on click address icon')
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
      reloadHistory={() => console.log(`reloadHistory`)}
      historyPageRD={res}
      changePaginationHandler={setCurrentPage}
      currentPage={currentPage}
      network="testnet"
    />
  )
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/PoolActionsHistory',
  argTypes,
  args: {
    dataStatus: argTypes.dataStatus.control.options[0]
  }
}
export default meta
