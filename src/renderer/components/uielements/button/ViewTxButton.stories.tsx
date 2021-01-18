import React from 'react'

import { Story, Meta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import * as O from 'fp-ts/lib/Option'

import { ViewTxButton } from './ViewTxButton'

const onClick = (txHash: TxHash) => console.log('txHash', txHash)

export const Default: Story = () => <ViewTxButton txHash={O.some('hash')} onClick={onClick} />
Default.storyName = 'default'

export const Label: Story = () => <ViewTxButton label="click me" txHash={O.some('hash')} onClick={onClick} />
Label.storyName = 'label'

export const Disabled: Story = () => <ViewTxButton txHash={O.none} onClick={onClick} />
Disabled.storyName = 'disabled'

const meta: Meta = {
  component: ViewTxButton,
  title: 'Components/button/ViewTxButton',
  decorators: [
    (S: Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          alignItems: 'center'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta
