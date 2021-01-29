import React, { useMemo, useState } from 'react'

import { ColumnType } from 'antd/lib/table'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ConfirmationModal } from '../../modal/confirmation'
import { Node } from '../types'
import * as Styled from './BondsTable.styles'
import * as H from './helpers'

type Props = {
  nodes: Node[]
  removeNode: (node: string) => void
  goToNode: (node: string) => void
  network: Network
  className?: string
}

export const BondsTable: React.FC<Props> = ({ nodes, removeNode, network, goToNode, className }) => {
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
        className={className}
        columns={[nodeColumn, bondColumn, awardColumn, statusColumn, infoColumn, removeColumn]}
        dataSource={nodes.map((node) => ({ ...node, key: node.nodeAddress }))}
      />
      {nodeToRemove && (
        <ConfirmationModal
          onClose={() => setNodeToRemove(null)}
          onSuccess={() => {
            removeNode(nodeToRemove)
          }}
          message={intl.formatMessage({ id: 'bonds.node.removeMessage' }, { node: nodeToRemove })}
        />
      )}
    </>
  )
}
