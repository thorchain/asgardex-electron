import { useMemo, useState } from 'react'

import { Story } from '@storybook/react'
import { assetAmount, AssetBNB, AssetBTC, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { getMockRDValueFactory, RDStatus, rdStatusOptions } from '../../../shared/mock/rdByStatus'
import { PoolActions } from '../../services/midgard/types'
import { ErrorId } from '../../services/wallet/types'
import { PoolActionsHistory } from './PoolActionsHistory'
import { Filter } from './types'

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

export const History: Story<{ dataStatus: RDStatus }> = ({ dataStatus }) => {
  const res = useMemo(() => getResults(dataStatus), [dataStatus])
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<Filter>('ALL')
  return (
    <PoolActionsHistory
      reload={() => console.log('reload')}
      currentFilter={filter}
      setFilter={setFilter}
      goToTx={console.log}
      actionsPageRD={res}
      changePaginationHandler={setCurrentPage}
      currentPage={currentPage}
      clickTxLinkHandler={console.log}
    />
  )
}

History.args = {
  dataStatus: argTypes.dataStatus.control.options[0]
}

export default {
  component: PoolActionsHistory,
  title: 'PoolActionsHistory',
  argTypes
}
