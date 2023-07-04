import React, { useCallback, useState } from 'react'

import { Meta, Story } from '@storybook/react'
import { Address, baseAmount } from '@xchainjs/xchain-util'

import { BondsTable } from './BondsTable'

const mockNodeInfo = (address: Address) => ({
  bond: baseAmount(100000000 * 40000000),
  award: baseAmount(100000000 * 400000),
  status: 'Active',
  address
})

export const Default: Story = () => {
  // const nodesSelect: Record<Address, RDStatus> = {
  //   thor1766mazrxs5asuscepa227r6ekr657234f8p7nf: firstNodeRdKnob,
  //   thor1766mazrxs5asuscepa227r6ekr657234f9asda: secondNodeRdKnob,
  //   thor1766mazrxs5asuscepa227r6ekr657234fkswjh: thirdNodeRdKnob
  // }

  const [nodesList, setNodesList] = useState<Address[]>([
    'thor1766mazrxs5asuscepa227r6ekr657234f8p7nf',
    'thor1766mazrxs5asuscepa227r6ekr657234f9asda',
    'thor1766mazrxs5asuscepa227r6ekr657234fkswjh'
  ])

  const removeNode = useCallback(
    (node: Address) => {
      setNodesList(nodesList.filter((current) => current !== node))
    },
    [nodesList, setNodesList]
  )

  return (
    <BondsTable
      network={'testnet'}
      removeNode={removeNode}
      goToNode={(node) => console.log('go to ', node)}
      nodes={nodesList.map((address) => mockNodeInfo(address))}
    />
  )
}
Default.storyName = 'default'

const meta: Meta = {
  component: BondsTable,
  title: 'Bonds/BondsTable'
}

export default meta
