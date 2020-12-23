import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'

import { ErrorId } from '../../../services/wallet/types'
import { TxModal } from './TxModal'

const onClose = () => console.log('onClose')
const onViewTxClick = (txHash: TxHash) => console.log('txHash', txHash)

export const StoryInitial: Story = () => <TxModal txRD={RD.initial} onClose={onClose} />
StoryInitial.storyName = 'initial'

export const StoryPending: Story = () => <TxModal startTime={Date.now()} txRD={RD.pending} onClose={onClose} />
StoryPending.storyName = 'pending'

export const StorySuccess: Story = () => (
  <TxModal txRD={RD.success('txhash')} onClose={onClose} onViewTxClick={onViewTxClick} />
)
StorySuccess.storyName = 'success'

export const StoryFailure: Story = () => (
  <TxModal
    startTime={Date.now()}
    txRD={RD.failure({ errorId: ErrorId.SEND_TX, msg: 'something went wrong' })}
    onClose={onClose}
  />
)
StoryFailure.storyName = 'failure'

const meta: Meta = {
  component: TxModal,
  title: 'Components/TxModal',
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
