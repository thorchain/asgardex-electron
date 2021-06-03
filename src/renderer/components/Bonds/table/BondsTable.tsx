import React, { useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { FormattedMessage, useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ConfirmationModal } from '../../modal/confirmation'
import { Node } from '../types'
import * as Styled from './BondsTable.styles'
import * as H from './helpers'

type Props = {
  nodes: Node[]
  removeNode: (node: Address) => void
  goToNode: (node: Address) => void
  network: Network
  className?: string
}

export const BondsTable: React.FC<Props> = ({ nodes, removeNode, network, goToNode, className }) => {
  const intl = useIntl()

  const nodeColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'node',
      width: 200,
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
      align: 'right'
    }),
    [intl]
  )

  const awardColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'award',
      title: intl.formatMessage({ id: 'bonds.award' }),
      align: 'right',
      render: (_, { data }) => <H.AwardValue data={data} />
    }),
    [intl]
  )
  const statusColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'status',
      width: 150,
      title: intl.formatMessage({ id: 'bonds.status' }),
      render: (_, { data }) => <H.Status data={data} />,
      responsive: ['sm'],
      align: 'center'
    }),
    [intl]
  )
  const infoColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'info',
      width: 200,
      title: 'THORChain.net',
      render: (_, { nodeAddress }) => <H.Info goToNode={() => goToNode(nodeAddress)} />,
      responsive: ['md'],
      align: 'center'
    }),
    [goToNode]
  )

  const [nodeToRemove, setNodeToRemove] = useState<O.Option<Address>>(O.none)

  const removeColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'remove',
      width: 40,
      title: '',
      render: (_, { nodeAddress }) => <H.Delete deleteNode={() => setNodeToRemove(O.some(nodeAddress))} />,
      align: 'right'
    }),
    [setNodeToRemove]
  )

  const removeConfirmationProps = useMemo(() => {
    const commonProps = {
      onClose: () => setNodeToRemove(O.none),
      onSuccess: FP.constVoid,
      message: (
        <FormattedMessage
          id="bonds.node.removeMessage"
          defaultMessage="Are you sure you want to delete {node} node?"
          values={{
            node: <Styled.ConfirmationModalWalletText>{nodeToRemove}</Styled.ConfirmationModalWalletText>
          }}
        />
      )
    }
    return {
      ...commonProps,
      ...FP.pipe(
        nodeToRemove,
        O.fold(
          () => ({
            visible: false
          }),
          (node) => ({
            visible: true,
            onSuccess: () => removeNode(node)
          })
        )
      )
    }
  }, [nodeToRemove, removeNode])

  return (
    <>
      <Styled.Table
        className={className}
        columns={[nodeColumn, bondColumn, awardColumn, statusColumn, infoColumn, removeColumn]}
        dataSource={nodes.map((node) => ({ ...node, key: node.nodeAddress }))}
      />
      <ConfirmationModal {...removeConfirmationProps} />
    </>
  )
}
