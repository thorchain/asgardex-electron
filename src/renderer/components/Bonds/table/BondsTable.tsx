import React, { useMemo, useState } from 'react'

import { ColumnType } from 'antd/lib/table'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ValidatePasswordLD } from '../../../services/wallet/types'
import { PasswordModal } from '../../modal/password'
import * as Styled from './BondsTable.styles'
import * as H from './helpers'
import { Node } from './types'

type Props = {
  nodes: Node[]
  removeNode: (node: string) => void
  validatePassword$: (_: string) => ValidatePasswordLD
  goToNode: (node: string) => void
  network: Network
}

export const BondsTable: React.FC<Props> = ({ nodes, removeNode, validatePassword$, network, goToNode }) => {
  const intl = useIntl()

  const nodeColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'node',
      render: (_, { nodeAddress }) => <H.NodeAddress network={network} address={nodeAddress} />,
      title: intl.formatMessage({ id: 'bonds.node' }),
      align: 'left'
    }),
    [network, intl]
  )

  const bondColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'bond',
      title: intl.formatMessage({ id: 'bonds.bond' }),
      render: (_, { data }) => <H.BondValue data={data} />,
      width: 140,
      align: 'left'
    }),
    [intl]
  )

  const awardColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'award',
      title: intl.formatMessage({ id: 'bonds.award' }),
      align: 'left',
      render: (_, { data }) => <H.AwardValue data={data} />
    }),
    [intl]
  )
  const statusColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'Status',
      title: intl.formatMessage({ id: 'bonds.status' }),
      render: (_, { data }) => <H.Status data={data} />,
      responsive: ['sm'],
      align: 'left'
    }),
    [intl]
  )
  const infoColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'info',
      title: 'THORChain.net',
      render: (_, { nodeAddress }) => <H.Info goToNode={() => goToNode(nodeAddress)} />,
      responsive: ['md'],
      align: 'center'
    }),
    [goToNode]
  )

  const [nodeToRemove, setNodeToRemove] = useState<string | null>(null)

  const removeColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'remove',
      title: '',
      render: (_, { nodeAddress }) => <H.Delete deleteNode={() => setNodeToRemove(nodeAddress)} />,
      align: 'right'
    }),
    [setNodeToRemove]
  )

  return (
    <>
      <Styled.Table
        columns={[nodeColumn, bondColumn, awardColumn, statusColumn, infoColumn, removeColumn]}
        dataSource={nodes.map((node) => ({ ...node, key: node.nodeAddress }))}
      />
      {nodeToRemove && (
        <PasswordModal
          onClose={() => setNodeToRemove(null)}
          onSuccess={() => {
            removeNode(nodeToRemove)
            setNodeToRemove(null)
          }}
          validatePassword$={validatePassword$}
        />
      )}
    </>
  )
}
