import * as RD from '@devexperts/remote-data-ts'
import { useCallback, useState } from '@storybook/addons'
import { ComponentMeta, StoryFn } from '@storybook/react'
import { Address } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

import { AddressValidation } from '../../services/clients'
import { NodeStatusEnum } from '../../types/generated/thornode'
import { Bonds as Component } from './Bonds'

const mockNodeInfo = (address: Address) => ({
  bond: baseAmount(100000000 * 40000000),
  award: baseAmount(100000000 * 400000),
  status: NodeStatusEnum.Active,
  address
})
const addressValidation: AddressValidation = (_) => true

export const Default: StoryFn = () => {
  const [nodesList, setNodesList] = useState<Address[]>([])

  const removeNode = useCallback(
    (node: Address) => {
      setNodesList(nodesList.filter((current) => current !== node))
    },
    [nodesList, setNodesList]
  )
  const addNode = useCallback((node: string) => setNodesList([...nodesList, node]), [nodesList, setNodesList])

  return (
    <Component
      addressValidation={addressValidation}
      network={'testnet'}
      addNode={addNode}
      removeNode={removeNode}
      goToNode={(node) => console.log('go to ', node)}
      reloadNodeInfos={() => console.log('reloadNodeInfos')}
      nodes={RD.success(nodesList.map((address) => mockNodeInfo(address)))}
    />
  )
}

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Bonds/Bonds'
}

export default meta
