import React, { useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { FormattedMessage, useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { NodeInfo, NodeInfos } from '../../../services/thorchain/types'
import { ConfirmationModal } from '../../modal/confirmation'
import { ExternalLinkIcon } from '../../uielements/common/Common.styles'
import * as Styled from './BondsTable.styles'
import * as H from './helpers'

type Props = {
  nodes: NodeInfos
  loading?: boolean
  removeNode: (node: Address) => void
  goToNode: (node: Address) => void
  network: Network
  className?: string
}

export const BondsTable: React.FC<Props> = ({ nodes, removeNode, network, goToNode, loading = false, className }) => {
  const intl = useIntl()

  const nodeColumn: ColumnType<NodeInfo> = useMemo(
    () => ({
      key: 'node',
      render: (_, { address }) => <H.NodeAddress network={network} address={address} />,
      title: intl.formatMessage({ id: 'bonds.node' }),
      align: 'left'
    }),
    [network, intl]
  )

  const bondColumn: ColumnType<NodeInfo> = useMemo(
    () => ({
      key: 'bond',
      width: 150,
      title: intl.formatMessage({ id: 'bonds.bond' }),
      render: (_, data) => <H.BondValue data={data} />,
      align: 'right'
    }),
    [intl]
  )

  const awardColumn: ColumnType<NodeInfo> = useMemo(
    () => ({
      key: 'award',
      width: 150,
      title: intl.formatMessage({ id: 'bonds.award' }),
      align: 'right',
      render: (_, data) => <H.AwardValue data={data} />
    }),
    [intl]
  )
  const statusColumn: ColumnType<NodeInfo> = useMemo(
    () => ({
      key: 'status',
      width: 100,
      title: intl.formatMessage({ id: 'bonds.status' }),
      render: (_, data) => <H.Status data={data} />,
      responsive: ['sm'],
      align: 'center'
    }),
    [intl]
  )
  const infoColumn: ColumnType<NodeInfo> = useMemo(
    () => ({
      key: 'info',
      width: 40,
      title: '',
      render: (_, { address }) => <ExternalLinkIcon onClick={() => goToNode(address)} />,
      responsive: ['md'],
      align: 'center'
    }),
    [goToNode]
  )

  const [nodeToRemove, setNodeToRemove] = useState<O.Option<Address>>(O.none)

  const removeColumn: ColumnType<NodeInfo> = useMemo(
    () => ({
      key: 'remove',
      width: 40,
      title: '',
      render: (_, { address }) => (
        <H.Delete
          deleteNode={() => {
            setNodeToRemove(O.some(address))
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
        dataSource={nodes.map((node) => ({ ...node, key: node.address }))}
        loading={loading}
      />
      <ConfirmationModal {...removeConfirmationProps} />
    </>
  )
}
