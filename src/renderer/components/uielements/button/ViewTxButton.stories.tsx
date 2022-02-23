import React from 'react'

import { Story, Meta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as P from 'fp-ts/lib/Predicate'
import * as S from 'fp-ts/lib/string'

import { ViewTxButton } from './ViewTxButton'

const onClick = (txHash: TxHash) => console.log('txHash', txHash)

type Args = {
  label: string
  txUrl: string
  hasTxHash: boolean
}

const Template: Story<Args> = ({ label, hasTxHash, txUrl }) => {
  const url: O.Option<string> = FP.pipe(txUrl, O.fromPredicate(P.not(S.isEmpty)))
  const txHash: O.Option<TxHash> = hasTxHash ? O.some('hash') : O.none
  return <ViewTxButton label={label} txHash={txHash} onClick={onClick} txUrl={url} />
}

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
    },
    txUrl: {
      name: 'Tx URL',
      control: {
        type: 'text'
      },
      defaultValue: 'http://example.url'
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
