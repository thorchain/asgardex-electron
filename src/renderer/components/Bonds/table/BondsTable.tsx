import React, { useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { FormattedMessage, useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ConfirmationModal } from '../../modal/confirmation'
import { ExternalLinkIcon } from '../../uielements/common/Common.styles'
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
      render: (_, { nodeAddress }) => <H.NodeAddress network={network} address={nodeAddress} />,
      title: intl.formatMessage({ id: 'bonds.node' }),
      align: 'left'
    }),
    [network, intl]
  )

  const bondColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'bond',
      width: 150,
      title: intl.formatMessage({ id: 'bonds.bond' }),
      render: (_, { data }) => <H.BondValue data={data} />,
      align: 'right'
    }),
    [intl]
  )

  const awardColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'award',
      width: 150,
      title: intl.formatMessage({ id: 'bonds.award' }),
      align: 'right',
      render: (_, { data }) => <H.AwardValue data={data} />
    }),
    [intl]
  )
  const statusColumn: ColumnType<Node> = useMemo(
    () => ({
      key: 'status',
      width: 100,
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
      width: 40,
      title: '',
      render: (_, { nodeAddress }) => <ExternalLinkIcon onClick={() => goToNode(nodeAddress)} />,
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
      render: (_, { nodeAddress }) => (
        <H.Delete
          deleteNode={() => {
            setNodeToRemove(O.some(nodeAddress))
          }}
        />
      ),
      align: 'right'
    }),
    [setNodeToRemove]
  )

  const removeConfirmationProps = useMemo(() => {
    const nodeAddress = FP.pipe(
      nodeToRemove,
      O.getOrElse(() => '')
    )

    return {
      onClose: () => setNodeToRemove(O.none),
      onSuccess: () => removeNode(nodeAddress),
      content: (
        <Styled.ConfirmationModalText>
          <FormattedMessage
            id="bonds.node.removeMessage"
            values={{
              node: <Styled.ConfirmationModalAddress>{nodeAddress}</Styled.ConfirmationModalAddress>
            }}
          />
        </Styled.ConfirmationModalText>
      ),
      visible: !!nodeAddress
    }
  }, [nodeToRemove, removeNode])

  return (
    <>
      <Styled.Table
        className={className}
        columns={[removeColumn, nodeColumn, bondColumn, awardColumn, statusColumn, infoColumn]}
        dataSource={nodes.map((node) => ({ ...node, key: node.nodeAddress }))}
      />
      <ConfirmationModal {...removeConfirmationProps} />
    </>
  )
}
