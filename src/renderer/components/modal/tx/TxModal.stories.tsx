import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { AssetRune67C } from '@xchainjs/xchain-util'

import { TxModal } from './TxModal'

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

const startTime = Date.now()

export const Story1 = () => <TxModal asset={AssetRune67C} startTime={startTime} txRD={RD.initial} />
Story1.storyName = 'RUNE'
