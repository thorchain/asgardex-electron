// TODO (@veado) Replace knobs
// import { withKnobs, select } from '@storybook/addon-knobs'
import { useCallback, useState } from '@storybook/addons'
import { ComponentMeta, StoryFn } from '@storybook/react'
import { Address } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

import { getMockRDValueFactory } from '../../../shared/mock/rdByStatus'
import { AddressValidation } from '../../services/clients'
import { NodeInfo } from '../../services/thorchain/types'
import { ApiError, ErrorId } from '../../services/wallet/types'
import { Bonds as Component } from './Bonds'

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

const addressValidation: AddressValidation = (_) => true

export const Default: StoryFn = () => {
  const [nodesList, setNodesList] = useState<Address[]>([])

  // const nodesSelect: Record<Address, RDStatus> = nodesList
  //   .map((node) =>
  //     select(
  //       node,
  //       {
  //         initial: 'initial',
  //         pending: 'pending',
  //         error: 'error',
  //         success: 'success'
  //       },
  //       'pending'
  //     )
  //   )
  //   .reduce((acc, node, index) => ({ ...acc, [index]: node }), {})

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
      nodes={nodesList.map((node, _index) => ({
        nodeAddress: node,
        // data: getMockRDValue(nodesSelect[index])
        data: getMockRDValue()
      }))}
    />
  )
}

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Bonds'
}

export default meta
