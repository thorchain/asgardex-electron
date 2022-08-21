import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Meta, StoryFn } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import { Row } from 'antd'
import * as O from 'fp-ts/lib/Option'

import { ErrorId } from '../../../services/wallet/types'
import { Button, ViewTxButton } from '../../uielements/button'
import { Label } from '../../uielements/label'
import { TxModal } from './TxModal'

const onClose = () => console.log('onClose')
const onFinish = () => console.log('onFinish')
const _onViewTxClick = (txHash: TxHash) => console.log('txHash', txHash)

export const StoryInitial: StoryFn = () => (
  <TxModal title="intial" txRD={RD.initial} onClose={onClose} onFinish={onFinish} />
)
StoryInitial.storyName = 'initial'

export const StoryPending: StoryFn = () => (
  <TxModal title="pending" startTime={Date.now()} txRD={RD.pending} onClose={onClose} onFinish={onFinish} />
)
StoryPending.storyName = 'pending'

export const StoryPendingTxHash: StoryFn = () => (
  <TxModal title="pending" startTime={Date.now()} txRD={RD.pending} onClose={onClose} onFinish={onFinish} />
)
StoryPendingTxHash.storyName = 'pending + txHash'

export const StorySuccess: StoryFn = () => (
  <TxModal title="success" txRD={RD.success(true)} onClose={onClose} onFinish={onFinish} />
)
StorySuccess.storyName = 'success'

export const StoryFailure: StoryFn = () => (
  <TxModal
    title="error"
    startTime={Date.now()}
    txRD={RD.failure({ errorId: ErrorId.SEND_TX, msg: 'something went wrong' })}
    onClose={onClose}
    onFinish={onFinish}
  />
)
StoryFailure.storyName = 'failure'

const extraContent = (): JSX.Element => (
  <Row align="middle" justify="center">
    <Label align="center" color="warning" textTransform="uppercase">
      Extra Content
    </Label>
    <Button onClick={() => console.log('extra button clicked')} typevalue="outline" color="warning">
      <SyncOutlined />
      Extra Button
    </Button>
  </Row>
)

const extraResult = (): JSX.Element => (
  <ViewTxButton
    txHash={O.some('hash')}
    onClick={(txHash: TxHash) => console.log('txHash', txHash)}
    txUrl={O.some(`http://txurl.example`)}
  />
)

export const StoryExtra: StoryFn = () => (
  <TxModal title="success" txRD={RD.success(true)} onClose={onClose} onFinish={onFinish} extra={extraContent()} />
)
StoryExtra.storyName = 'success + extra content'

export const StoryExtraResult: StoryFn = () => (
  <TxModal
    title="success"
    txRD={RD.success(true)}
    onClose={onClose}
    onFinish={onFinish}
    extra={extraContent()}
    extraResult={extraResult()}
  />
)
StoryExtraResult.storyName = 'success + extra content + extra result'

const meta: Meta = {
  component: TxModal,
  title: 'Components/modal/TxModal',
  decorators: [
    (S) => (
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
