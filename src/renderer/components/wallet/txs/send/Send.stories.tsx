import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'

import { ApiError, ErrorId } from '../../../../services/wallet/types'
import { Send, Props as SendProps } from './Send'
import { SendBnb, Pending as SendBnbPending } from './SendFormBNB.stories'
import { Pending as SendBtcPending } from './SendFormBTC.stories'
import { Pending as SendEthPending } from './SendFormETH.stories'

const defaultProps: SendProps = {
  txRD: RD.initial,
  sendForm: <h1>Send Form</h1>,
  inititalActionHandler: () => console.log('initial action'),
  finishActionHandler: () => console.log('finish action'),
  viewTxHandler: (txHash: string) => {
    console.log(`view tx handler: ${txHash}`)
    return Promise.resolve()
  },
  errorActionHandler: () => console.log('error action')
}

export const Default: Story = () => {
  const props: SendProps = { ...defaultProps, sendForm: <SendBnb /> }
  return <Send {...props} />
}
Default.storyName = 'default - send bnb'

export const Pending: Story = () => {
  const props: SendProps = { ...defaultProps, txRD: RD.pending, sendForm: <SendBnbPending /> }
  return <Send {...props} />
}
Pending.storyName = 'pending - send bnb'

export const PendingBTC: Story = () => {
  const props: SendProps = { ...defaultProps, txRD: RD.pending, sendForm: <SendBtcPending /> }
  return <Send {...props} />
}
PendingBTC.storyName = 'pending - send btc'

export const PendingETH: Story = () => {
  const props: SendProps = { ...defaultProps, txRD: RD.pending, sendForm: <SendEthPending /> }
  return <Send {...props} />
}
PendingETH.storyName = 'pending - send eth'

export const Error: Story = () => {
  const props: SendProps = {
    ...defaultProps,
    txRD: RD.failure<ApiError>({ errorId: ErrorId.SEND_TX, msg: 'Sending tx failed' }),
    sendForm: <SendBnb />
  }
  return <Send {...props} />
}
Error.storyName = 'error'

export const Success: Story = () => {
  const props: SendProps = {
    ...defaultProps,
    txRD: RD.success('0xabc123'),
    sendForm: <SendBnb />
  }
  return <Send {...props} />
}
Success.storyName = 'success'

const meta: Meta = {
  component: Send,
  title: 'Wallet/Send'
}

export default meta
