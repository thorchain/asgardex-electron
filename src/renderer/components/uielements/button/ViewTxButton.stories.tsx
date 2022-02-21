import React from 'react'

import { Story, Meta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import * as O from 'fp-ts/lib/Option'

import { GetExplorerTxUrl } from '../../../services/clients'
import { ViewTxButton } from './ViewTxButton'

const onClick = (txHash: TxHash) => console.log('txHash', txHash)

const getExplorerTxUrl: GetExplorerTxUrl = (txHash: TxHash) => O.some(`url/asset-${txHash}`)

type Args = {
  label: string
  hasTxHash: boolean
}

const Template: Story<Args> = ({ label, hasTxHash }) => (
  <ViewTxButton
    label={label}
    txHash={hasTxHash ? O.some('hash') : O.none}
    onClick={onClick}
    getExplorerTxUrl={getExplorerTxUrl}
  />
)

export const Default = Template.bind({})

const meta: Meta<Args> = {
  component: ViewTxButton,
  title: 'Components/button/ViewTxButton',
  argTypes: {
    hasTxHash: {
      name: 'Has tx hash',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    label: {
      name: 'Label',
      control: {
        type: 'text'
      },
      defaultValue: 'See Transaction'
    }
  },
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
