import { useMemo } from 'react'

import { Story } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { getMockRDValueFactory, RDStatus, rdStatusOptions } from '../../../shared/mock/rdByStatus'
import { HistoryActions } from '../../services/midgard/types'
import { ErrorId } from '../../services/wallet/types'
import { ActionsHistory } from './ActionsHistory'

const actions: HistoryActions = [
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
        txID: 'txid'
      }
    ],
    out: [
      {
        address: 'string',
        values: [
          { asset: AssetBNB, amount: assetToBase(assetAmount(101.2412)) },
          { asset: AssetBNB, amount: assetToBase(assetAmount(120.232)) }
        ],
        memo: 'string',
        /**
         * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
         */
        txID: 'txid'
      }
    ],
    type: 'DEPOSIT',
    slip: 0.3,
    fees: [{ asset: AssetRuneNative, amount: assetToBase(assetAmount(1.234)) }]
  },
  {
    date: new Date(Date.now()),
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
        txID: 'txid'
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
        txID: 'txid'
      }
    ],
    type: 'DOUBLE_SWAP'
  },
  {
    date: new Date(Date.now()),
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
        txID: 'txid'
      }
    ],
    type: 'SWAP'
  },
  {
    date: new Date(Date.now()),
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
        txID: 'txid'
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

export const Table: Story<{ dataStatus: RDStatus }> = ({ dataStatus }) => {
  const res = useMemo(() => getResults(dataStatus), [dataStatus])
  return (
    <ActionsHistory
      goToTx={console.log}
      actionsPageRD={res}
      changePaginationHandler={console.log}
      clickTxLinkHandler={console.log}
    />
  )
}

Table.args = {
  dataStatus: argTypes.dataStatus.control.options[0]
}

export default {
  component: ActionsHistory,
  title: 'ActionsHistory',
  argTypes
}
