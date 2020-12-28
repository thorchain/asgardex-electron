import React from 'react'

import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase, bn } from '@xchainjs/xchain-util'

import { TxStatus, TxTypes } from '../../../types/asgardex'
import { SwapModal } from './SwapModal'

const txStatus: TxStatus = {
  modal: true,
  value: 25,
  status: true,
  type: TxTypes.SWAP,
  startTime: Date.now(),
  hash: 'FCA7F45C74278F819757DC00AB5289E1192F9EA31A6C31B0B300CFCDC7C70B64'
}
const slip = bn(0.01645550108862126)

const price = assetToBase(assetAmount(5))

export const StorySuccess: Story = () => (
  <SwapModal
    slip={slip}
    isCompleted={false}
    swapSourceAsset={AssetRuneNative}
    amountToSwapInSelectedPriceAsset={price}
    swapResultByBasePriceAsset={price}
    swapTargetAsset={AssetBNB}
    txStatus={txStatus}
    maxSec={1}
  />
)
StorySuccess.storyName = 'success'

export const StoryCompleted: Story = () => (
  <SwapModal
    slip={slip}
    isCompleted={true}
    swapSourceAsset={AssetRuneNative}
    amountToSwapInSelectedPriceAsset={price}
    swapResultByBasePriceAsset={price}
    swapTargetAsset={AssetBNB}
    txStatus={txStatus}
    maxSec={1}
  />
)
StoryCompleted.storyName = 'completed'

const meta: Meta = {
  component: SwapModal,
  title: 'Components/SwapModal',
  decorators: [
    (S: Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta
