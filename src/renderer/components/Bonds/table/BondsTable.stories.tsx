import React, { useCallback, useState } from 'react'

import { withKnobs, select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import { baseAmount } from '@xchainjs/xchain-util'

import { getMockRDValueFactory, RDStatus } from '../../../../shared/mock/rdByStatus'
import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { ApiError, ErrorId } from '../../../services/wallet/types'
import { BondsTable } from './BondsTable'
import { NodeInfo } from './types'

const getMockRDValue = getMockRDValueFactory<ApiError, NodeInfo>(
  () => ({
    bond: baseAmount(100000000 * 40000000),
    award: baseAmount(100000000 * 400000),
    status: 'active'
  }),
  () => ({
    msg: 'error message',
    errorId: ErrorId.GET_NODE_INFO
  })
)

export const Default: Story = () => {
  const firstNodeRdKnob: RDStatus = select(
    'first node',
    {
      initial: 'initial',
      pending: 'pending',
      error: 'error',
      success: 'success'
    },
    'initial'
  )

  const secondNodeRdKnob: RDStatus = select(
    'second node',
    {
      initial: 'initial',
      pending: 'pending',
      error: 'error',
      success: 'success'
    },
    'initial'
  )

  const thirdNodeRdKnob: RDStatus = select(
    'third node',
    {
      initial: 'initial',
      pending: 'pending',
      error: 'error',
      success: 'success'
    },
    'success'
  )

  const nodesSelect: Record<string, RDStatus> = {
    thor1766mazrxs5asuscepa227r6ekr657234f8p7nf: firstNodeRdKnob,
    thor1766mazrxs5asuscepa227r6ekr657234f9asda: secondNodeRdKnob,
    thor1766mazrxs5asuscepa227r6ekr657234fkswjh: thirdNodeRdKnob
  }
  const [nodesList, setNodesList] = useState<string[]>([
    'thor1766mazrxs5asuscepa227r6ekr657234f8p7nf',
    'thor1766mazrxs5asuscepa227r6ekr657234f9asda',
    'thor1766mazrxs5asuscepa227r6ekr657234fkswjh'
  ])

  const removeNode = useCallback(
    (node: string) => {
      setNodesList(nodesList.filter((current) => current !== node))
    },
    [nodesList, setNodesList]
  )

  return (
    <BondsTable
      network={'testnet'}
      validatePassword$={mockValidatePassword$}
      removeNode={removeNode}
      goToNode={(node) => console.log('go to ', node)}
      nodes={nodesList
        .filter((node) => !!nodesSelect[node])
        .map((node) => ({
          nodeAddress: node,
          data: getMockRDValue(nodesSelect[node])
        }))}
    />
  )
}
Default.storyName = 'default'

const meta: Meta = {
  component: BondsTable,
  title: 'Bonds/BondsTable',
  decorators: [withKnobs]
}

export default meta
